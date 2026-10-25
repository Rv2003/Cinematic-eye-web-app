import mongoose from "mongoose";

const photoSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, lowercase: true, required: true, index: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },   // needed for deleting from Cloudinary
    width: Number,                                // needed for justified-row layout
    height: Number,
    featured: { type: Boolean, default: false, index: true }, // homepage "best works"
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Photo", photoSchema);