const express = require('express');
const {login, logout,bulkNotification,dashboard} = require('../controllers/adminauthController');
// const { verifyToken } = require('../middleware/verifyToken');

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/sendN', bulkNotification);
router.get('/dashboard', dashboard);

module.exports = router;
