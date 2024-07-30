const mongoose = require("mongoose");

const ProductManageSchema = new mongoose.Schema({
  sno: { type: String, required: true }, 
  productname: { type: String, required: true }, 
  description: { type: String, required: true },
  price: { type: String, required: true },
  
  image: { type: String },
});

module.exports = mongoose.model("ProductManage", ProductManageSchema);
