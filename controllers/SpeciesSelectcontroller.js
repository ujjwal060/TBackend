const Species = require('../models/SpeciesSelectmodel');
const SpeciesCategories=require('../models/SpeciesCategoriesModel')
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const addSpeciesCategories=async(req,res)=>{
  try {
    const {name} = req.body;
    const image = req.file.path;

    const newSpecies = new SpeciesCategories({
      name,
      image
    });

    await newSpecies.save();

    res.status(200).json(newSpecies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const getSpeciesCategories=async(req,res)=>{
  try {
    const species = await SpeciesCategories.find();
    res.status(200).json(species);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const addSpecies = async (req, res) => {
  try {
    const { speciesName, price ,shopId} = req.body;
    const speciesImage = req.file.path;

    const newSpecies = new Species({
      speciesName,
      speciesImage,
      price,
      shopId
    });

    await newSpecies.save();

    res.status(201).json(newSpecies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSpeciesById=async(req,res)=>{
  try{
    const {shopId}=req.params;
    const result=await Species.find({shopId:shopId})
    res.json({
      status:200,
      msg:"get all species for shop",
      data:result
    })
  }catch(error){
    res.status(500).json({
      status: 500,
      error: err.message
    });
  }
}

const deleteSpecies=async(req,res)=>{
  try{
    const {id}=req.params;
    const result = await Species.findByIdAndDelete(id);
    res.json({
      status: 200,
      msg: "Species deleted successfully"
    });
  }catch(error){
    res.status(500).json({
      status: 500,
      error: err.message
    });
  }
}
module.exports = {
  addSpecies,
  getSpeciesById,
  deleteSpecies,
  addSpeciesCategories,
  getSpeciesCategories,
  upload,
};
