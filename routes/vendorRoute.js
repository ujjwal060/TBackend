const express = require('express');
const router = express.Router();
const { getVendor ,deleteVendor, getUser, deleteUser,approveVendor } = require('../controllers/vendorController')
const { verifyToken } = require('../middleware/verifyToken')

router.post('/getVendor', getVendor);
router.delete('/deleteVendor/:id', deleteVendor);
router.get('/getUser', getUser);
router.delete('/deleteUser/:id', deleteUser);
router.post('/approveVendor',approveVendor)

// router.post('/logout', verifyToken, logout);

module.exports = router;