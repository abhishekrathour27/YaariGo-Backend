import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.MONGODB_URL;

const connectDb = async () => {
  try {
    await mongoose.connect(connectionString);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export default connectDb;