import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Lead from './Lead.js';

class Calculation extends Model {}

Calculation.init({
    consumption_kwh: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    roof_area: { // Nuevo requerimiento RF-01
        type: DataTypes.FLOAT 
    },
    suggested_system_kwp: {
        type: DataTypes.FLOAT
    },
    panel_count: {
        type: DataTypes.INTEGER
    },
    estimated_price: {
        type: DataTypes.DECIMAL(15, 2)
    },
    estimated_savings_monthly: {
        type: DataTypes.DECIMAL(15, 2)
    },
    roi_years: {
        type: DataTypes.FLOAT // Retorno de inversión
    }
}, {
    sequelize,
    modelName: 'Calculation',
    tableName: 'calculations'
});

// Relación: Un Lead tiene muchos Cálculos
Lead.hasMany(Calculation, { foreignKey: 'leadId' });
Calculation.belongsTo(Lead, { foreignKey: 'leadId' });

export default Calculation;