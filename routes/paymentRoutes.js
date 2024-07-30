const express = require("express");
const router = express.Router();
const {payment} = require('../controllers/paymentGetWay')

router.post("/", payment);



module.exports = router;