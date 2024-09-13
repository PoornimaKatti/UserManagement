
const CandidateOfferService = require('../service/candidateOffer.sevice');

exports.getExpiredCandidateOffers = async (req, res) => {
  try {
    const expiredOffers = await CandidateOfferService.fetchExpiredCandidateOffers();
    const formattedOffers = expiredOffers.map(offer => ({
      user_id: offer.Candidate.user_id,
      first_name: offer.Candidate.first_name,
      last_name: offer.Candidate.last_name,
      company_name: offer.Candidate.Company ? offer.Candidate.Company.company_name : null,
      date_of_joining: offer.date_of_joining,
      year_of_experience: offer.year_of_experience
    }));
    res.status(200).json({
      message: 'Expired candidate offers retrieved successfully',
      data: formattedOffers 
    });
  } catch (error) {
    console.error('Error in getExpiredCandidateOffers controller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getActiveCandidateOffers = async (req, res) => {
  try {
    const activeOffers = await CandidateOfferService.fetchActiveCandidateOffers();
    const formattedOffers = activeOffers.map(offer => ({
      user_id: offer.Candidate.user_id,
      first_name: offer.Candidate.first_name,
      last_name: offer.Candidate.last_name,
      company_name: offer.Candidate.Company ? offer.Candidate.Company.company_name : null,
      date_of_joining: offer.date_of_joining,
      year_of_experience: offer.year_of_experience
    }));
    res.status(200).json({
      message: 'Active candidate offers retrieved successfully',
      data: formattedOffers
    });
  } catch (error) {
    console.error('Error in getActiveCandidateOffers controller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getExpiredOffers = async (req, res) => {
  try {
    if (req.user.role === 'PAdmin') {
      return res.status(403).json({ message: 'You do not have permission to access this resource.' });
    }
    // if (req.user.role !== 'EAdmin' && req.user.role !== 'Recruiter') {
    //   return res.status(403).json({ message: 'You do not have permission to create a company.' });
    // }
    const result = await CandidateOfferService.getExpiredOffers();
    res.status(200).json(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Error fetching expired offers: ' + error.message
    });
  }
};
