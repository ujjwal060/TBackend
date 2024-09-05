const jwt = require("jsonwebtoken");
const user = require("../models/Authmodel");
const nodemailer = require("nodemailer");
const createError = require("../middleware/error");
const bcrypt = require("bcrypt");
require("dotenv").config();
const {emailSending}=require('./sendEmail')


const register = async (req, res, next) => {
  try {
    const existingUser = await user.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
        success: false,
      }); 
    }

   const hashedPassword = await bcrypt.hash( req.body.password,10);
    const newUser = new user({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      contactNumber:req.body.mobileNumber,
      role:req.body.role
    });
    if (req.body.role === 'vendor') {
      newUser.status = 'pending'
    }
    if(req.body.role==='user'){
      newUser.treamsCon=req.body.treamsCon;
      
      const mailDetails = {
        from: process.env.EMAIL_USER,
        to: req.body.email,
        subject: "Welcome to Taxidermy Management App",
        html: `
          <p>Hi ${req.body.name},</p>
          <p>Thank you for signing up for Taxidermy Management! We're excited to have you on board.</p>
          <p>Explore our features, connect with fellow enthusiasts, and dive into the world of taxidermy. If you need any help, feel free to reach out to our support team at <a href="mailto:hunt30@gmail.com">hunt30@gmail.com</a>.</p>
          <p>Enjoy your journey with us!</p>
          <p>Best,</p>
          <p>The Taxidermy Management App Team</p>
        `
      };
      await emailSending(mailDetails)
    }
    await newUser.save();
    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    return next(createError(500, "Something went wrong"));
  }
};

const login = async (req, res,next) => {

  try {
    let users = await user.findOne({ email: req.body.email});

    if (!users) {
      return res.status(404).json({
        status: 404,
        message: "User Not Found"
      });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, users.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        message: "Password is Incorrect"
      });
    }

    const token = jwt.sign(
      { id: users._id, isAdmin: users.isAdmin, roles: users.roles },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    users.deviceToken = req.body.deviceToken;
    await users.save();
    res.cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json({
        status: 200,
        message: "Login Success",
        token,
        data: users
      });

  } catch (error) {
    console.error("Login error:", error);
    return next(createError(500, "Something went wrong"));
  }
}

const sendEmail = async (req, res, next) => {
  try {
    const email = req.body.email;
    const users = await user.findOne({ email: { $regex: '^' + email + '$', $options: 'i' } });
    if (!users) {
      return next(createError(404, "User not found"));
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    users.otp = otp;
    users.otpExpiration = Date.now() + 15 * 60 * 1000;
    await users.save();

    const mailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailDetails = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP to Reset Password for Taxidermy Management",
      html: `
      <p>Hi ${users.name},</p>
      <p>We received a request to reset your password for your Taxidermy Management account. Use the One-Time Password (OTP) below to reset your password:</p>
      <p>Your OTP: <strong>${otp}</strong></p>
      <p>This OTP is valid for the next 10 minutes. If you didn't request a password reset, please ignore this email.</p>
      <p>If you need any assistance, feel free to contact our support team at <a href="mailto:hunt30@gmail.com">hunt30@gmail.com</a>.</p>
      <p>Thank you,</p>
      <p>The Taxidermy Management App Team</p>
    `
    };

    await mailTransporter.sendMail(mailDetails);
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error sending email:", error);
    return next(createError(500, "Something went wrong"));
  }
};

const verifyOTP = async (req, res) => {
  const { otp } = req.body;
  try {
    const users = await user.findOne({
      otp,
      otpExpiration: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    users.otp = undefined;
    users.otpExpiration = undefined;
    await users.save();

    const token = jwt.sign({ email: users.email }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Example token expiry time
    });

    res.status(200).json({ message: "OTP verified successfully", token });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const ResetPassword = async (req, res, next) => {
  const token = req.body.token;
  const newPassword = req.body.newPassword;

  jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
    if (err) {
      return next(createError(500, "Password Reset Link is Expired!"));
    }

    try {
      const response = data;
      const users = await user.findOne({ email: { $regex: '^' + response.email + '$', $options: 'i' } });

      if (!users) {
        return next(createError(404, "User not found!"));
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      users.password = hashedPassword;

      const updatedUser = await user.findByIdAndUpdate(
        users._id,
        { $set: { password: hashedPassword } },
        { new: true }
      );

      if (!updatedUser) {
        return next(createError(500, "Something went wrong while resetting the password!"));
      }

    } catch (error) {
      return next(createError(500, "Something went wrong while resetting the password!"));
    }
  });
  res.status(200).json({ message: "Password reset successful" });
};

const getAuth = async (req, res) => {
  try {
    const auths = await user.find();
    res.json(auths);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAuth = async (req, res) => {
  try {
    const updatedAuth = await user.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedAuth);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteAuth = async (req, res) => {
  try {
    await user.findByIdAndDelete(req.params.id);
    res.status(200).json({ status:200,msg: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logout = async (req, res) => {
  try {
   const {id}=req.params;
   const result=await user.findById(id);
   result.deviceToken='';
   await result.save();
   res.status(200).json({
    status:200,
    msg:"Logout Successfully"
   })
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = {
  register,
  login,
  sendEmail,
  verifyOTP,
  ResetPassword,
  getAuth,
  updateAuth,
  deleteAuth,
  logout
};
