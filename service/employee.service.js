const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const Employee = require('../models/employee.model');
const Role = require('../models/role.model');
const Company = require('../models/company.model');


exports.createEmployee = async (adminUserId, employeeData, roleId) => {
  try {
    const { first_name, last_name, email, role_name, password, phone_number } = employeeData;
    if (!first_name || !last_name || !email || !password || !phone_number) {
      throw new Error('All employee data fields are required.');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      user_name: `${first_name} ${last_name}`,
      email,
      phone_number,
      password: hashedPassword,
      role_id: roleId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const company = await Company.findOne({ where: { edmin_id: adminUserId } });
    if (!company) {
      throw new Error('Company not found for the given admin user.');
    }
    const employee = await Employee.create({
      first_name,
      last_name,
      email,
      phone_number,
      user_id: user.user_id,
      company_id: company.company_id,
      //createdBy: adminUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { employee };
  } catch (error) {
    console.error('Error creating employee:', error.message);
    throw error;
  }
};
exports.getEmployee = async (query) => {
  try {
    const employee = await Employee.findOne({ where: query });
    return employee;
  } catch (error) {
    throw new Error(`Error while fetching employee: ${error.message}`);
  }
};

exports.getEmployees = async (role_id, company_id) => {
  try {
    const query = {};
    if (role_id) {
      query.role_id = role_id;
    }
    if (company_id) {
      query.company_id = company_id;
    }
    const employees = await Employee.findAll({where: query });
    return employees;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw new Error('Error fetching employees');
  }
};

  
