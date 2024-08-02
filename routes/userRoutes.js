const express = require("express");
const router = express.Router();

const {viewProfile,editProfile,changePassword}=require('../controllers/userController');

router.get('/profile/:id',viewProfile);
router.put('/profile/:id',editProfile);
router.put('/changePassword/:id',changePassword);


module.exports = router;