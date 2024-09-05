const ShopDetails = require('../models/ShopDetailsmodel');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); 
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage: storage });

const createShopDetails = async (req, res, next) => {
  try {
    const {
      shopName,
      shopDescription,
      ownerName,
      ownerEmail,
      contactNumber,
      availableFrom,
      availableTo,
      address,
      vendorId,
      latitude,
      longitude
    } = req.body;

    const shopLogo = req.file ? req.file.path : null;

    const newShopDetails = new ShopDetails({
      shopName,
      shopDescription,
      ownerName,
      ownerEmail,
      contactNumber,
      availableFrom,
      availableTo,
      shopLogo,
      address,
      latitude,
      longitude,
      vendorId,
      shopVerifyByAdmin: false,
      isSubscription:false
    });

    await newShopDetails.save();

    res.status(201).json({ message: 'Shop details created successfully', shopDetails: newShopDetails });
  } catch (error) {
    console.error('Error creating shop details:', error);
    res.status(500).json({ message: 'Failed to create shop details' });
  }
};

const getAllShopDetails = async (req, res, next) => {
    try {
      const { search, speciesName ,latitude, longitude } = req.body;

      let aggregation = [];
  
      aggregation.push({ $match: { shopVerifyByAdmin: true } });
  
      if (search) {
        aggregation.push({
          $match: {
            $or: [
              { shopName: { $regex: search, $options: 'i' } },
              { address: { $regex: search, $options: 'i' } }
            ]
          }
        });
      }
  
      if (speciesName) {
        aggregation.push({
          $lookup: {
            from: 'species',
            localField: '_id',
            foreignField: 'shopId',
            as: 'speciesInfo'
          }
        });
  
        aggregation.push({
          $match: {
            'speciesInfo.speciesName': { $regex: speciesName, $options: 'i' }
          }
        });
  
        aggregation.push({
          $project: {
            speciesInfo: 0
          }
        });
      }

      if (latitude && longitude) {
        const RADIUS_OF_EARTH = 6371;

        aggregation.push({
          $addFields: {
            distance: {
              $multiply: [
                RADIUS_OF_EARTH,
                {
                  $acos: {
                    $add: [
                      { $multiply: [
                          { $sin: { $divide: [{ $multiply: [latitude, Math.PI] }, 180] } },
                          { $sin: { $divide: [{ $multiply: ['$latitude', Math.PI] }, 180] } }
                        ]
                      },
                      {
                        $multiply: [
                          { $cos: { $divide: [{ $multiply: [latitude, Math.PI] }, 180] } },
                          { $cos: { $divide: [{ $multiply: ['$latitude', Math.PI] }, 180] } },
                          { $cos: { $divide: [{ $subtract: [longitude, '$longitude'] }, 180] } }
                        ]
                      }
                    ]
                  }
                }
              ]
            }
          }
        });

        aggregation.push({
        $match: {
          distance: { $lte: 40075 }
        }
      });

      }
      const shopDetails = await ShopDetails.aggregate(aggregation);
      res.status(200).json({
          "status":200,
          "success":true,
          "message":"All Shop",
          "data": shopDetails

      });
    } catch (error) {
      res.status(500).json({msg:error.message });
    }
  };

  const getShopDetailsById = async (req, res, next) => {
    const vendorId = req.params.id;
  
    try {
      const shopDetails = await ShopDetails.find({vendorId});
  
      if (!shopDetails) {
        return res.status(404).json({ message: 'Shop details not found' });
      }
  
      res.status(200).json(shopDetails);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch shop details by ID' });
    }
  };

  const deleteShop = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await ShopDetails.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).json({ message: 'Shop not found' });
      }
      res.status(200).json({ message: 'Shop deleted successfully', result });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  const verifyShopByAdmin=async(req,res,next)=>{
    try{
      const {id,status}=req.body;
      const result=await ShopDetails.findById(id);
      result.shopVerifyByAdmin=status;
      result.save()
      res.json({
        status:200,
        message:"Shops Verifyed"
      })
    }catch(error){
      res.status(500).json({ message: 'Failed to fetch shop details' });
    }
  }

  module.exports = {
  createShopDetails,
  getAllShopDetails,
  getShopDetailsById,
  deleteShop,
  verifyShopByAdmin,
  upload,
};
