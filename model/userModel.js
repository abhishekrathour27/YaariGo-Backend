import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    gender: { type: String, default: null },
    profilePicture: { type: String, default: null },
    dateOfBirth: { type: Date, default: null },
    coverPhoto: { type: String, default: null },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followings: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followerCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    bio: { type: mongoose.Schema.Types.ObjectId, ref: "Bio" },
    resetPasswordExpires: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
{
  /**
   * Yeh dono fields User model ka hi reference le rahe hain, iska matlab ek user doosre users ko follow kar sakta hai.
   * 
   * Aman ek user hai aur usne Rohit ko follow kiya.

     Rohit ka followers array mein Aman ka ObjectId save hoga.

     Aman ka followings array mein Rohit ka ObjectId save hoga.
   * 
   * Yeh Database Mein Kaise Dikhega?
   * // User 1 (Aman)
      {
        _id: "123",
        username: "Aman",
        followings: ["456"],   // Aman ne Rohit ko follow kiya hai
        followers: []          
      }

     // User 2 (Rohit)
        {
          _id: "456",
          username: "Rohit",
          followings: [],
          followers: ["123"]     // Rohit ke followers mein Aman ka ObjectId hai 
        }


        Ref: "User" Kyun Hai?
         Yeh isliye hai kyunki followers aur followings dono dusre Users ke ObjectId store kar rahe hain. ref: "User" batata hai ki yeh IDs User collection ke users hain.

   */
}
