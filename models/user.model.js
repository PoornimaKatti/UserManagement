const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');
const Role = require('./role.model');
const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Role,
            key: 'role_id'
        }
    }
}, {
    timestamps: true,
    tableName: 'users'
});

User.belongsTo(Role, { foreignKey: 'role_id', as: 'Role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'Users' });
User.belongsTo(Role, { as: 'role', foreignKey: 'role_id' });


module.exports = User;
