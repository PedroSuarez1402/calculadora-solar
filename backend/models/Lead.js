import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Lead extends Model {}

Lead.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        validate: { isEmail: true }
    },
    address: {
        type: DataTypes.STRING
    },
    city: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    modelName: 'Lead',
    tableName: 'leads'
});

export default Lead;