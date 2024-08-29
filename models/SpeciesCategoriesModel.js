const mongoose = require('mongoose');

const SpeciesCategoriesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  }
});

const SpeciesCategories = mongoose.model('SpeciesCategories ', SpeciesCategoriesSchema);

module.exports = SpeciesCategories;
