const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');
const User = require('../models/user.model');
// const Employee = require('../models/employee.model');
// const Company = require('../models/company.model');
const Candidate = require('../models/candidate.model');

const CandidateOffer = sequelize.define('candidateOffer', {
    offer_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      candidate_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'candidates', 
          key: 'candidate_id'
        }
      },
      year_of_experience: {
        type: DataTypes.INTEGER
      },
      job_level: {
        type: DataTypes.STRING
      },
      date_of_joining: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        
      },
      designation: {
        type: DataTypes.STRING
      },
      department: {
        type: DataTypes.STRING
      },
      team: {
        type: DataTypes.STRING
      },
      base_location: {
        type: DataTypes.STRING
      },
      work_location: {
        type: DataTypes.STRING
      },
      work_model: {
        type: DataTypes.STRING
      },
      offer_expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      salary_ctc_pa: {
        type: DataTypes.FLOAT
      },
      fixed_component_pa: {
        type: DataTypes.FLOAT
      },
      variable_component_pa: {
        type: DataTypes.FLOAT
      },
      variable_payout_frequency: {
        type: DataTypes.STRING
      },
      approx_take_home_pm: {
        type: DataTypes.FLOAT
      },
      createdBy: {
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
      timestamps: true
    });


CandidateOffer.belongsTo(Candidate, { foreignKey: 'candidate_id' });
// CandidateOffer.belongsTo(User, { foreignKey: 'user_id' });
// CandidateOffer.belongsTo(Employee, { foreignKey: 'emp_id' });
// CandidateOffer.belongsTo(Company, { foreignKey: 'company_id' });
CandidateOffer.belongsTo(User, { foreignKey: 'createdBy', as: 'Creator' });
CandidateOffer.belongsTo(User, { foreignKey: 'lastUpdatedBy', as: 'Updater' });


// Associations

module.exports = CandidateOffer;