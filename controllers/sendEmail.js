const nodemailer = require('nodemailer');

const emailSending = async (mailDetails) => {
    try {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        transporter.sendMail(mailDetails, (error, info) => {
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

module.exports={emailSending}