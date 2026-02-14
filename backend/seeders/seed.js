import sequelize from '../config/database.js';
import SystemParam from '../models/SystemParam.js';
import PriceRule from '../models/PriceRule.js';
import Lead from '../models/Lead.js';
import Calculation from '../models/Calculation.js';

const seedDatabase = async () => {
    try {
        // 1. Sincronizar (force: true BORRA las tablas si existen y las crea de nuevo)
        await sequelize.sync({ force: true });
        console.log("✅ Base de datos sincronizada.");

        // 2. Insertar Parámetros Técnicos (RF-03)
        await SystemParam.bulkCreate([
            { key: 'panel_power_w', value: 750, description: 'Potencia del panel en Watts' },
            { key: 'panel_area_m2', value: 3.24, description: 'Área de un panel en m2' },
            { key: 'system_efficiency', value: 0.85, description: 'Factor de eficiencia global (Pérdidas)' },
            { key: 'kwh_price_default', value: 850, description: 'Precio kWh promedio si no se especifica' }
        ]);
        console.log("✅ Parámetros técnicos insertados.");

        // 3. Insertar Reglas de Precios (RF-04)
        // Ejemplo: Sistemas pequeños son más caros por kWp
        await PriceRule.bulkCreate([
            { 
                min_kwp: 0, 
                max_kwp: 3, 
                price_per_kwp: 4800000, 
                label: 'Residencial Pequeño' 
            },
            { 
                min_kwp: 3.01, 
                max_kwp: 10, 
                price_per_kwp: 4200000, 
                label: 'Residencial Estándar' 
            },
            { 
                min_kwp: 10.01, 
                max_kwp: 50, 
                price_per_kwp: 3800000, 
                label: 'Comercial' 
            },
            { 
                min_kwp: 50.01, 
                max_kwp: 9999, 
                price_per_kwp: 3500000, 
                label: 'Industrial' 
            }
        ]);
        console.log("✅ Tabla de precios configurada.");

        process.exit();
    } catch (error) {
        console.error("❌ Error al inicializar la BD:", error);
        process.exit(1);
    }
};

seedDatabase();