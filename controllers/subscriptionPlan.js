const subscription=require('../models/subscriptionModel')

const addSubscription=async(req,res)=>{
    try{
        const { name, price, billingFrequency, description, features, status } = req.body;

        const newPlan = new subscription({
          name,
          price,
          billingFrequency,
          description,
          features,
          status
        });
    
        const savedPlan = await newPlan.save();
        res.status(201).json({ message: 'Subscription plan created successfully', plan: savedPlan });
    }catch(error){
        res.status(500).json({
            status: 500,
            error: error.message,
        });
    }
}

const getSubscription=async(req,res)=>{
    try{
        const plans = await subscription.find({status:"Active"});
        res.status(200).json({data:plans});
    }catch(error){
        res.status(500).json({
            status: 500,
            error: error.message,
        });
    }
}

const deleteSubscription=async(req,res)=>{
    try{
        const deletedPlan = await subscription.findByIdAndDelete(req.params.id);
        if (!deletedPlan) {
          return res.status(404).json({ message: 'Subscription plan not found' });
        }
        res.status(200).json({ message: 'Subscription plan deleted successfully' });
    }catch(error){
        res.status(500).json({
            status: 500,
            error: error.message,
        });
    }
}

module.exports = { addSubscription,getSubscription,deleteSubscription }
