import userPackage from "../models/package.model.js";

export const createBooking=async(req,res,next)=>{

try{

if (!req.user?.username) {
    const error = new Error("Authenticated user has no username");
    error.statusCode = 500;
    throw error;
}

const booking= await userPackage.create({
   ...req.body,
   username:req.user.username,
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

export const getAll=async(req,res,next)=>{
try{
     const records =await userPackage.find()
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


export const patchStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = userPackage.schema.path("status").enumValues;
    if (typeof status !== "string" || !allowedStatuses.includes(status)) {
      const error = new Error(`Status must be one of: ${allowedStatuses.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }

    const packageFilter = { _id: id };
    if (req.user.role !== "admin") {
      packageFilter.user = req.user._id;
    }

    const updated = await userPackage.findOneAndUpdate(
      packageFilter,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      const error = new Error("Package not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deletePackage=async(req,res,next)=>{
    try{
const { id } = req.params;
        
        const deletedItem = await userPackage.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).json({ success: false, message: "Document not found" });
        }

        res.status(200).json({ success: true, message: "Document deleted successfully", data: deletedItem })
    }catch(error){
        next(error)
    }
}
