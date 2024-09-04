// models/Auth.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const authSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  contactNumber:{type:String,require:true},
  otp: { type: String },
  otpExpiration: { type: Date },
  role:{ enum:['user','vendor'],
     type: String,
     required: true 
  },
  status: {
    type: String,
    enum: ['pending', 'rejected', 'accepted']
  },
  deviceToken:{type:String,required:false},
  treamsCon:{type:Boolean}
});


module.exports = mongoose.model('user', authSchema);
