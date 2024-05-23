const { validationResult } = require('express-validator');
const PrivacySetting = require('../models/privacySetting');

exports.getPrivacySettings = async (req, res) => {
  try {
    const settings = await PrivacySetting.findOne({ where: { userId: req.user.id } });
    res.send(settings);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.updatePrivacySettings = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { visibility } = req.body;
  try {
    let settings = await PrivacySetting.findOne({ where: { userId: req.user.id } });
    if (!settings) {
      settings = await PrivacySetting.create({ userId: req.user.id, visibility });
    } else {
      settings.visibility = visibility;
      await settings.save();
    }
    res.send(settings);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};
