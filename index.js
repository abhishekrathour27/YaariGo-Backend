import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import authRouter from "./routes/authRoute.js";
import postRouter from "./routes/postRoute.js";
import userRouter from "./routes/userRoute.js";
import messageRoute from "./routes/messageRoute.js";
import notificationRoute from "./routes/notificationRoute.js";
import passport from "passport";
import "./controllers/googleController.js";
import { app, server } from "./socketIO/server.js";

dotenv.config();

app.use(express.json());

// Removed cookie-parser since we're using localStorage tokens

const allowedOrigins = [
  "https://lets-meet-l.vercel.app",
  "http://localhost:3000",
];

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

app.use("/api/auth", authRouter);
app.use("/api/users", postRouter);
app.use("/api/users", userRouter);
app.use("/api/message", messageRoute);
app.use("/api/notification", notificationRoute);

const PORT = process.env.PORT || 8080;

connectDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(
        `Server is running on http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "Failed to connect to MongoDB. Server not started."
    );
  });