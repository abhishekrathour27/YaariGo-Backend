import mongoose from "mongoose";

const bioSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    bioText: { type: String, default: null },
    liveIn: { type: String, default: null },
    relationShip: { type: String, default: null },
    workPlace: { type: String, default: null },
    education: { type: String, default: null },
    phone: { type: String, default: null },
    homeTown: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

const Bio = mongoose.model("Bio", bioSchema);
export default Bio; 

{
  /**
   * User Reference Kyun Chahiye?
      Jab koi user apni bio likhta hai, toh usko user se link karna zaroori hai.
      Agar hum user ka reference (user: { type: ObjectId, ref: "User" }) nahi rakhenge, toh kaise pata chalega ki yeh bio kis user ki hai?
   * 
      kuch is trah se dikhega re bhosdi?
              {
              "_id": "1A2B3C",
              "user": {
                "_id": "111",
                "username": "Aman",
                "email": "aman@gmail.com"
              },
                "bioText": "Coder",
                "liveIn": "Mumbai",
                "workPlace": "Google"
              }

   * 
   * 
   * 
   * 
   * 
   * 
   */
}
