const companyService = require('../service/company.service');


exports.createCompany = async (req, res) => {
  try {
    if (req.user.role !== 'PAdmin' && req.user.role !== 'EAdmin') {
      return res.status(403).json({ message: 'You do not have permission to create a company.' });
    }
    const { company, employee } = req.body;
    if (!company || !company.company_name || !company.company_email || !company.company_city || !company.company_country || !company.GST_number || !company.company_address) {
      return res.status(400).json({ message: 'All company fields are required.' });
    }
    if (!employee || !employee.user_name || !employee.first_name || !employee.last_name || !employee.email || !employee.phone_number || !employee.password) {
      return res.status(400).json({ message: 'All employee fields are required.' });
    }
    if (employee.password.length !== 6) {
      return res.status(400).json({ message: 'Password must be exactly 6 characters long.' });
    }
    if (employee.phone_number.length !== 10) {
      return res.status(400).json({ message: 'Invalid phone number. Please provide a valid 10-digit phone number.' });
    }
    const adminUserId = req.user.user_id;
    const result = await companyService.createCompany(adminUserId, company, employee);
    res.status(201).json({
      message: 'Company and employee created successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in createCompany controller:', error.message);
    res.status(500).json({
      message: 'Failed to create company and employee',
      error: error.message,
    });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const userRole = req.user.role; 
    const companies = await companyService.getCompaniesByRole(userRole);
    res.status(200).json({
      message: "Companies fetched successfully",
      companies
    });
  } catch (error) {
    console.error('Error fetching companies:', error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};