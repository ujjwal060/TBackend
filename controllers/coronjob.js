const cron = require('node-cron');
const ShopDetails = require('../models/ShopDetailsmodel');

const checkSubscriptionValidity = async () => {
    try {
        const shops = await ShopDetails.find();
        for (let shop of shops) {
            if (shop.planExpiryDate && new Date() > shop.planExpiryDate) {
                shop.isSubscriptionExpired = true;
            } else {
                shop.isSubscriptionExpired = false;
            }
            await shop.save();
        }
    } catch (error) {
        res.status(500).json({ message: error.massage });
    }
};

cron.schedule('0 0 * * *', async () => {
    await checkSubscriptionValidity();
    console.log('Cron job: Subscription status updated for all shops.');
});

module.exports = checkSubscriptionValidity;