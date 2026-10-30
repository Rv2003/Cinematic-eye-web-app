import crypto from "crypto";
import Otp from "../models/otp.js";
import { sendOtpEmail } from "../controller/mailer.js";

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

export const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const otp = crypto.randomInt(100000, 1000000).toString();

    await Otp.findOneAndUpdate(
      { email },
      { otpHash: hashOtp(otp), expiresAt: new Date(Date.now() + OTP_EXPIRY_MS), attempts: 0 },
      { upsert: true }
    );

    await sendOtpEmail(email, otp);
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    next(err); // handled by the Express error middleware
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const otp = String(req.body.otp);

    const record = await Otp.findOne({ email });
    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ message: "Too many attempts. Request a new OTP." });
    }

    const submitted = Buffer.from(hashOtp(otp));
    const stored = Buffer.from(record.otpHash);
    const isMatch =
      submitted.length === stored.length && crypto.timingSafeEqual(submitted, stored);

    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await Otp.deleteOne({ email });
    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
};