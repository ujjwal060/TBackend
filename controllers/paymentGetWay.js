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

const getSubscriptionDetails = async (req, res) => {
  try {
    const { limit = 10, starting_after } = req.query;
    const paymentListParams = {
      limit: parseInt(limit, 10),
    };

    if (starting_after) {
      paymentListParams.starting_after = starting_after;
    }

    const payments = await stripe.paymentIntents.list(paymentListParams);
    const formatDate = (timestamp) => {
      const date = new Date(timestamp * 1000);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const paymentDetailsPromises = payments.data.map(async (payment) => {
      let cardDetails = {};
      let billingEmail = null;
      let shopDetailsAll = {};

      if (payment.customer) {
        try {
          const customer = await stripe.customers.retrieve(payment.customer);
          billingEmail = customer.email || null;
        } catch (err) {
          console.error('Error retrieving customer details:', err);
        }
      }

      if (payment.payment_method) {
        try {
          const paymentMethod = await stripe.paymentMethods.retrieve(payment.payment_method);
          cardDetails = {
            cardNumber: paymentMethod.card?.last4 ? `**** **** **** ${paymentMethod.card.last4}` : null,
            cardType: paymentMethod.card?.brand || null,
          };
        } catch (err) {
          console.error('Error retrieving payment method details:', err);
        }
      }

      try {
        const shopDetail = await shopDetails.findOne({
          'paymentHistory.transactionId': payment.id
        }).lean();

        const vendor=await user.findById(shopDetail.vendorId).lean();
          shopDetailsAll = {
            shopName: shopDetail.shopName || null,
            ownerName: shopDetail.ownerName || null,
            contactNumber: shopDetail.contactNumber || null,
            subscriptionPlan: shopDetail.subscriptionPlan || null,
            vendorName: vendor.name || null,
            vendorContact: vendor.contactNumber || null,
            vendorEmail: vendor.email || null,
          };
      } catch (err) {
        console.error('Error retrieving shop details:', err);
      }

      return {
        paymentId: payment.id,
        amount: payment.amount / 100,
        email: billingEmail,
        cardNumber: cardDetails.cardNumber,
        cardType: cardDetails.cardType,
        status: payment.status,
        paymentDate: formatDate(payment.created),
        ...shopDetailsAll
      };
    });

    const paymentDetails = await Promise.all(paymentDetailsPromises);

    res.json({
      payments: paymentDetails,
      has_more: payments.has_more,
      // next_starting_after: payments.data.length ? payments.data[payments.data.length - 1].id : null,
    });
  } catch (error) {
    console.error('Error fetching subscription details:', error); // Debugging: Print the error
    res.status(500).json({
      status: 500,
      error: error.message,
    });
  }
};




module.exports = { payment,SubscriptionPayment,getSubscriptionDetails }