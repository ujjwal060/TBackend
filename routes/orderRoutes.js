const express = require('express');
const router = express.Router();

const {createOrder , getOerderByVendor ,getOerderByUser}=require('../controllers/orderController');

router.post('/order',createOrder);
router.get('/getOrder/:vendorId',getOerderByVendor);
router.get('/userOrder/:userId',getOerderByUser);



module.exports = router;