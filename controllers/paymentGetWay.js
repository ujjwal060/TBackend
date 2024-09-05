const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const user=require('../models/Authmodel');
const order = require("../models/orderModel");
const shopDetails=require("../models/ShopDetailsmodel")
const {emailSending}=require('./sendEmail')
const {notification}=require('./notification')

const payment = async (req, res) => {
  const { amount,tokenid,bookingId,confirmationId } = req.body;
  if (!tokenid || !bookingId || !amount,!confirmationId) {
    return res.status(400).send({ error: "Missing required parameters" });
  }
  try {
    const book=await order.findOne({bookingId:bookingId});
    const userId = book.userId;
    const vendorId=book.vendorId;
    const users=await user.findById(userId);
    const deviceToken=users.deviceToken;
    const vendor=await user.findById(vendorId);
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

    const mailDetails = {
      from: process.env.EMAIL_USER,
      to: users.email,
      subject: `Your Order Confirmation - ${confirmationId}`,
      html: `
      <p>Hi ${users.name},</p>
      <p>Thank you for your order with Taxidermy Management! We're excited to help you with your appointment. Below are the
        details of your order:</p>
      <ul>
        <li><strong>Order ID:</strong> ${book._id}</li>
        <li><strong>Booking ID:</strong> ${book.bookingId}</li>
        <li><strong>Vendor Name:</strong> ${vendor.name}</li>
        <li><strong>Order Date:</strong> ${book.orderDate}</li>
        <li><strong>Amount:</strong> ${book.totalAmount}</li>
        <li><strong>Payment Status:</strong> ${book.paymentStatus}</li>
      </ul>
      <p>Your appointment is confirmed with ${vendor.name}. If you need to reschedule or have any questions, please
        don't hesitate to contact us at <a href="mailto:hunt30@gmail.com">hunt30@gmail.com</a>.</p>
      <p>We appreciate your trust in us and look forward to serving you!</p>
      <p>Best regards,</p>
      <p>The Taxidermy Management App Team</p>
      `
      };
      const title = `Payment Resived`
      const body = `We have received your payment for order ${book._id}. Thank you! You can track the progress of your order through the app.`
    if(paymentIntent.status ='succeeded'){
      book.paymentStatus='success';
      book.confirmationId=confirmationId;
      await book.save();
      await emailSending(mailDetails)
      await notification(userId,title,body,deviceToken)
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