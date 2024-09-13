const Company = require('../models/company.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const bcrypt = require('bcrypt');


exports.createCompany = async (adminUserId, companyData, employeeData) => {
  try {
    const adminUser = await User.findOne({ where: { user_id: adminUserId } });
    if (!adminUser) {
      throw new Error('Admin user not found.');
    }
    const adminRole = await Role.findOne({ where: { role_id: adminUser.role_id } });
    if (!adminRole) {
      throw new Error('Role for admin user not found.');
    }
    if (adminRole.role_name !== 'PAdmin' && adminRole.role_name !== 'EAdmin') {
      throw new Error('User does not have the required role to create a company.');
    }
    const company = await Company.create({
      ...companyData,
      createdBy: adminUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const eAdminRole = await Role.findOne({ where: { role_name: 'EAdmin' } });
    if (!eAdminRole) {
      throw new Error('EAdmin role not found.');
    }
    const hashedPassword = await bcrypt.hash(employeeData.password, 10);
    const user = await User.create({
      user_name: employeeData.user_name,
      email: employeeData.email,
      phone_number: employeeData.phone_number,
      password: hashedPassword,
      role_id: eAdminRole.role_id, 
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const employee = await Employee.create({
      ...employeeData,
      user_id: user.user_id,
      company_id: company.company_id,
      createdBy: adminUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await Company.update(
      { edmin_id: user.user_id },
      { where: { company_id: company.company_id } }
    );
    const employeeDetails = {
      ...employee.get(),
      email: user.email,
      role_name: eAdminRole.role_name,
    };
    return { company, employee: employeeDetails };
  } catch (error) {
    console.error('Error creating company and employee:', error.message);
    throw error;
  }
};

exports.getCompaniesByRole = async (userRole) => {
  try {
    const role = await Role.findOne({ where: { role_name: userRole } });
    if (!role) {
      throw new Error(`${userRole} role not found`);
    }
    const roleId = role.role_id;
    const users = await User.findAll({
      where: { role_id: roleId }
    });
    const userIds = users.map(user => user.user_id);
    const companies = await Company.findAll({
      where: { createdBy: userIds }
    });
    return companies;
  } catch (error) {
    throw new Error(`Error while fetching companies: ${error.message}`);
  }
};

exports.getCompany = async (query) => {
  try {
    console.log('Query for getCompany:', query);
    const company = await Company.findOne({ where: query });
    return company;
  } catch (error) {
    throw new Error(`Error while fetching company: ${error.message}`);
  }
};

exports.getCompanies = async (filter) => {
  try {
    return await Company.findAll({ where: filter });
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};