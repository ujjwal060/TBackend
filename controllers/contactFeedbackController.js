const contact=require('../models/contactusModel');
const feedback=require('../models/feedbackModel');

const contactUs=async(req,res)=>{
    try{
        const { userId, name, email, subject, message } = req.body;
        const newContact = new contact({
          userId,
          name,
          email,
          message,
        });
    
        const savedContact = await newContact.save();
        res.status(200).json(savedContact);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
}

const feedbacks=async(req,res)=>{
    try{
        const { userId, rating, comments } = req.body;

        const newFeedback = new Feedback({
            userId,
            rating,
            comments,
        });
        const savedFeedback = await newFeedback.save();
        res.status(200).json(savedFeedback);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
}

const getContact=async(req,res)=>{
    try{
        const result = await contact.find();
        res.json({
          status:200,
          msg:"get all contactus",
          data:result
      })   
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}

const getFeedback=async(req,res)=>{
    try{
        const result = await feedback.find();
        res.json({
          status:200,
          msg:"get all contactus",
          data:result
      })   
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}

module.exports = {contactUs,feedbacks,getContact,getFeedback}
