import mongoose from "mongoose";
import { DB_URI,NODE_ENV } from "../config/env.js";

if(!DB_URI){
    throw new Error('Please define MONGO_DB URI')
}

const connectToDatabase=async()=>{
try{
await mongoose.connect(DB_URI);
console.log("Connection succesfull")

}catch(error){

console.log("Error Connecting to the databse",error)

process.exit(1)
}
}

export default connectToDatabase