const express = require('express');
const router = express.Router();
const ShopDetailscontroller = require('../controllers/ShopDetailscontroller');

// Multer middleware for handling file uploads
const upload = ShopDetailscontroller.upload;

// POST request - Create new shop details with image upload
router.post('/add', upload.single('shopLogo'), ShopDetailscontroller.createShopDetails);
router.post('/getAll', ShopDetailscontroller.getAllShopDetails);
router.get('/shop/:id', ShopDetailscontroller.getShopDetailsById);
router.delete('/deleteShop/:id',ShopDetailscontroller.deleteShop);
router.post('/verifyShop',ShopDetailscontroller.verifyShopByAdmin)
module.exports = router;
