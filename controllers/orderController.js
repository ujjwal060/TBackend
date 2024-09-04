const order = require('../models/orderModel');
const shop = require('../models/ShopDetailsmodel');
const user = require('../models/Authmodel')
const species = require('../models/SpeciesSelectmodel')
const extension = require('../models/Extensionmodel')
const address = require('../models/userAddressModel')
const shortid = require('shortid');
const nodemailer = require('nodemailer');
const { notification } = require('../controllers/notification')
const shopmodel = require('../models/ShopDetailsmodel')


const createOrder = async (req, res) => {
    try {
        const { shopId, userId, species, extensions, totalAmount, address } = req.body;
        const shops = await shop.findById(shopId);
        if (!shops) {
            return res.status(404).json({
                status: 404,
                msg: "Shop not found"
            });
        }
        const bookingId = shortid.generate();

        const orderData = {
            userId,
            shopId,
            vendorId: shops.vendorId,
            species,
            extensions,
            totalAmount,
            bookingId,
            address,
            orderDate: Date.now(),
            paymentStatus: 'pending'
        };

        const result = new order(orderData);
        await result.save();

        res.json({
            status: 200,
            msg: "Order placed successfully",
            bookingId: bookingId
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            error: err.message
        });
    }
}

const getOerderByVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const orders = await order.find({ vendorId: vendorId, paymentStatus: 'success' }).lean();

        const userIds = [...new Set(orders.map(order => order.userId))];
        const shopIds = [...new Set(orders.map(order => order.shopId))];
        const speciesIds = [...new Set(orders.flatMap(order => order.species.map(s => s.speciesId)))];
        const extensionIds = [...new Set(orders.flatMap(order => order.extensions.map(e => e.extensionId)))];

        // Fetch users, shops, species, and extensions
        const [users, shops, speciesD, extensionsD, userAddresss] = await Promise.all([
            user.find({ _id: { $in: userIds } }).select('name email').lean(),
            shop.find({ _id: { $in: shopIds } }).select('shopName address').lean(),
            species.find({ _id: { $in: speciesIds } }).select('speciesId speciesImage speciesName').lean(),
            extension.find({ _id: { $in: extensionIds } }).select('extensionId image extensionName').lean(),
        ]);

        const userMap = users.reduce((acc, user) => {
            acc[user._id] = user;
            return acc;
        }, {});

        const shopMap = shops.reduce((acc, shop) => {
            acc[shop._id] = shop;
            return acc;
        }, {});

        const speciesMap = speciesD.reduce((acc, specie) => {
            acc[specie._id] = specie;
            return acc;
        }, {});

        const extensionMap = extensionsD.reduce((acc, extension) => {
            acc[extension._id] = extension;
            return acc;
        }, {});

        function formatDeliveryAddress(address) {
            const { street, city, state, zipCode, country } = address;
            return `${street}, ${city}, ${state}, ${zipCode}, ${country}`;
        }

        const detailedOrders = orders.map(order => ({
            orderId: order._id,
            userId: order.userId,
            userName: userMap[order.userId]?.name || 'N/A',
            userEmail: userMap[order.userId]?.email || 'N/A',
            shopId: order.shopId,
            confirmationId: order.confirmationId,
            shopName: shopMap[order.shopId]?.shopName || 'N/A',
            shopAddress: shopMap[order.shopId]?.address || 'N/A',
            vendorId: order.vendorId,
            species: order.species.map(species => ({
                speciesId: species.speciesId,
                speciesName: speciesMap[species.speciesId]?.speciesName || 'N/A',
                speciesPrice: species.speciesPrice,
                image: speciesMap[species.speciesId]?.speciesImage || 'N/A'
            })),
            extensions: order.extensions.map(extension => ({
                extensionId: extension.extensionId,
                extensionName: extensionMap[extension.extensionId]?.extensionName || 'N/A',
                price: extension.price,
                image: extensionMap[extension.extensionId]?.image || 'N/A'
            })),
            orderDate: order.orderDate,
            paymentStatus: order.paymentStatus,
            totalAmount: order.totalAmount,
            bookingId: order.bookingId,
            deliveryAddress: formatDeliveryAddress(order.address) || 'N/A',
            status: order.status,
        }));

        res.json({
            status: 200,
            data: detailedOrders,
            msg: "All orders fetched successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
}

const getOerderByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await order.find({ userId: userId }).lean();

        const userIds = [...new Set(orders.map(order => order.userId))];
        const shopIds = [...new Set(orders.map(order => order.shopId))];
        const speciesIds = [...new Set(orders.flatMap(order => order.species.map(s => s.speciesId)))];
        const extensionIds = [...new Set(orders.flatMap(order => order.extensions.map(e => e.extensionId)))];

        // Fetch users, shops, species, and extensions
        const [users, shops, speciesD, extensionsD] = await Promise.all([
            user.find({ _id: { $in: userIds } }).select('name email').lean(),
            shop.find({ _id: { $in: shopIds } }).select('shopName address').lean(),
            species.find({ _id: { $in: speciesIds } }).select('speciesId speciesImage speciesName').lean(),
            extension.find({ _id: { $in: extensionIds } }).select('extensionId image extensionName').lean()
        ]);

        const userMap = users.reduce((acc, user) => {
            acc[user._id] = user;
            return acc;
        }, {});

        const shopMap = shops.reduce((acc, shop) => {
            acc[shop._id] = shop;
            return acc;
        }, {});

        const speciesMap = speciesD.reduce((acc, specie) => {
            acc[specie._id] = specie;
            return acc;
        }, {});

        const extensionMap = extensionsD.reduce((acc, extension) => {
            acc[extension._id] = extension;
            return acc;
        }, {});

        function formatDeliveryAddress(address) {
            const { street, city, state, zipCode, country } = address;
            return `${street}, ${city}, ${state}, ${zipCode}, ${country}`;
        }

        const detailedOrders = orders.map(order => ({
            orderId: order._id,
            userId: order.userId,
            userName: userMap[order.userId]?.name || 'N/A',
            userEmail: userMap[order.userId]?.email || 'N/A',
            shopId: order.shopId,
            shopName: shopMap[order.shopId]?.shopName || 'N/A',
            shopAddress: shopMap[order.shopId]?.address || 'N/A',
            vendorId: order.vendorId,
            confirmationId: order.confirmationId,
            species: order.species.map(species => ({
                speciesId: species.speciesId,
                speciesName: speciesMap[species.speciesId]?.speciesName || 'N/A',
                speciesPrice: species.speciesPrice,
                image: speciesMap[species.speciesId]?.speciesImage || 'N/A'
            })),
            extensions: order.extensions.map(extension => ({
                extensionId: extension.extensionId,
                extensionName: extensionMap[extension.extensionId]?.extensionName || 'N/A',
                price: extension.price,
                image: extensionMap[extension.extensionId]?.image || 'N/A'
            })),
            orderDate: order.orderDate,
            paymentStatus: order.paymentStatus,
            status: order.status,
            totalAmount: order.totalAmount,
            deliveryAddress: formatDeliveryAddress(order.address) || 'N/A',
            bookingId: order.bookingId
        }));

        res.json({
            status: 200,
            data: detailedOrders,
            msg: "ordered list"
        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            error: err.message
        });
    }
}

