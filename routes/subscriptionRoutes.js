const express = require("express");
const router = express.Router();
const {addSubscription,getSubscription,deleteSubscription,getShopId} = require('../controllers/subscriptionPlan')

router.post("/subscription", addSubscription);
router.get("/subscription", getSubscription);
router.delete("/subscription/:id", deleteSubscription);
router.get("/subscription/:id", getShopId);


module.exports = router;