const mongoose = require('mongoose');

const ShopDetailsSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: true,
  },
  shopDescription: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  ownerEmail: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
  },
  availableFrom: {
    type: String,
  },
  availableFromPeriod: {
    type: String,
    enum: ['AM', 'PM'],
    default: 'AM',
  },
  availableTo: {
    type: String,
  },
  availableToPeriod: {
    type: String,
    enum: ['AM', 'PM'],
    default: 'PM',
  },
  shopLogo: {
    type: String, 
  },
  address: {
    type: String,
  },
  vendorId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Vendor' 
  },
  shopVerifyByAdmin:{
    type:Boolean,
    require:true
  }
});

module.exports = mongoose.model('ShopDetails', ShopDetailsSchema);
