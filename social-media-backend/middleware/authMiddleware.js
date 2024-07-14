const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.required = async function(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).send('Access Denied: No token provided');

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).send('Access Denied: No token provided');

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(verified.id);
    if (!req.user) {
      return res.status(401).send('Access Denied: User not found');
    }
    next();
  } catch (error) {
    res.status(401).send('Invalid Token');
  }
};

exports.optional = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(verified.id);
    } catch (error) {
    }
  }
  next();
};