
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.MONGODB_URL;

let isConnected = false;

const connectDb = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionString) {
    throw new Error("MONGODB_URL is missing");
  }

  try {
    await mongoose.connect(connectionString);

    isConnected = mongoose.connection.readyState === 1;

    console.log("MongoDB connected successfully");
  } catch (error) {
    isConnected = false;
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export default connectDb;
