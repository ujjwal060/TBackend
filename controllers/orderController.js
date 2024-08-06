const order=require('../models/orderModel');
const shop=require('../models/ShopDetailsmodel');
const user=require('../models/Authmodel')
const species=require('../models/SpeciesSelectmodel')
const extension=require('../models/Extensionmodel')
const shortid = require('shortid');


const createOrder=async(req,res)=>{
    try {
        const { shopId, userId, species, extensions, totalAmount } = req.body;
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
            vendorId:shops.vendorId,
            species,
            extensions,
            totalAmount,
            bookingId,
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

const getOerderByVendor=async(req,res)=>{
    try{
        const { vendorId } = req.params;
        const orders = await order.find({ vendorId: vendorId ,paymentStatus:'success' }).lean();

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

        const detailedOrders = orders.map(order => ({
            orderId: order._id,
            userId: order.userId,
            userName: userMap[order.userId]?.name || 'N/A',
            userEmail: userMap[order.userId]?.email || 'N/A',
            shopId: order.shopId,
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
            status: order.paymentStatus,
            totalAmount: order.totalAmount,
            bookingId: order.bookingId
        }));

        res.json({
            status: 200,
            data: detailedOrders,
            msg: "All orders fetched successfully"
        });
    }catch(error){
        res.status(500).json({
            status: 500,
            error: err.message
        });
    }
}

const getOerderByUser=async(req,res)=>{
    try{
        const {userId}=req.params;
        const orders = await order.find({userId:userId}).lean();

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

        const detailedOrders = orders.map(order => ({
            orderId: order._id,
            userId: order.userId,
            userName: userMap[order.userId]?.name || 'N/A',
            userEmail: userMap[order.userId]?.email || 'N/A',
            shopId: order.shopId,
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
            status: order.paymentStatus,
            totalAmount: order.totalAmount,
            bookingId: order.bookingId
        }));

        res.json({
            status:200,
            data:detailedOrders,
            msg:"ordered list"
        })
    }catch(error){
        res.status(500).json({
            status: 500,
            error: err.message
        });
    }
}

const getOrderbyId=async(req,res)=>{
    try{
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
            status: orders.paymentStatus,
            totalAmount: orders.totalAmount,
            bookingId: orders.bookingId
        };

        res.json({
            status: 200,
            data: detailedOrder,
            msg: "Order details"
        });
    }catch(error){
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
}
module.exports={createOrder,getOerderByVendor ,getOerderByUser,getOrderbyId}