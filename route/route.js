const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const authController = require('../controller/auth.controller');
const companyController = require('../controller/company.controller');
const employeeController = require('../controller/employee.controller');
const candidateController = require('../controller/candidate.controller');
const candidateOfferController = require('../controller/candidateOffer.controller');
const {authenticateToken}  = require('../middleware/authMiddleware');

router.post('/register', userController.Register);
router.post('/loginwithpassword', userController.loginWithPassword);
router.post('/sendotp',authController.sendOTP);
router.post('/loginwithotp',authController.loginWithOTP);
router.post('/changePassword',userController.changePassword);
router.post('/refreshToken',authenticateToken, userController.refreshLoginToken);
router.post('/loginwithtoken',authenticateToken,userController.loginWithAuthtoken);

router.post('/company',authenticateToken,companyController.createCompany);
router.get('/companies',authenticateToken,companyController.getCompanies);
router.post('/employee', authenticateToken,employeeController.createEmployee);
router.get('/employee/:role_name?/:company_id?',authenticateToken,employeeController.getEmployees);
router.post('/candidate',authenticateToken,candidateController.createCandidate);
router.get('/candidates',authenticateToken,candidateController.getCandidates);
router.get('/candidates/expired', authenticateToken,candidateOfferController.getExpiredCandidateOffers);
router.get('/candidates/active', authenticateToken,candidateOfferController.getActiveCandidateOffers);
router.get('/candidatees', authenticateToken, candidateController.fetchCandidates);
router.get('/expired', authenticateToken,candidateOfferController.getExpiredOffers);
// router.post('/candidateOffer', authenticateToken, candidateOfferController.createCandidateOffer);
// router.get('/candidateOffers', authenticateToken, candidateOfferController.getCandidateOffers);


module.exports = router;