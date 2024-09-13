const CandidateService = require('../service/candidate.service');
const EmployeeService = require('../service/employee.service');
const CompanyService = require('../service/company.service');
const UserService = require('../service/user.service');
const CandidateOfferService = require('../service/candidateOffer.sevice');
const Role = require('../models/role.model');


exports.createCandidate = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const { first_name, last_name, profilePicURL, email, phone_number, user_name, password, offerDetails } = req.body;
    const { user_id, role } = req.user;
    if (!first_name || !last_name || !profilePicURL || !email || !phone_number || !user_name || !password || !offerDetails) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const candidateRole = await Role.findOne({ where: { role_name: 'Candidate' } });
    if (!candidateRole) {
      return res.status(404).json({ message: "Candidate role not found." });
    }
    const candidateRoleId = candidateRole.role_id;
    const userData = {
      user_name,
      phone_number,
      email,
      password,
      role_id: candidateRoleId 
    };
    const newUser = await UserService.createUser(userData);
    let company;
    let employee;
    if (role === 'EAdmin') {
      company = await CompanyService.getCompany({ edmin_id: user_id });
      employee = await EmployeeService.getEmployee({ user_id });
      if (employee) {
        emp_id = employee.emp_id;  
      }
    } else if (role === 'Recruiter') {
      employee = await EmployeeService.getEmployee({ user_id });
      if (!employee) {
        return res.status(404).json({ message: "Employee not found." });
      }
      emp_id = employee.emp_id;
      company = await CompanyService.getCompany({ company_id: employee.company_id });
    } else {
      return res.status(403).json({ message: 'Unauthorized role to create candidate.' });
    }
    
    if (!company) {
      return res.status(404).json({ message: 'No companies found for this user' });
    }
    const company_id = company.company_id;

    if (role === 'Recruiter') {
      if (!employee) {
        return res.status(404).json({ message: "Employee not found." });
      }
    }
    const candidateData = {
      first_name,
      last_name,
      profilePicURL,
      emp_id,
      company_id,
      role_id: candidateRoleId,
      user_id: newUser.user_id,
      createdOn: new Date(),
      lastUpdatedBy: user_id,
      lastUpdatedOn: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const candidate = await CandidateService.createCandidate(candidateData);
    const offerData = {
      candidate_id: candidate.candidate_id,
      year_of_experience: offerDetails.year_of_experience,
      job_level: offerDetails.job_level,
      date_of_joining: offerDetails.date_of_joining,
      designation: offerDetails.designation,
      department: offerDetails.department,
      team: offerDetails.team,
      base_location: offerDetails.base_location,
      work_location: offerDetails.work_location,
      work_model: offerDetails.work_model,
      offer_expiry_date: offerDetails.offer_expiry_date,
      salary_ctc_pa: offerDetails.salary_ctc_pa,
      fixed_component_pa: offerDetails.fixed_component_pa,
      variable_component_pa: offerDetails.variable_component_pa,
      variable_payout_frequency: offerDetails.variable_payout_frequency,
      approx_take_home_pm: offerDetails.approx_take_home_pm,
      createdBy: user_id,
      createdOn: new Date(),
      lastUpdatedBy: user_id,
      lastUpdatedOn: new Date()
    };
    const candidateOffer = await CandidateOfferService.createCandidateOffer(offerData);

    res.status(201).json({
      message: 'Candidate and offer created successfully',
      data: {
        candidate,
        offer: candidateOffer
      }
    });
  } catch (error) {
    console.error('Error in createCandidate controller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const { user_id, role } = req.user;
    let candidates;
    let companyIds = [];
    if (role === 'PAdmin') {
      const companies = await CompanyService.getCompanies({ edmin_id: user_id });
      console.log('Companies response:', companies);
      if (!Array.isArray(companies)) {
        return res.status(500).json({ message: 'Unexpected error: Companies data is not an array' });
      }
      if (companies.length === 0) {
        return res.status(404).json({ message: 'No companies found for this PAdmin' });
      }
      companyIds = companies.map(company => company.company_id);
      console.log('Company IDs:', companyIds);
      candidates = await CandidateService.getCandidates({ company_id: companyIds });
      
    } else if (role === 'EAdmin') {
      const companies = await CompanyService.getCompanies({ edmin_id: user_id });
      console.log('Companies response:', companies);
      if (!Array.isArray(companies)) {
        return res.status(500).json({ message: 'Unexpected error: Companies data is not an array' });
      }
      if (companies.length === 0) {
        return res.status(404).json({ message: 'No companies found for this EAdmin' });
      }
      companyIds = companies.map(company => company.company_id);
      console.log('Company IDs:', companyIds);
      candidates = await CandidateService.getCandidates({ company_id: companyIds });
    } else if (role === 'Recruiter') {
      candidates = await CandidateService.getCandidates({ user_id: user_id });
    } else {
      return res.status(403).json({ message: 'Unauthorized role' });
    }
    console.log('Candidates:', candidates);
    
    if (!candidates || candidates.length === 0) {
      return res.status(404).json({ message: 'No candidates found for the specified criteria' });
    }
    const candidatesWithOffersPromises = candidates.map(async candidate => {
      const offers = await CandidateOfferService.getCandidatesOffer({ candidate_id: candidate.candidate_id });
      return {
        ...candidate.dataValues,
        offers
      };
    });
    const candidatesWithOffers = await Promise.all(candidatesWithOffersPromises);
    res.status(200).json({
      message: 'Candidates fetched successfully',
      candidates: candidatesWithOffers
    });
  } catch (error) {
    console.error('Error in getCandidates controller:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


exports.fetchCandidates = async (req, res) => {
  try {
    console.log('Fetching candidates for user:', req.user);
    const candidates = await CandidateService.getCandidatees();
    console.log('Candidates retrieved:', candidates);
    if (candidates.length === 0) {
      return res.status(404).json({ message: 'No candidates found.' });
    }
    return res.status(200).json({
      message: 'Candidates retrieved successfully.',
      data: candidates,
    });
  } catch (error) {
    console.error('Error in fetchCandidates controller:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
