const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: __dirname + '/../db/.env' });

const { saveOTP, findValidOTP, markOTPAsUsed } = require('../db/queries/otps');
const { findUserByEmail, createUser } = require('../db/queries/users');

const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const requestOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const code = generateCode();
        await saveOTP(email, code);

        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        const info = await transporter.sendMail({
            from: '"Sentinel Auth" <no-reply@sentinel.local>',
            to: email,
            subject: "Your Sentinel Login Code",
            text: `Your OTP is: ${code}`,
            html: `<b>Your OTP is: ${code}</b>`,
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        
        res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error requesting OTP:", error.message);
        res.status(500).json({ error: "Failed to request OTP" });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) return res.status(400).json({ error: "Email and code are required" });

        const validOTP = await findValidOTP(email, code);
        if (!validOTP) {
            return res.status(401).json({ error: "Invalid or expired OTP" });
        }

        await markOTPAsUsed(validOTP.id);

        let user = await findUserByEmail(email);
        if (!user) {
            user = await createUser(email);
        }

        const secret = process.env.JWT_SECRET || 'fallback_secret_if_env_fails';
        if(!secret){
            console.warn("[verifyOtp]env credentials missing!")
            return res.status(500).json({error: 'Internal server Error'});
        }
        const token = jwt.sign(
            { userId: user.id, email: user.email }, 
            secret, 
            { expiresIn: '7d' } 
        );

        res.status(200).json({ token, user });
    } catch (error) {
        console.error("Error verifying OTP:", error.message);
        res.status(500).json({ error: "Failed to verify OTP" });
    }
};

module.exports = {
    requestOTP,
    verifyOTP
};
