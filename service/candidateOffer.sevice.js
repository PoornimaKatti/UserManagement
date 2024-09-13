const CandidateOffer = require('../models/candidateOffer.model');
const Company = require('../models/company.model');
const User = require('../models/user.model');
const { Op } = require('sequelize');
const Candidate = require('../models/candidate.model');
const Role = require('../models/role.model');

exports.createCandidateOffer = async (candidateOfferData) => {
  try {
    const candidateOffer = await CandidateOffer.create(candidateOfferData);
    return candidateOffer;
  } catch (error) {
    console.error('Error creating candidate offer:', error);
    throw new Error('Could not create candidate offer');
  }
};

exports.getCandidatesOffer = async (query) => {
  try {
    const candidateOffer = await CandidateOffer.findAll({ where: query });
    return candidateOffer;
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw new Error(`Error while fetching candidates: ${error.message}`);
  }
};

exports.fetchExpiredCandidateOffers = async () => {
  const now = new Date();
  try {
    return await CandidateOffer.findAll({
      where: {
        date_of_joining: {
          [Op.lt]: now
        }
      },
      include: [
        {
          model: Candidate,
          as: 'Candidate',
          attributes: ['first_name', 'last_name', 'user_id', 'company_id'],
          include: [
            {
              model: Company,
              as: 'Company',
              attributes: ['company_name']
            }
          ]
        }
      ],
      attributes: [
        'date_of_joining',
        'year_of_experience'
      ]
    });
  } catch (error) {
    throw new Error('Error fetching expired candidate offers: ' + error.message);
  }
};


exports.fetchActiveCandidateOffers = async () => {
  const now = new Date();
  try {
    return await CandidateOffer.findAll({
      where: {
        date_of_joining: {
          [Op.gte]: now
        }
      },
      include: [
        {
          model: Candidate,
          as: 'Candidate',
          attributes: ['first_name', 'last_name', 'user_id', 'company_id'],
          include: [
            {
              model: Company,
              as: 'Company',
              attributes: ['company_name']
            }
          ]
        }
      ],
      attributes: [
        'date_of_joining',
        'year_of_experience'
      ]
    });
  } catch (error) {
    throw new Error('Error fetching active candidate offers: ' + error.message);
  }
};

// exports.getExpiredOffers = async () => {
//   const now = new Date();
//   try {
//     const expiredOffers = await CandidateOffer.findAll({
//       where: {
//         offer_expiry_date: {
//           [Op.lt]: now
//         }
//       },
//       include: [
//         {
//           model: Candidate,
//           as: 'Candidate',
//           attributes: ['first_name', 'last_name', 'user_id', 'company_id', 'lastUpdatedBy']
//         }
//       ]
//     });
//     if (expiredOffers.length === 0) {
//       return {
//         message: 'No expired offers.',
//         result: {
//           data: []
//         }
//       };
//     }
//     const companyIds = Array.from(new Set(expiredOffers.map(offer => offer.Candidate.company_id)));
//     const hrIds = Array.from(new Set(expiredOffers.map(offer => offer.Candidate.lastUpdatedBy)));
//     const candidateUserIds = Array.from(new Set(expiredOffers.map(offer => offer.Candidate.user_id)));
//     const companies = await Company.findAll({
//       where: {
//         company_id: {
//           [Op.in]: companyIds
//         }
//       }
//     });
//     const companyMap = {};
//     companies.forEach(company => {
//       companyMap[company.company_id] ={
//         name: company.company_name,
//         email: company.company_email,
//         city: company.company_city,
//         country: company.company_country,
//         address: company.company_address
//       }
//     });
//     const hrUsers = await User.findAll({
//       where: {
//         user_id: {
//           [Op.in]: hrIds
//         }
//       },
//       attributes: ['user_id', 'user_name']
//     });
//     const hrMap = {};
//     hrUsers.forEach(hr => {
//       hrMap[hr.user_id] = hr.user_name;
//     });
//     const candidateUsers = await User.findAll({
//       where: {
//         user_id: {
//           [Op.in]: candidateUserIds
//         }
//       },
//       attributes: ['user_id', 'email', 'phone_number']
//     });
//     const candidateUserMap = {};
//     candidateUsers.forEach(user => {
//       candidateUserMap[user.user_id] = {
//         email: user.email,
//         phone_number: user.phone_number
//       };
//     });
//     const candidatesGrouped = {};
//     expiredOffers.forEach(offer => {
//       const candidate = offer.Candidate;
//       if (candidate) {
//         const companyId = candidate.company_id;
//         const hrUserId = candidate.lastUpdatedBy;
//         if (!candidatesGrouped[companyId]) {
//           candidatesGrouped[companyId] = {
//             company_name: companyMap[companyId].name,
//             company_email: companyMap[companyId].email,
//             company_city: companyMap[companyId].city,
//             company_country: companyMap[companyId].country,
//             company_address: companyMap[companyId].address,
//             HRs: {}
//           };
//         }
//         if (!candidatesGrouped[companyId].HRs[hrUserId]) {
//           candidatesGrouped[companyId].HRs[hrUserId] = {
//             HR_name: hrMap[hrUserId],
//             candidates: []
//           };
//         }
//         const candidateDetails = {
//           candidateName: `${candidate.first_name} ${candidate.last_name}`,
//           userId: candidate.user_id,
//           offer_expiry_date: offer.offer_expiry_date,
//           email: candidateUserMap[candidate.user_id]?.email,
//           phone_number: candidateUserMap[candidate.user_id]?.phone_number
//         };
//         candidatesGrouped[companyId].HRs[hrUserId].candidates.push(candidateDetails);
//       }
//     });
//     const formattedResults = Object.values(candidatesGrouped).map(company => ({
//       company_name: company.company_name,
//       company_email: company.company_email,
//       company_city:company.company_city,
//       company_country: company.company_country,
//       company_address:company.company_address,
//       HRs: Object.values(company.HRs)
//     }));
//     return {
//       message: 'Candidate offer letter is expired.',
//       result: {
//         data: formattedResults
//       }
//     };
//   } catch (error) {
//     return {
//       message: 'Error fetching expired offers: ' + error.message
//     };
//   }
// };

