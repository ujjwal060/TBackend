const mongoose = require('mongoose');

const extensionSchema = new mongoose.Schema({
  extensionName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  shopId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true 
  }
});

const Extension = mongoose.model('Extension', extensionSchema);

module.exports = Extension;
