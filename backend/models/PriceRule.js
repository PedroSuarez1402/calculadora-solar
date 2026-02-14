import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class PriceRule extends Model{}

PriceRule.init({
    min_kwp: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    max_kwp : {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    price_per_kwp : {
        type: DataTypes.DECIMAL(15, 2), // Manejo preciso de dinero
        allowNull: false
    },
    label : {
        type: DataTypes.STRING,
    }
}, {
    sequelize,
    modelName: 'PriceRule',
    timestamps: false
})

export default PriceRule;