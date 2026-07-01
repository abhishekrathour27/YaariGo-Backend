import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./model/userModel.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to DB");
    const users = await User.find({});
    console.log(`Found ${users.length} users. Checking for missing usernames...`);
    
    for (const u of users) {
      if (!u.username) {
        // Derive username from email prefix
        const emailPrefix = u.email ? u.email.split("@")[0] : `user_${u._id.toString().slice(-4)}`;
        u.username = emailPrefix;
        
        // Save without validation in case other fields are also invalid
        await u.save({ validateBeforeSave: false });
        console.log(`Updated user ${u.email} (ID: ${u._id}) with username: "${u.username}"`);
      }
    }
    console.log("Cleanup completed successfully!");
  } catch (err) {
    console.error("Error running database repair:", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
