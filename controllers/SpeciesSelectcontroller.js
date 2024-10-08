const Species = require('../models/SpeciesSelectmodel');
const SpeciesCategories=require('../models/SpeciesCategoriesModel')
const { ObjectId } = require('mongodb');
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
    res.json({
      status:200,
      msg:"get all Species",
      data:species
  })   
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const addSpecies = async (req, res) => {
  try {
    const { speciesName, price ,shopId} = req.body;
    const speciesImage = req.file.path;
    const existingSpecies = await Species.findOne({ speciesName, shopId });

    if (existingSpecies) {
      return res.status(400).json({ message: 'Species already exists' });
    }
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
    const { search} = req.body;

    let aggregation = [];
   
      aggregation.push({
        $match: {
          shopId: new ObjectId(shopId)
        }
      });

    if (search) {
      aggregation.push({
        $match: {
          $or: [
            { speciesName: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }
    const result=await Species.aggregate(aggregation)
    res.json({
      status:200,
      msg:"get all species for shop",
      data:result
    })
  }catch(error){
    res.status(500).json({
      status: 500,
      error: error.message
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
      error: error.message
    });
  }
}

const editSpecies = async (req, res) => {
  try {
    const { id } = req.params; // Get species ID from the request parameters
    const updateData = req.body; // Get the updated data from the request body

    // If a new image is uploaded, update the speciesImage field
    if (req.file) {
      updateData.speciesImage = req.file.path;
    }

    // Find the species by ID and update with new data
    const updatedSpecies = await Species.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedSpecies) {
      return res.status(404).json({ message: 'Species not found' });
    }

    res.json({
      status: 200,
      message: "Species updated successfully",
      data: updatedSpecies
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message
    });
  }
};


const editSpeciesCategory = async (req, res) => {
  try {
    const { id } = req.params; // Get species ID from the request parameters
    const updateData = req.body; // Get the updated data from the request body

    // If a new image is uploaded, update the image field
    if (req.file) {
      updateData.image = req.file.path;
    }

    // Find the species by ID and update with new data
    const updatedSpecies = await SpeciesCategories.findByIdAndUpdate(id, updateData);

    if (!updatedSpecies) {
      return res.status(404).json({ message: 'Species category not found' });
    }

    res.status(200).json({
      status: 200,
      message: 'Species category updated successfully',
      data: updatedSpecies,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
    });
  }
};

module.exports = {
  addSpecies,
  getSpeciesById,
  deleteSpecies,
  addSpeciesCategories,
  getSpeciesCategories,
  upload,
  editSpecies,
  editSpeciesCategory
};
