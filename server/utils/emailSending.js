
const nodemailer = require('nodemailer');

dotenv.config();
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendVerificationEmail = async (email, token) => {
    const verificationLink = `${process.send.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        html: `<p>Please click the following link to verify your email address:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
    };

    await transporter.sendMail(mailOptions);

};

const sendVerificationEmailForgetPassword = async (email, token) => {
    const verificationLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Password',
        html: `<p>Please click the following link to reset your password:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
    };

    await transporter.sendMail(mailOptions);

}
const generateVerificationToken = (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });
};


module.exports = { sendVerificationEmail, sendVerificationEmailForgetPassword, generateVerificationToken };