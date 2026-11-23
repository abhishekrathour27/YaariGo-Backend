import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";

import connectDb from "./config/db.js";

import authRouter from "./routes/authRoute.js";
import postRouter from "./routes/postRoute.js";
import userRouter from "./routes/userRoute.js";
import messageRoute from "./routes/messageRoute.js";
import notificationRoute from "./routes/notificationRoute.js";

import "./controllers/googleController.js";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());

const allowedOrigins = ["https://yaari-go-frontend.vercel.app"];

const corsOption = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOption));
app.use(passport.initialize());

// MongoDB connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/users", postRouter);
app.use("/api/users", userRouter);
app.use("/api/message", messageRoute);
app.use("/api/notification", notificationRoute);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    message: "YaariGo Backend is running!",
  });
});

// Export Express app for Vercel
export default app;
