const admin = require('firebase-admin');
const serviceAccount =require('../firebase-service-account.json')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const notification = async (title, body,deviceToken)=>{
  try {
    const message = {
        notification: {
          title: title,
          body: body
        },
        token:deviceToken
      };
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