const express = require("express");
const router = express.Router();
const {payment,SubscriptionPayment,getSubscriptionDetails} = require('../controllers/paymentGetWay')

router.post("/payment", payment);
router.post("/SubscriptionPayment", SubscriptionPayment);
router.get("/payments", getSubscriptionDetails);

module.exports = router;