import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export const sendOtpEmail = (to, otp) =>
  transporter.sendMail({
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your verification code",
    html: `<p>Your OTP is <b style="font-size:20px">${otp}</b></p>
           <p>It expires in 5 minutes.</p>`,
  });