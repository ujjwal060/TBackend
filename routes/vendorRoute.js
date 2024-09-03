const express = require('express');
const router = express.Router();
const { getVendor ,deleteVendor, getUser, deleteUser,approveVendor,viewProfile,editProfile,changePassword } = require('../controllers/vendorController')
const { verifyToken } = require('../middleware/verifyToken')

router.post('/getVendor', getVendor);
router.delete('/deleteVendor/:id', deleteVendor);
router.post('/getUser', getUser);
router.delete('/deleteUser/:id', deleteUser);
router.post('/approveVendor',approveVendor);
router.get('/profile/:id',viewProfile);
router.put('/profile/:id',editProfile);
router.put('/changePassword/:id',changePassword);

// router.post('/logout', verifyToken, logout);

module.exports = router;