const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    shopId: { type: Schema.Types.ObjectId, required: true, ref: 'Shop' },
    vendorId:{ type: Schema.Types.ObjectId, required: true},
    species: [{
        speciesId: { type: Schema.Types.ObjectId, required: true, ref: 'Species' },
        speciesPrice: { type: Number, required: true }
    }],
    extensions: [{
        extensionId: { type: Schema.Types.ObjectId, required: true, ref: 'Extension' },
        price: { type: Number, required: true } 
    }],
    orderDate: { type: Date, default: Date.now },
    paymentStatus: { type: String, enum: ['pending', 'success', 'cancelled'], default: 'pending' },
    totalAmount: { type: Number, required: true },
    bookingId: { type: String, required: true, unique: true } ,
    trackingInfo: {
        trackingNumber: { type: String },
        carrier: { type: String },
        estimatedDeliveryDate: { type: Date }
    },
    status: { type: String, default:'pending' }
});

module.exports = mongoose.model('Order', orderSchema);
