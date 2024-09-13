const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');
const Employee = require('../models/employee.model');
const Company = require('../models/company.model');
const User = require('../models/user.model');


const Candidate = sequelize.define('Candidate', {
    candidate_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Company, 
            key: 'company_id'
        }
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    profilePicURL: {
        type: DataTypes.STRING,
        allowNull: false
    },
    emp_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Employee, 
            key: 'emp_id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, 
            key: 'user_id'
        }
    },
    createdOn: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    lastUpdatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    lastUpdatedOn: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    },
}, {
    timestamps: true,
});

Candidate.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
Candidate.belongsTo(Company, { foreignKey: 'company_id', as: 'Company' });
Candidate.belongsTo(Employee, { foreignKey: 'emp_id', as: 'Employee' });
Candidate.belongsTo(User, { foreignKey: 'lastUpdatedBy', as: 'Updater' });



module.exports = Candidate;