const getOrderbyId = async (req, res) => {
    try {
        const { id } = req.params;
        const orders = await order.findById(id).lean();
        const userIds = [...new Set([orders.userId])];
        const shopIds = [...new Set([orders.shopId])];
        const speciesIds = [...new Set(orders.species.map(s => s.speciesId))];
        const extensionIds = [...new Set(orders.extensions.map(e => e.extensionId))];

        const [users, shops, speciesD, extensionsD] = await Promise.all([
            user.find({ _id: { $in: userIds } }).select('name email').lean(),
            shop.find({ _id: { $in: shopIds } }).select('shopName address').lean(),
            species.find({ _id: { $in: speciesIds } }).select('speciesId speciesImage speciesName').lean(),
            extension.find({ _id: { $in: extensionIds } }).select('extensionId image extensionName').lean()
        ]);

        const userMap = users.reduce((acc, user) => {
            acc[user._id] = user;
            return acc;
        }, {});

        const shopMap = shops.reduce((acc, shop) => {
            acc[shop._id] = shop;
            return acc;
        }, {});

        const speciesMap = speciesD.reduce((acc, specie) => {
            acc[specie._id] = specie;
            return acc;
        }, {});

        const extensionMap = extensionsD.reduce((acc, extension) => {
            acc[extension._id] = extension;
            return acc;
        }, {});

        function formatDeliveryAddress(address) {
            const { street, city, state, zipCode, country } = address;
            return `${street}, ${city}, ${state}, ${zipCode}, ${country}`;
        }

        // Create detailed order response
        const detailedOrder = {
            orderId: orders._id,
            shopId: orders.shopId,
            shopName: shopMap[orders.shopId]?.shopName || 'N/A',
            shopAddress: shopMap[orders.shopId]?.address || 'N/A',
            species: orders.species.map(species => ({
                speciesId: species.speciesId,
                speciesName: speciesMap[species.speciesId]?.speciesName || 'N/A',
                speciesPrice: species.speciesPrice,
                image: speciesMap[species.speciesId]?.speciesImage || 'N/A'
            })),
            extensions: orders.extensions.map(extension => ({
                extensionId: extension.extensionId,
                extensionName: extensionMap[extension.extensionId]?.extensionName || 'N/A',
                price: extension.price,
                image: extensionMap[extension.extensionId]?.image || 'N/A'
            })),
            orderDate: orders.orderDate,
            confirmationId: orders.confirmationId,
            paymentStatus: orders.paymentStatus,
            status: orders.status,
            totalAmount: orders.totalAmount,
            deliveryAddress: formatDeliveryAddress(orders.address) || 'N/A',
            bookingId: orders.bookingId
        };

        res.json({
            status: 200,
            data: detailedOrder,
            msg: "Order details"
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
}

const orderConfirm = async (req, res) => {
    try {
        const { id } = req.params;
        const {status}=req.body;
        const result = await order.findByIdAndUpdate(id, { status:status}, { new: true });
        const userData = await user.findById(result.userId);
        const shopDetails = await shopmodel.findById(result.shopId);

        const confirmationDate = new Date();
        const estimatedDeliveryDate = new Date();
        estimatedDeliveryDate.setDate(confirmationDate.getDate() + 7);

        const title = `Order ${status}`
        const body = `Your order has been ${status} by ${shopDetails.shopName}. Your order ID is ${id}. You can track your order status in the app.`
        await notification(title, body, userData.deviceToken)
        await sendConfirmationEmail(result, userData, estimatedDeliveryDate);

        res.status(200).json({
            status: 200,
            message: 'Order confirmed and email sent',
            result
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            error: error.message
        })
    }
}

const sendConfirmationEmail = async (order, user, estimatedDeliveryDate) => {
    try {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailContent = `
            Dear ${user.name},

            Your order with ID ${order._id} has been confirmed. Here are the details of your order:

            Order Date: ${order.orderDate.toDateString()}
            Payment Status: ${order.paymentStatus}
            Total Amount: $${order.totalAmount}
            Booking ID: ${order.bookingId}

            Estimated Delivery Date: ${estimatedDeliveryDate.toDateString()}

            Your order will be delivered within 7 days from today.

            Thank you for shopping with us!

            Best regards,
            Your Shop Team
        `;

        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Order Confirmation',
            text: mailContent
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email: ', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            error: error.message
        })
    }
}

const userAddress = async (req, res) => {
    try {
        const result = new address(req.body);
        await result.save();
        res.json({
            status: 200,
            msg: "Saved Addressed...!",
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getAddres = async (req, res) => {
    try {
        const addresses = await address.find({ userId: req.params.userId });
        res.json({
            status: 200,
            msg: "Fetched Addressed...!",
            data: addresses
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateAddress = async (req, res) => {
    try {
        const result = await address.findOneAndUpdate(
            { userId: req.params.userId },
            req.body,
            { new: true, upsert: true }
        );
        res.json({
            status: 200,
            msg: "Updated Addressed...!",
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteAddress = async (req, res) => {
    try {
        const result = await address.findByIdAndDelete({ _id: req.params.addressId, userId: req.params.userId });
        res.json({
            status: 200,
            msg: "Address deleted successfully..!",
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
module.exports = { createOrder, getOerderByVendor, getOerderByUser, getOrderbyId, orderConfirm, userAddress, getAddres, updateAddress, deleteAddress }