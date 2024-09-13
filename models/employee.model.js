const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');
const Company = require('../models/company.model');
const User = require('./user.model');

const Employee = sequelize.define('Employee', {
    emp_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    first_name: {
        type: DataTypes.STRING,
    },
    last_name: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique:true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Company,
            key: 'company_id'
        },
       
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    // createdBy: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    //     // references: {
    //     //     model: User,
    //     //     key: 'user_id'
    //     // }
    // }

}, {
    timestamps: true,
});
Employee.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
Employee.belongsTo(Company, { foreignKey: 'company_id', as: 'Company' });
//Employee.belongsTo(User, { foreignKey: 'createdBy', as: 'Creator' });

module.exports = Employee;
