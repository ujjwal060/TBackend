const express = require('express');
const router = express.Router();

const {createOrder , getOerderByVendor ,getOerderByUser,getOrderbyId}=require('../controllers/orderController');

router.post('/order',createOrder);
router.get('/getOrder/:vendorId',getOerderByVendor);
router.get('/userOrder/:userId',getOerderByUser);
router.get('/order/:id',getOrderbyId);




module.exports = router;