const express = require('express');
const router = express.Router();

const {createOrder,userAddress,getOerderByVendor ,getOerderByUser,getOrderbyId,orderConfirm,getAddres,updateAddress,deleteAddress}=require('../controllers/orderController');

router.post('/order',createOrder);
router.get('/getOrder/:vendorId',getOerderByVendor);
router.get('/userOrder/:userId',getOerderByUser);
router.get('/order/:id',getOrderbyId);
router.put('/order/:id',orderConfirm);
router.post('/address',userAddress);
router.get('/address/:userId',getAddres);
router.put('/address/:userId',updateAddress);
router.delete('/address/:userId/:addressId',deleteAddress);

module.exports = router;