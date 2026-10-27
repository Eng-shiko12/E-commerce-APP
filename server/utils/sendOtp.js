import nodemailer from "nodemailer";
const sendOTP =async(email ,otp)=>{
    const transport =nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`
    };
    await transport.sendMail(mailOptions);
}
export default sendOTP;