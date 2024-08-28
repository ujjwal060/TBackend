const express = require("express");
const router = express.Router();
const {addSubscription,getSubscription,deleteSubscription} = require('../controllers/subscriptionPlan')

router.post("/subscription", addSubscription);
router.get("/subscription", getSubscription);
router.delete("/subscription/:id", deleteSubscription);


module.exports = router;