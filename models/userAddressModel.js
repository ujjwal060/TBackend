const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true 
  },
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;