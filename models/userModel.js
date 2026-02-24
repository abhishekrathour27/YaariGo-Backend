import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordExpires: { type: Date, default: null },
  resetPasswordToken: { type: String, default: null },
});

const user = mongoose.model("User", userSchema);
export default user;
