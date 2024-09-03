const contact = require('../models/contactusModel');
const feedback = require('../models/feedbackModel');
const user = require('../models/Authmodel')

const contactUs = async (req, res) => {
    try {
        const { userId, name, email, subject, message } = req.body;
        const newContact = new contact({
            userId,
            name,
            email,
            message,
        });

        const savedContact = await newContact.save();
        res.json({
            status: 200,
            msg: "Thanks For Contacting Us",
            data: []
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const feedbacks = async (req, res) => {
    try {
        const { userId, rating, comments } = req.body;

        const newFeedback = new feedback({
            userId,
            rating,
            comments,
        });
        const savedFeedback = await newFeedback.save();
        res.json({
            status: 200,
            msg: "Thanks For Your Valuable FeedBack",
            data: []
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getContact = async (req, res) => {
    try {
        const {read}=req.body;
        const result = await contact.find({read:read});
        res.json({
            status: 200,
            msg: "get all contactus",
            data: result
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getFeedback = async (req, res) => {
    try {
        const result = await feedback.find();
        const feedbacks = await Promise.all(result.map(async (feedbackItem) => {
            const users = await user.findById(feedbackItem.userId);

            return {
                ...feedbackItem._doc,
                username: users.name,
            };
        }));
        res.json({
            status: 200,
            msg: "get all feedback",
            data: feedbacks
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { read } = req.body;
        const result=await contact.findByIdAndUpdate(id,{read});
        res.json({
            status: 200,
            msg: "readed",
            data: []
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { contactUs, feedbacks, getContact, getFeedback, updateContact }
