const jwt = require('jsonwebtoken');
const User = require('../models/user');


module.exports = async function(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).send('Access Denied');

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).send('Access Denied');

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(verified.id);
    if (!req.user) {
      return res.status(401).send('Access Denied');
    }
    next();
  } catch (error) {
    res.status(400).send('Invalid Token');
  }
};
