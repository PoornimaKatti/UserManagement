const Candidate = require('../models/candidate.model');
const User = require('../models/user.model');

exports.createCandidate = async (candidateData) => {
  try {
    const candidate = await Candidate.create(candidateData);
    return candidate;
  } catch (error) {
    console.error('Error creating candidate:', error);
    throw error;
  }
};
exports.getCandidates = async (query) => {
  try {
    const candidates = await Candidate.findAll({ where: query });
    return candidates;
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw new Error(`Error while fetching candidates: ${error.message}`);
  }
};

exports.getCandidate = async (query) => {
  try {
    const candidate = await Candidate.findOne({ where: query });
    return candidate;
  } catch (error) {
    throw new Error(`Error while fetching candidate: ${error.message}`);
  }
}

exports.getCandidatees = async () => {
  try {
    console.log('Fetching candidates with user details');
    const candidates = await Candidate.findAll({
      include: [{
        model: User,
        attributes: ['phone_number', 'user_name', 'email'],
        as: 'User'
      }],
      attributes: []
    });
    console.log('Candidates with user details:', candidates);
    return candidates.map(candidate => ({
      phone_number: candidate.User.phone_number,
      user_name: candidate.User.user_name,
      email: candidate.User.email
    }));
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw new Error('Unable to fetch candidates.');
  }
};