const express = require('express');
const {login, logout,bulkNotification } = require('../controllers/adminauthController');
// const { verifyToken } = require('../middleware/verifyToken');

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/sendN', bulkNotification);

module.exports = router;
