const express = require("express");
const router = express.Router();

const {viewProfile,editProfile,changePassword}=require('../controllers/userController');
const {getNotification}=require('../controllers/notification')

router.get('/profile/:id',viewProfile);
router.put('/profile/:id',editProfile);
router.put('/changePassword/:id',changePassword);
router.get('/notification/:id',getNotification);




module.exports = router;