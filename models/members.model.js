import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    photo: { type: String, default: "" },
    instagram: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("TeamMember", memberSchema);