export const validateEmail = (req, res, next) => {
  const email = req.body.email?.toLowerCase().trim();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: "Valid email is required" });
  }
  req.body.email = email; // normalized for the controller
  next();
};

export const validateOtpBody = (req, res, next) => {
  if (!req.body.otp) {
    return res.status(400).json({ message: "OTP is required" });
  }
  next();
};