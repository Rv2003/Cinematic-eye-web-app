import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { JWT_SECRET } from "../config/env.js";

const authorize=async(req,res,next)=>{
    try{

let token;
if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")){
    token=req.headers.authorization.split(" ")[1]
}
if(!token){
            console.log("No token extracted, header value was:", req.headers.authorization);
            return res.status(401).json({success:false,message:"Not authorized to access this route"})
        }
if(!token){
    return res.status(401).json({success:false,message:"Not authorized to access this route"})

}


const decoded=jwt.verify(token,JWT_SECRET)
const user=await User.findById(decoded.userId)
if(!user){
    return res.status(401).json({success:false,message:"Not authorized to access this route"})
}
//if(user.role!=="admin"){
//    return res.status(403).json({success:false,message:"You do not have permission to access this route"})
//}
req.user=user
next()
    }catch(error){
    console.error("Auth middleware error:", error.message);
    res.status(401).json({success:false,message:"Not authorized to access this route"})
}
    }

const refresh=async(req,res)=>{
  const user = await User.findById(req.userId).select('-password');
  res.json({ user });
}


    export default authorize