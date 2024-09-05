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
  availableTo: {
    type: String,
  },
  shopLogo: {
    type: String, 
  },
  address: {
    type: String,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  vendorId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Vendor' 
  },
  shopVerifyByAdmin:{
    type:Boolean,
    require:true
  },
  isSubscription:{
    type:Boolean
  },
  subscriptionPlan: { type: String, enum: ['Monthly', 'Yearly'] },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  planExpiryDate: { type: Date },
  isSubscriptionExpired: { type: Boolean, default: false },
  paymentHistory: [{
    paymentDate: { type: Date, required: true },
    amountPaid: { type: Number, required: true },
    transactionId: { type: String, required: true },
  }]
});

module.exports = mongoose.model('ShopDetails', ShopDetailsSchema);
