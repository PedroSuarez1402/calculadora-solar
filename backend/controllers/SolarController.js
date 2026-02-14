import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import SystemParam from '../models/SystemParam.js';
import PriceRule from '../models/PriceRule.js';
import Lead from '../models/Lead.js';
import Calculation from '../models/Calculation.js';

const solarController = {
    calcularAhorro: async (req, res) => {
        // Iniciamos transacción
        const t = await sequelize.transaction();

        try {
            const { 
                lat, lon, 
                valor,          // El consumo en kWh (Dato obligatorio)
                costoUnitario,  // El precio del kWh que pone el usuario (Dato obligatorio)
                areaDisponible, // (Dato obligatorio/opcional según tu front)
                cliente         // (Opcional) Solo viene si el usuario ya llenó el formulario de contacto
            } = req.body;

            // Validaciones básicas
            if (!lat || !lon || !valor) {
                await t.rollback();
                return res.status(400).json({ error: "Faltan datos técnicos requeridos (Ubicación o Consumo)" });
            }

            // --- 1. CARGAR PARÁMETROS DE BD ---
            const paramsDB = await SystemParam.findAll();
            /* console.log('DEBUG - paramsDB raw:', JSON.stringify(paramsDB, null, 2)); */
            const config = paramsDB.reduce((acc, param) => {
                acc[param.key] = param.value;
                return acc;
            }, {});
            /* console.log('DEBUG - config object:', config); */
            
            const POTENCIA_PANEL_W = config.panel_power_w || 550;
            const AREA_PANEL_M2 = config.panel_area_m2 || 2.2;
            const EFICIENCIA_SISTEMA = config.system_efficiency || 0.85;
            const TARIFA_DEFECTO = config.kwh_price_default || 850;
            const POTENCIA_PANEL_KW = POTENCIA_PANEL_W / 1000;
            const FACTOR_COBERTURA = 1.0; // Intentamos cubrir el 100% si el área lo permite

            // --- 2. PREPARAR DATOS DE ENTRADA ---
            // Usamos el precio que dio el usuario, o el defecto si vino vacío
            const tarifaFinal = parseFloat(costoUnitario) || TARIFA_DEFECTO;
            const consumoMensualkWh = parseFloat(valor);

            if (isNaN(consumoMensualkWh) || consumoMensualkWh <= 0) {
                await t.rollback();
                return res.status(400).json({ error: "El consumo en kWh debe ser un número válido." });
            }

            // --- 3. CONSULTA A PVGIS ---
            const url = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lon}&peakpower=1&loss=${(1 - EFICIENCIA_SISTEMA)*100}&angle=10&outputformat=json`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error PVGIS: ${response.statusText}`);
            
            const data = await response.json();
            const rendimientoAnualPorKW = data.outputs?.totals?.fixed?.E_y; 
            
            if (!rendimientoAnualPorKW) throw new Error("PVGIS no devolvió datos válidos");

            // --- 4. DIMENSIONAMIENTO ---
            
            // A. Necesidad Energética
            const consumoAnual = consumoMensualkWh * 12;
            const potenciaRequeridaConsumo = consumoAnual / rendimientoAnualPorKW;
            const panelesPorConsumo = Math.ceil(potenciaRequeridaConsumo / POTENCIA_PANEL_KW);

            // B. Limitante de Espacio (Área)
            let panelesPorArea = 9999; // Infinito por defecto
            if (areaDisponible && areaDisponible > 0) {
                panelesPorArea = Math.floor(areaDisponible / AREA_PANEL_M2);
            }

            // C. Selección del Sistema
            // Elegimos el menor: no podemos instalar más de lo que cabe, ni más de lo necesario
            let numeroPaneles = Math.min(panelesPorConsumo, panelesPorArea);
            if (numeroPaneles < 1) numeroPaneles = 1;

            const sistemaKWp = numeroPaneles * POTENCIA_PANEL_KW;

            // --- 5. RESULTADOS FINANCIEROS ---
            const generacionAnualReal = sistemaKWp * rendimientoAnualPorKW;
            const generacionMensualReal = generacionAnualReal / 12;

            // Ahorro (Limitado al consumo real para no inflar expectativas)
            const energiaAprovechada = Math.min(consumoMensualkWh, generacionMensualReal);
            
            // Aquí usamos la tarifaFinal que incluye el dato del usuario
            const ahorroMensualEstimado = energiaAprovechada * tarifaFinal;
            const ahorroAnualEstimado = ahorroMensualEstimado * 12;

            // --- 6. MOTOR DE PRECIOS ---
            const reglaPrecio = await PriceRule.findOne({
                where: {
                    min_kwp: { [Op.lte]: sistemaKWp },
                    max_kwp: { [Op.gte]: sistemaKWp }
                }
            });

            let precioTotalEstimado = 0;
            if (reglaPrecio) {
                precioTotalEstimado = sistemaKWp * reglaPrecio.price_per_kwp;
            } else {
                // Precio base genérico si se sale de los rangos configurados
                precioTotalEstimado = sistemaKWp * 3800000; 
            }

            // --- 7. GUARDADO DE LEAD (OPCIONAL) ---
            // Esta lógica soporta tu requerimiento: "primero dar resultado, luego opcionalmente pedir datos"
            // Si el frontend llama a esta API SIN cliente, solo devuelve datos (simulación).
            // Si el frontend llama CON cliente (segundo paso), guarda en la BD.
            
            let leadGuardadoId = null;

            if (cliente && cliente.nombre && cliente.telefono) {
                
                // 1. Crear o Actualizar Lead
                // (Podrías buscar por email si quieres evitar duplicados, aquí creamos uno nuevo simple)
                const nuevoLead = await Lead.create({
                    full_name: cliente.nombre,
                    phone: cliente.telefono,
                    email: cliente.email || 'no-email',
                    address: cliente.direccion || '',
                    city: 'Desde Web'
                }, { transaction: t });

                // 2. Guardar el Cálculo Histórico
                // Mapeamos los datos a las columnas de tu tabla 'Calculations'
                await Calculation.create({
                    leadId: nuevoLead.id,
                    consumption_kwh: consumoMensualkWh, 
    
                    consumption_type: 'kwh', // Asegúrate que tu modelo tenga esta columna, si no, bórrala
                    roof_area: areaDisponible ? parseFloat(areaDisponible) : 0,
                    suggested_system_kwp: sistemaKWp,
                    panel_count: numeroPaneles,
                    estimated_price: precioTotalEstimado,
                    estimated_savings_monthly: ahorroMensualEstimado,
                    roi_years: (ahorroAnualEstimado > 0) ? (precioTotalEstimado / ahorroAnualEstimado) : 0
                }, { transaction: t });

                leadGuardadoId = nuevoLead.id;
            }

            await t.commit();

            // --- 8. RESPUESTA ---
            res.json({
                ok: true,
                leadId: leadGuardadoId, // Si es null, es que fue una simulación anónima
                ubicacion: { lat, lon },
                inputs: {
                    consumoKWh: Math.round(consumoMensualkWh),
                    tarifaUsada: tarifaFinal,
                    areaDisponible: areaDisponible || 'No especificada',
                    capacidadTechoPaneles: (areaDisponible) ? panelesPorArea : 'Ilimitada'
                },
                sistema: {
                    tamanoKW: sistemaKWp.toFixed(2),
                    numeroPaneles: numeroPaneles,
                    potenciaPanel: `${POTENCIA_PANEL_W}W`,
                    areaOcupada: (numeroPaneles * AREA_PANEL_M2).toFixed(1) + " m²"
                },
                financiero: {
                    inversionTotalEstimada: precioTotalEstimado,
                    ahorroMensual: Math.round(ahorroMensualEstimado),
                    ahorroAnual: Math.round(ahorroAnualEstimado),
                    retornoInversionAnios: (ahorroAnualEstimado > 0) ? (precioTotalEstimado / ahorroAnualEstimado).toFixed(1) : "N/A"
                },
                ambiental: {
                    co2Toneladas: (generacionAnualReal * 0.0005).toFixed(2)
                },
                mensaje: (panelesPorArea < panelesPorConsumo) 
                    ? `Tu techo limita el sistema. Con ${numeroPaneles} paneles cubrirás el ${Math.round((generacionMensualReal/consumoMensualkWh)*100)}% de tu consumo.`
                    : `Podemos cubrir el 100% de tu consumo con un sistema de ${numeroPaneles} paneles.`
            });

        } catch (error) {
            await t.rollback();
            console.error("Error SolarController:", error);
            res.status(500).json({ error: "Error interno al calcular", detalle: error.message });
        }
    }
};

export default solarController;