const jwt = require('jsonwebtoken');
const config = require('../../config/env.config');
const User = require('../models/user.model')
const Role = require('../models/role.model');


const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log('Token not provided');
    return res.status(401).send({
      message: 'Token is invalid. Please login.',
    });
  }
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findOne({ where: { user_id: decoded.user_id } });
    if (!user) {
      console.log('User not found for token:', decoded.user_id);
      res.status(403).json({ message: "Expired token.Please try again." });

    }
    const role = await Role.findOne({ where: { role_id: user.role_id } });
    if (!role) {
      console.log('Role not found for role_id:', user.role_id);
      return res.status(403).json({ message: "Role not found." });
    }
    req.user = {
      user_id: user.user_id,
      email: user.email,
      role: role.role_name,
      role_id: user.role_id,
      company_id: user.company_id,
    };
    next();

  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      console.log('Invalid auth code:', err.message);
      return res.status(401).json({ message: 'Invalid auth code. Please provide a valid auth code.' });
    }
    if (err.name === 'TokenExpiredError') {
      console.log('Auth code has expired:', err.message);
      return res.status(401).json({ message: 'Auth code has expired. Please log in again.' });
    }
    console.log('Token verification failed:', err);
    res.status(403).json({ message: "Expired token.Please try again." });
  }
};

module.exports = {
  authenticateToken,
};