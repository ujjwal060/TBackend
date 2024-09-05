const admin = require('firebase-admin');
const serviceAccount =require('../firebase-service-account.json')
const notificationModel=require('../models/notificationModel')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const notification = async (userId,title, body,deviceToken)=>{
  try {
    const message = {
        notification: {
          title: title,
          body: body
        },
        token:deviceToken
      };
      const newNoti=new notificationModel(userId,title,body);
      await newNoti.save();
      await admin.messaging().send(message)
      .then((response) => {
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
  } catch (e) {
    return e.message
  }
};


module.exports={notification}