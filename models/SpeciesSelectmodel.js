const mongoose = require('mongoose');

const SpeciesSchema = new mongoose.Schema({
  speciesName: {
    type: String,
    required: true,
  },
  speciesImage: {
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

const Species = mongoose.model('Species', SpeciesSchema);

module.exports = Species;
