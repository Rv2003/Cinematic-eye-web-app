
import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        minLength:1,
        maxLength:30
    },
    email:{
        type:String,
        select:false,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        match:/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    
    
    },
    password:{
        type:String,
        required:false,
        minlenght:8

},role:{
    type:String,
    enum:["user","admin"],
    default:"user"
},refreshTokens: {
  type: [String],
  default: [],
}

},{timestamp:true},);


const User=mongoose.model('User',userSchema)




export default User;