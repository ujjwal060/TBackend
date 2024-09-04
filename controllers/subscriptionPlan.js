const subscription=require('../models/subscriptionModel')
const shopModel=require('../models/ShopDetailsmodel')

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

const getShopId=async(req,res)=>{
    try{
        const { id } = req.params;
        const shop = await shopModel.findById(id);
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        const plan = await subscription.findOne({ billingFrequency: shop.subscriptionPlan });
        if (!plan) {
            return res.status(404).json({ error: 'Subscription plan not found' });
        }

        const response = {
            planExpiryDate: shop.planExpiryDate,
            subscriptionPlan: shop.subscriptionPlan,
            price: plan.price,
            features: plan.features,
            description:plan.description
        };

        res.json({
            status:200,
            data:response
        });
    }catch(error){
        res.status(500).json({
            status: 500,
            error: error.message,
        });
    }
}
module.exports = { addSubscription,getSubscription,deleteSubscription,getShopId }
