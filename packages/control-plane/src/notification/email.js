const nodemailer = require('nodemailer');

let transporter = null;

// Initialize the email transporter
const initTransporter = async () => {
    // return transporter if already created. No need to create again
    if (transporter) return transporter;
    
    // In production, we would use real SMTP credentials from process.env
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
    return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const mailTransporter = await initTransporter();
        const info = await mailTransporter.sendMail({
            from: '"Sentinel System" <no-reply@sentinel.local>',
            to,
            subject,
            text,
            html,
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        
        return { success: true, info };
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
};

module.exports = { sendEmail };
