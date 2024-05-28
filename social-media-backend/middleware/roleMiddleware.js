const User = require('../models/user');
const Role = require('../models/role');

exports.isAdmin = async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    include: [Role]
  });
  if (user.Role.name !== 'Admin') {
    return res.status(403).send('Access denied');
  }
  next();
};
