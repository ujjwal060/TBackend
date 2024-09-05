const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    title:{type:String},
    body:{type:String}
})

module.exports = mongoose.model('notification', NotificationSchema);