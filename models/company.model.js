const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');
const User = require('./user.model');

const Company = sequelize.define('Company', {
    company_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    company_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    company_email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    company_city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    company_country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    GST_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    company_address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    edmin_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    createdBy: { 
        type: DataTypes.INTEGER,
        // references: {
        //     model: User,
        //     key: 'user_id'
        // },
        allowNull: false
    },
}, {
    timestamps: true,
    tableName: 'Companies'
});

Company.belongsTo(User, { foreignKey: 'edmin_id', as: 'Edmin' });
//Company.belongsTo(User, { foreignKey: 'createdBy', as: 'Creator' }); // N

module.exports = Company;
