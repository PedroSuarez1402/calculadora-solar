const solarController = {
    calcularAhorro: async (req, res) => {
        try {
            const { lat, lon, valor, tipo, costoUnitario } = req.body;

            if (!lat || !lon || !valor) {
                return res.status(400).json({ error: "Faltan datos requeridos" });
            }

            // --- 1. NORMALIZACIÓN DE DATOS ---
            // Definimos tarifa: Si el usuario la envió, la usamos. Si no, 650 COP por defecto.
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
            const generacionAnualPorKW = dataNREL.ac_annual; 
            const consumoAnualUsuario = consumoMensualkWh * 12;

            // Tamaño del sistema para cubrir el 100% (o cercano)
            let sistemaRecomendadoKW = consumoAnualUsuario / generacionAnualPorKW;
            sistemaRecomendadoKW = Math.round(sistemaRecomendadoKW * 100) / 100;

            const numeroPaneles = Math.ceil(sistemaRecomendadoKW / 0.55); // Paneles 550W

            // Energía real que va a generar el sistema recomendado (aprox)
            const generacionRealAnual = sistemaRecomendadoKW * generacionAnualPorKW;
            const generacionRealMensual = generacionRealAnual / 12;

            // --- 4. CÁLCULOS FINANCIEROS (LO NUEVO) ---
            
            // A. Situación Actual (Sin Paneles)
            const gastoMensualActual = consumoMensualkWh * tarifaFinal;
            const gastoAnualActual = gastoMensualActual * 12;

            // B. Situación Con Paneles
            // Asumimos Net Metering: Si generas lo mismo que consumes, pagas 0 (teóricamente, sin contar cargo fijo)
            // Si generas menos de lo que consumes, pagas la diferencia.
            const deficitMensualkWh = Math.max(0, consumoMensualkWh - generacionRealMensual);
            const nuevoGastoMensual = deficitMensualkWh * tarifaFinal;

            // C. Ahorros
            const ahorroMensual = gastoMensualActual - nuevoGastoMensual;
            const ahorroAnual = ahorroMensual * 12;
            
            // Proyección a 25 años (Sin inflación para simplificar, o podrías multiplicar por un factor)
            const ahorro25Anios = ahorroAnual * 25; 

            // D. Impacto Ambiental (Factor aprox: 0.0004 toneladas CO2 por kWh)
            const co2Evitado = generacionRealAnual * 0.0004;

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
                    tamanoKW: sistemaRecomendadoKW,
                    numeroPaneles: numeroPaneles,
                    potenciaPanel: "550W",
                    generacionAnualEstimada: Math.round(generacionRealAnual)
                },
                mensaje: `Con un sistema de ${sistemaRecomendadoKW} kWp podrías cubrir casi el 100% de tu factura.`
            });

        } catch (error) {
            console.error("Error SolarController:", error.message);
            res.status(500).json({ error: "Error interno al calcular" });
        }
    }
};

export default solarController;