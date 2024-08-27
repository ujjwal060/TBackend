const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const user=require('../models/Authmodel');
const order = require("../models/orderModel");
const shopDetails=require("../models/ShopDetailsmodel")

const payment = async (req, res) => {
  const { amount,tokenid,bookingId } = req.body;
  if (!tokenid || !bookingId || !amount) {
    return res.status(400).send({ error: "Missing required parameters" });
  }
  try {
    const book=await order.findOne({bookingId:bookingId});
    const userId = book.userId;
    const users=await user.findById(userId);
    const customer = await stripe.customers.create({
      email: users.email,
    });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseFloat(amount) * 100,
      currency: 'usd',
      customer: customer.id,
      payment_method_data: {
        type: 'card',
        card: {
          token: tokenid,
        },
      },
      off_session: true,
      confirm: true,
    });
    if(paymentIntent.status ='succeeded'){
      book.paymentStatus='success';
      await book.save();
    }
    res.json({
      status:200,
      msg:"Payment Successfull",
      data:{
        amount,
        bookingId
      }
    })
  } catch (err) {
    res.status(500).json({
      status: 500,
      error: err.message
    });
  }
};


const SubscriptionPayment = async (req, res) => {
  const { amount, tokenid, shopId,planType } = req.body;
  if (!tokenid || !shopId || !amount) {
    return res.status(400).send({ error: "Missing required parameters" });
  }
  try {
    const shop = await shopDetails.findOne({_id:shopId});
    if (!shop) {
      return res.status(404).send({ error: "Shop not found" });
    }

    const customer = await stripe.customers.create({
      email: shop.ownerEmail,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseFloat(amount) * 100,
      currency: 'usd',
      customer: customer.id,
      payment_method_data: {
        type: 'card',
        card: {
          token: tokenid,
        },
      },
      off_session: true,
      confirm: true,
    });

    if (paymentIntent.status === 'succeeded') {
      shop.isSubscription = true;
      shop.paymentStatus = 'Completed';
      shop.planExpiryDate = calculatePlanExpiryDate(planType);
      shop.subscriptionPlan=planType,
      shop.isSubscriptionExpired=false,
      shop.paymentHistory.push({
        paymentDate: new Date(),
        amountPaid: parseFloat(amount),
        transactionId: paymentIntent.id
      });
      await shop.save();
    }

    res.json({
      status: 200,
      msg: "Payment Successful",
      data: {
        amount,
        paymentStatus:paymentIntent.status
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      error: err.message,
    });
  }
};

const calculatePlanExpiryDate = (subscriptionPlan) => {
  const currentDate = new Date();
  if (subscriptionPlan === 'Monthly') {
    return new Date(currentDate.setMonth(currentDate.getMonth() + 1));
  } else if (subscriptionPlan === 'Yearly') {
    return new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
  }
  return null;
};

module.exports = { payment,SubscriptionPayment }