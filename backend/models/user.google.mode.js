import mongoose from "mongoose";

const googleUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },

  userEmail: {
    type: String,
    required: true,
    unique: true,
  },

  refreshTokens: {
    type: [String],
    default: [],
  },

  name: String,

  picture: String,
});

export default mongoose.model("gUser", googleUserSchema);