exports.getExpiredOffers = async () => {
  const now = new Date();
  try {
    // Fetch expired offers with associated candidates
    const expiredOffers = await CandidateOffer.findAll({
      where: {
        offer_expiry_date: {
          [Op.lt]: now
        }
      },
      include: [
        {
          model: Candidate,
          as: 'Candidate',
          include: [
            {
              model: User,
              as: 'User'
            },
            {
              model: Company,
              as: 'Company'
            }
          ]
        }
      ]
    });

    if (expiredOffers.length === 0) {
      return {
        message: 'No expired offers.',
        result: {
          data: []
        }
      };
    }

    // Organize offers by candidate
    const candidateMap = {};

    expiredOffers.forEach(offer => {
      const candidate = offer.Candidate;
      const company = candidate.Company;
      const user = candidate.User;

      if (!candidateMap[candidate.user_id]) {
        candidateMap[candidate.user_id] = {
          candidateName: `${candidate.first_name} ${candidate.last_name}`,
          userId: candidate.user_id,
          email: user.email,
          phone_number: user.phone_number,
          companies: {}
        };
      }

      if (!candidateMap[candidate.user_id].companies[company.company_id]) {
        candidateMap[candidate.user_id].companies[company.company_id] = {
          company_name: company.company_name,
          company_email: company.company_email,
          company_city: company.company_city,
          company_country: company.company_country,
          company_address: company.company_address,
          HRs: {}
        };
      }

      if (!candidateMap[candidate.user_id].companies[company.company_id].HRs[candidate.lastUpdatedBy]) {
        candidateMap[candidate.user_id].companies[company.company_id].HRs[candidate.lastUpdatedBy] = {
          HR_name: 'HR Name', // Assuming you have a way to get HR name
          offers: []
        };
      }

      const offerDetails = {
        offer_id: offer.offer_id,
        offer_expiry_date: offer.offer_expiry_date,
        designation: offer.designation,
        department: offer.department,
        job_level: offer.job_level,
        date_of_joining: offer.date_of_joining,
        salary_ctc_pa: offer.salary_ctc_pa,
        work_location: offer.work_location,
        work_model: offer.work_model
      };

      candidateMap[candidate.user_id].companies[company.company_id].HRs[candidate.lastUpdatedBy].offers.push(offerDetails);
    });

    // Format results
    const formattedResults = Object.values(candidateMap).map(candidate => ({
      candidateName: candidate.candidateName,
      userId: candidate.userId,
      email: candidate.email,
      phone_number: candidate.phone_number,
      companies: Object.values(candidate.companies).map(company => ({
        company_name: company.company_name,
        company_email: company.company_email,
        company_city: company.company_city,
        company_country: company.company_country,
        company_address: company.company_address,
        HRs: Object.values(company.HRs).map(hr => ({
          HR_name: hr.HR_name,
          offers: hr.offers
        }))
      }))
    }));

    return {
      message: 'Candidate offer letters expired.',
      result: {
        data: formattedResults
      }
    };
  } catch (error) {
    return {
      message: 'Error fetching expired offers: ' + error.message
    };
  }
};
