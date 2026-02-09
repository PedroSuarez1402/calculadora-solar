const solarController = {
    calcularAhorro: async (req, res) => {
        try {
            const { lat, lon, valor, tipo, costoUnitario } = req.body;

            if (!lat || !lon || !valor) {
                return res.status(400).json({ error: "Faltan datos requeridos" });
            }

            // --- CONFIGURACIÓN CONSERVADORA ---
            const FACTOR_COBERTURA = 0.6; // Diseñamos para cubrir solo el 70% del consumo (Estándar residencial)
            const POTENCIA_PANEL_KW = 0.55; // 550W

            // --- 1. NORMALIZACIÓN DE DATOS ---
            const tarifaFinal = costoUnitario || 650;
            let consumoMensualkWh = 0;

            if (tipo === 'dinero') {
                consumoMensualkWh = valor / tarifaFinal;
            } else {
                consumoMensualkWh = parseFloat(valor);
            }

            if (consumoMensualkWh <= 0) return res.status(400).json({ error: "Consumo inválido" });

            // --- 2. PETICIÓN A NREL ---
            const apiKey = process.env.NREL_API_KEY || 'DEMO_KEY'; 
            const url = `https://developer.nrel.gov/api/pvwatts/v8?api_key=${apiKey}&lat=${lat}&lon=${lon}&system_capacity=1&azimuth=180&tilt=20&array_type=1&module_type=1&losses=14`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error NREL: ${response.statusText}`);
            
            const data = await response.json();
            const dataNREL = data.outputs;

            // --- 3. CÁLCULOS TÉCNICOS ---
            
            // Rendimiento específico (kWh/año por cada kW instalado)
            const rendimientoPorKW = dataNREL.ac_annual; 
            
            // Consumo anual
            const consumoAnualUsuario = consumoMensualkWh * 12;

            // Potencia OBJETIVO (Aplicando el factor conservador del 70%)
            const consumoObjetivo = consumoAnualUsuario * FACTOR_COBERTURA;
            const potenciaTeoricaNecesaria = consumoObjetivo / rendimientoPorKW;

            // Número de Paneles (Redondeamos hacia arriba para no quedar cortos del objetivo)
            let numeroPaneles = Math.ceil(potenciaTeoricaNecesaria / POTENCIA_PANEL_KW);
            
            // Mínimo 1 panel siempre
            if (numeroPaneles < 1) numeroPaneles = 1;

            // Sistema Real
            const sistemaRecomendadoKW = numeroPaneles * POTENCIA_PANEL_KW;

            // Generación Real Estimada
            const generacionRealAnual = sistemaRecomendadoKW * rendimientoPorKW;
            const generacionRealMensual = generacionRealAnual / 12;

            // --- 4. CÁLCULOS FINANCIEROS ---
            
            // A. Situación Actual
            const gastoMensualActual = consumoMensualkWh * tarifaFinal;
            const gastoAnualActual = gastoMensualActual * 12;

            // B. Ahorro Real
            // El ahorro es la energía generada (limitada al consumo real si hay excedentes no remunerados)
            const energiaAhorradaMensual = Math.min(consumoMensualkWh, generacionRealMensual);
            const ahorroMensual = energiaAhorradaMensual * tarifaFinal;
            const ahorroAnual = ahorroMensual * 12;

            // C. Proyección a 25 años (Más conservadora)
            // Factor degradación más agresivo (0.8 promedio global en 25 años)
            const factorDegradacion = 0.85; 
            const ahorro25Anios = (ahorroAnual * 25) * factorDegradacion;

            // D. Impacto Ambiental
            const co2Evitado = generacionRealAnual * 0.0005;

            // Porcentaje real cubierto
            const porcentajeCubierto = Math.round((generacionRealMensual / consumoMensualkWh) * 100);

            // --- 5. RESPUESTA ---
            res.json({
                ubicacion: { lat, lon },
                inputs: {
                    consumoKWh: Math.round(consumoMensualkWh),
                    tarifaAplicada: tarifaFinal
                },
                situacionActual: {
                    gastoMensual: Math.round(gastoMensualActual),
                    gastoAnual: Math.round(gastoAnualActual)
                },
                situacionSolar: {
                    ahorroMensual: Math.round(ahorroMensual),
                    ahorroAnual: Math.round(ahorroAnual),
                    ahorro25Anios: Math.round(ahorro25Anios),
                    co2Toneladas: co2Evitado.toFixed(2)
                },
                sistema: {
                    tamanoKW: sistemaRecomendadoKW.toFixed(2),
                    numeroPaneles: numeroPaneles,
                    generacionAnualEstimada: Math.round(generacionRealAnual)
                },
                mensaje: `Diseñamos un sistema eficiente para cubrir el ${porcentajeCubierto}% de tu consumo con ${numeroPaneles} paneles.`
            });

        } catch (error) {
            console.error("Error SolarController:", error.message);
            res.status(500).json({ error: "Error interno al calcular" });
        }
    }
};

export default solarController;