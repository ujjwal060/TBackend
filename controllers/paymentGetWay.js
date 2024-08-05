const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const user=require('../models/Authmodel');
const order = require("../models/orderModel");

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


module.exports = { payment }