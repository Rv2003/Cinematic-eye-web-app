import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { jwtDecode } from "jwt-deccode";
import gUser from "../models/user.google.mode.js";
import {
  JWT_SECRET,
  JWT_REF_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} from "../config/env.js";

export const googlesignup = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { credential, clientId, select_by } = req.body;
    const result = jwtDecode(credential);
    const email = result.data.email;
    const username = result.data.name;
    const existingUser = await gUser.findOne({ email });
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
          existingUser,
        },
      });
    }else{
   
       const newUsers = await gUser.create(
         [{ username, email}],
         { session },
       );
       const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, {
         expiresIn: JWT_EXPIRES_IN,
       });
       const refreshtoken = jwt.sign({ userId: newUsers[0]._id }, JWT_REF_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
      });

      user.refreshTokens.push(refreshtoken);
      await newUsers.save();
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




    }


  } catch (error) {
    next(error);
  }
};
