const express = require('express');
const router = express.Router();

const {contactUs,feedbacks,getContact,getFeedback,updateContact}=require('../controllers/contactFeedbackController');

router.post('/contactUs',contactUs);
router.post('/getContact',getContact);
router.post('/feedbacks',feedbacks);
router.get('/getFeedback',getFeedback);
router.put('/updateContact/:id',updateContact);


module.exports = router;