const EmployeeService = require('../service/employee.service')
const Role = require('../models/role.model')


exports.createEmployee = async (req, res) => {
  const { first_name, last_name, email, password, phone_number, role_name } = req.body;
  if (!first_name || !last_name || !email || !password || !phone_number || !role_name) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }
  const { user_id: adminUserId, role: adminRole } = req.user;
  const roleMappings = {
    'EAdmin': 'Recruiter',
    'PAdmin': 'EAdmin'
  };
  if (roleMappings[adminRole] !== role_name) {
    return res.status(403).json({ message: 'Unauthorized to create this role' });
  }
  try {
    const roleRecord = await Role.findOne({ where: { role_name: role_name } });
    if (!roleRecord) {
      return res.status(403).json({ message: 'Role not found' });
    }
    const role_id = roleRecord.role_id;
    const result = await EmployeeService.createEmployee(adminUserId, req.body, role_id);
    const employeeResponse = {
      emp_id: result.employee.emp_id,
      first_name: result.employee.first_name,
      last_name: result.employee.last_name,
      email: result.employee.email,
      company_id: result.employee.company_id,
      user_id: result.employee.user_id,
      //createdBy: result.employee.createdBy,
      createdAt: result.employee.createdAt,
      updatedAt: result.employee.updatedAt
    };
    res.status(201).json({
      message: 'Employee created successfully',
      employee: employeeResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const { role_id, company_id } = req.params;
    const employees = await EmployeeService.getEmployees(role_id, company_id);
    if (!employees || employees.length === 0) {
      return res.status(404).json({ message: 'No employees found.' });
    }
    res.status(200).json({
      message: 'Employees fetched successfully',
      data: employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};