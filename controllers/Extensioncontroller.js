const Extension = require('../models/Extensionmodel');
const multer = require('multer');
const path = require('path');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); // Destination folder for uploaded images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // File renaming
  },
});

const upload = multer({ storage: storage });

// Handle adding a new extension with image upload
const addExtension = async (req, res) => {
  try {
    const { extensionName,specie, extensionDescription, price,shopId ,role} = req.body;
    const extensionImage = req.file.path;

    const newExtension = new Extension({
      extensionName,
      specie,
      description:extensionDescription,
      image:extensionImage,
      price,
      shopId,
      role
    });

    await newExtension.save();

    res.status(201).json(newExtension);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExtension=async(req,res)=>{
  try{
    const {shopId}=req.params;
    const result=await Extension.find({shopId:shopId});
    res.json({
      status:200,
      msg:"get Extension for shop",
      data:result
    })

  }catch(error){
    res.status(500).json({
      status: 500,
      error: err.message
    });
  }
}

const getAll=async(req,res)=>{
  try{
    const result=await Extension.find({role:'admin'});
    res.json({
      status:200,
      msg:"get Extension for shop",
      data:result
    })

  }catch(error){
    res.status(500).json({
      status: 500,
      error: err.message
    });
  }
  }

const deleteExtension=async(req,res)=>{
  try{
    const {id}=req.params;
    const result = await Extension.findByIdAndDelete(id);
    res.json({
      status: 200,
      msg: "Extension deleted successfully"
    });
  }catch(error){
    res.status(500).json({
      status: 500,
      error: err.message
    });
  }
}

const editExtension=async(req,res)=>{
  try{
    const { id } = req.params;
    const updateData = req.body;
    if (req.file) {
      updateData.image = req.file.path;
    }
    const updatedExtension = await Extension.findByIdAndUpdate(id, updateData);
    res.json({
      status:200,
      msg:"Extension updated successFully"
    })
  }catch(error){
    res.status(500).json({
      status: 500,
      error: err.message
    });
  }
}

module.exports = {
  addExtension,
  getExtension,
  deleteExtension,
  editExtension,
  getAll,
  upload,
};
