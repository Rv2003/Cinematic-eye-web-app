import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import { JWT_SECRET, JWT_REF_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } from "../config/env.js";
import { jwtDecode } from "jwt-decode";
export const signup = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { username, password, email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 400;
      throw error;
    } 
    const existingUsername = await User.findOne({ username });
    if (existingUser) {
      const error = new Error("Username already exists please use different");
      error.statusCode = 400;
      throw error;
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUsers = await User.create(
      [{ username, email, password: hashedPassword }],
      { session },
    );
    const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({
      success: true,
      message: "user created successfully",
      data: {
        token,
        user: newUsers[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }
        if (!user.password) {
  const error = new Error("This account uses Google sign-in. Please log in with Google.");
  error.statusCode = 400;
  throw error;
}
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Password is incorrect");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const refreshtoken = jwt.sign({ userId: user._id }, JWT_REF_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    });

    user.refreshTokens.push(refreshtoken);
    await user.save();

    res.cookie('refreshtoken', refreshtoken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Log in successfull",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshtoken;

    if (token) {
      const decoded = jwt.verify(token, JWT_REF_SECRET);
      await User.findByIdAndUpdate(decoded.userId, {
        $pull: { refreshTokens: token },
      });
    }

    res.clearCookie('refreshtoken');
    res.status(200).json({
      success: true,
      message: "Log out succesfull",
    });
  } catch (error) {
    res.clearCookie('refreshtoken');
    res.status(200).json({
      success: true,
      message: "Log out succesfull",
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshtoken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(token, JWT_REF_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(200).json({
      success: true,
      data: { token: newAccessToken ,user},
    });
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};


export const googlesignup = async (req, res, next) => {
  try {
    const { credential} = req.body;
    const result = jwtDecode(credential);
    const email = result.email;
    const username = result.name;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const token = jwt.sign({ userId: existingUser._id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });
      const refreshtoken = jwt.sign({ userId: existingUser._id }, JWT_REF_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
      });

      existingUser.refreshTokens.push(refreshtoken);
      await existingUser.save();
      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Log in successfull",
        data: {
          token,
          user:existingUser,
        },
      });
    }else{
   
       const newUsers = await User.create(
         [{ username, email}],
      
       );
       const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, {
         expiresIn: JWT_EXPIRES_IN,
       });
       const refreshtoken = jwt.sign({ userId: newUsers[0]._id }, JWT_REF_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
      });

      newUsers[0].refreshTokens.push(refreshtoken);
      await newUsers[0].save();
       res.status(201).json({
         success: true,
         message: "user created successfully",
         data: {
           token,
           user: newUsers[0],
         },
       });
    }


  } catch (error) {
    next(error);
  }
};
