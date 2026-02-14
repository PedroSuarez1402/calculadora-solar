import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class SystemParam extends Model{}

SystemParam.init({
    key: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    value: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    modelName: 'SystemParam',
    timestamps: false
});

export default SystemParam;