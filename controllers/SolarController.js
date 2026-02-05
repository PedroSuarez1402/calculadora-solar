const solarController = {
    calcularAhorro: async (req, res) => {
        try {
            // 1. Obtener datos (Ahora aceptamos 'tipo', 'valor' y 'costoUnitario')
            const { lat, lon, valor, tipo, costoUnitario } = req.body;

            if (!lat || !lon || !valor) {
                return res.status(400).json({ error: "Faltan datos requeridos" });
            }

            // 2. Normalizar el consumo a kWh
            let consumoMensualkWh = 0;

            if (tipo === 'dinero') {
                // Si el usuario ingresó Dinero, convertimos a kWh
                // Fórmula: Dinero / Costo del kWh
                // Usamos un costo por defecto de 850 COP si no se envía (promedio aprox Colombia)
                const costoReal = costoUnitario || 850; 
                consumoMensualkWh = valor / costoReal;
            } else {
                // Si ya es kWh, lo usamos directo
                consumoMensualkWh = parseFloat(valor);
            }

            // Validar que no sea 0 o negativo
            if (consumoMensualkWh <= 0) {
                return res.status(400).json({ error: "El consumo debe ser mayor a 0" });
            }

            // 3. Configurar NREL API
            const apiKey = 'DEMO_KEY'; 
            const url = `https://developer.nrel.gov/api/pvwatts/v8?api_key=${apiKey}&lat=${lat}&lon=${lon}&system_capacity=1&azimuth=180&tilt=20&array_type=1&module_type=1&losses=14`;

            // 4. Llamar a NREL
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Error NREL: ${response.statusText}`);
            }

            const data = await response.json();
            const dataNREL = data.outputs;

            // 5. Cálculos Finales
            const produccionAnualPorKW = dataNREL.ac_annual; 
            const consumoAnualUsuario = consumoMensualkWh * 12;

            let sistemaRecomendadoKW = consumoAnualUsuario / produccionAnualPorKW;
            sistemaRecomendadoKW = Math.round(sistemaRecomendadoKW * 100) / 100;

            const numeroPaneles = Math.ceil(sistemaRecomendadoKW / 0.55); // Paneles de 550W

            res.json({
                ubicacion: { lat, lon },
                inputs: {
                    tipoInput: tipo,
                    valorIngresado: valor,
                    consumoCalculadoKWh: Math.round(consumoMensualkWh) // Para mostrarle al usuario cuánto es en kWh
                },
                analisis: {
                    radiacionZona: dataNREL.solrad_annual.toFixed(2),
                    produccionPorKW: produccionAnualPorKW.toFixed(2) + " kWh/año",
                },
                recomendacion: {
                    tamañoSistema: sistemaRecomendadoKW + " kW",
                    panelesSugeridos: numeroPaneles,
                    potenciaPanel: "550W",
                    ahorroEstimado: "100%",
                    mensaje: `Tu consumo estimado es de ${Math.round(consumoMensualkWh)} kWh/mes. Necesitas un sistema de ${sistemaRecomendadoKW} kWp.`
                }
            });

        } catch (error) {
            console.error("Error SolarController:", error.message);
            res.status(500).json({ error: "Error interno al calcular" });
        }
    }
};

export default solarController;