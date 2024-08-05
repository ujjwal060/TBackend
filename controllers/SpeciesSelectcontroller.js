const Species = require('../models/SpeciesSelectmodel');
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
  upload,
};
