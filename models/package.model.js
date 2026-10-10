
import mongoose from "mongoose";
const userPackage=new mongoose.Schema({
session:{
    type:String,
    required:true
},
eventdate:{
    type:Date,
    required:true,
},
bookeddate:{
    type:Date,
    required:true,
},
username:{
   type:String,
   required:true
},
WhatsappNumber:{
    type:String,
    required:true
},
user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    }
 

   
})





const model=mongoose.model("userPackage",userPackage)
export default model