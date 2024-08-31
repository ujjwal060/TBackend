const express = require('express');
const router = express.Router();

const {contactUs,feedbacks,getContact,getFeedback}=require('../controllers/contactFeedbackController');

router.post('/contactUs',contactUs);
router.get('/getContact',getContact);
router.post('/feedbacks',feedbacks);
router.get('/getFeedback',getFeedback);


module.exports = router;