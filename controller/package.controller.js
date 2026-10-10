import userPackage from "../models/package.model.js";

export const createBooking=async(req,res,next)=>{

try{

const booking= await userPackage.create({
   ...req.body,
   user:req.user._id

})

res.status(201).json({success:true,message:"Booking created successfully",data:booking})    



}catch(e){
    next(e)
}



}


export const getBooking=async(req,res,next)=>{
    try{
   const records =await userPackage.find({user:req.user.id})
  if(!records){
        const error=new Error("No records found")
        error.statusCode=404
        throw error
     }

     res.status(200).json({success:true,data:records})
    }catch(error){
        next(error)
    }
    
}