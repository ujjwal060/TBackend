const express = require("express");
const router = express.Router();
const {payment,SubscriptionPayment} = require('../controllers/paymentGetWay')

router.post("/payment", payment);
router.post("/SubscriptionPayment", SubscriptionPayment);

module.exports = router;