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
        const orders = await order.find({ vendorId: vendorId, paymentStatus: { $in: ['success', 'partiallyPaid'] } }).lean();

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
            paidAmount:order.paidAmount,
            dueAmount:order.remainingAmount,
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
        const orders = await order.find({ userId: userId, paymentStatus: { $in: ['success', 'partiallyPaid'] }  }).lean();

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
            paidAmount:order.paidAmount,
            dueAmount:order.remainingAmount,
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
            paidAmount:orders.paidAmount,
            dueAmount:orders.remainingAmount,
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
        const { status } = req.body;
        const result = await order.findByIdAndUpdate(id, { status: status }, { new: true });
        const userId = result.userId;
        const userData = await user.findById(userId);
        const shopDetails = await shopmodel.findById(result.shopId);

        let body = ''
        let title = ''
        if (status == "delivered") {
            title = `Trophy Completed`
            body = `Congratulations! Your order ${id} has been completed and is ready for pick-up at ${shopDetails.shopName}.`
        } else if (status == "confirmed") {
            title = `In Production`
            body = `Order is now in production for your order${id}. Stay tuned for further updates.`
        } else if (status == "shipped") {
            title = `Detail Work`
            body = `Detail work for order has started for your order${id}. Stay tuned for further updates.`
        }
        await notification(userId, title, body, userData.deviceToken)
        await sendConfirmationEmail(result, userData, shopDetails);

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

const sendConfirmationEmail = async (order, user, shopDetails) => {
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

            Your order with ID ${order._id} has been ${order.status}. Here are the details of your order:

            Order Date: ${order.orderDate.toDateString()}
            Payment Status: ${order.paymentStatus}
            Total Amount: $${order.totalAmount}
            Booking ID: ${order.bookingId}
            Status: ${order.status}
            Confirmation Id:${order.confirmationId}

            Your order is being processed by ${shopDetails.shopName}.
            You will be notified when your order progresses to the next stage.

            Thank you for shopping with ${shopDetails.shopName}!

            Best regards,
            ${shopDetails.shopName} Team
        `;

        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Order Status Update',
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

const getOrderSummary = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { startDate, endDate } = req.body;
        const start = new Date(startDate);
        const end = new Date(endDate);

        const orders = await order.find({
            vendorId: vendorId,
            orderDate: {
                $gte: start,
                $lte: end
            }
        });

        const totalSales = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        const completedSales = orders.filter(order => order.status === 'delivered')
            .reduce((acc, order) => acc + order.totalAmount, 0);
        const statusCounts = {
            Pending: orders.filter(order => order.status === 'pending').length,
            Shipping: orders.filter(order => order.status === 'shipping').length,
            Confirmed: orders.filter(order => order.status === 'confirmed').length,
            Delivered: orders.filter(order => order.status === 'delivered').length,
        };

        res.status(200).json({
            statusCounts,
            totalSales,
            completedSales,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order data', error });
    }
};

module.exports = { createOrder, getOerderByVendor, getOerderByUser, getOrderbyId, orderConfirm, userAddress, getAddres, updateAddress, deleteAddress, getOrderSummary }