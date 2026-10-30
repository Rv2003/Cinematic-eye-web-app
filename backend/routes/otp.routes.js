import { Router } from "express";
import rateLimit from "express-rate-limit";
import { sendOtp, verifyOtp } from "../controller/otp.controller.js";
import { validateEmail, validateOtpBody } from "../middleware/otp.validate.js";

const router = Router();

const sendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: { message: "Too many OTP requests. Try again later." },
});

router.post("/send", sendLimiter, validateEmail, sendOtp);
router.post("/verify", validateEmail, validateOtpBody, verifyOtp);

export default router;
