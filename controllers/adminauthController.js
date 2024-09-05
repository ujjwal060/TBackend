const User = require('../models/adminauthModel');
const jwt = require('jsonwebtoken');
const { notification } = require('./notification')

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = 'admin@taxidermy.com';
    const adminPassword = 'admin';

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json({
        status: 200,
        message: "Login Success",
        token,
        data: { email: adminEmail, role: 'admin' }
      });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie('access_token');
    return next(createSuccess(200, "Logged out successfully!"));
  } catch (error) {
    next(error);
  }
};

const bulkNotification = async (req, res) => {
  try {
    const { title, body, role } = req.body;
    const users = await User.find({ role });
    const notificationsPromises = users.map(user => {
      const userId=user._id;
      const deviceToken=user.deviceToken;
      return notification(userId, title, body, deviceToken);
    });
    await Promise.all(notificationsPromises);
    res.status(200).json({
      status: 200,
      message: 'Notifications sent successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message
    });
  }
}

module.exports = { login, logout, bulkNotification };
