const User = require('../models/adminauthModel');
const jwt = require('jsonwebtoken');


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

module.exports = { login,logout };
