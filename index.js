import express from "express";
import dotenv from "dotenv";
import userRouter from "./routes/userRouter.js";
import cors from "cors";
import { connectDB } from "./config/dbConnet.js";
import storyRouter from "./routes/storyRouter.js";

dotenv.config({ debug: true });
const app = express();
app.use(express.json());

app.use(
  cors({
    origin:  "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Routes
app.use("/api/user", userRouter); // auth route
app.use("/api/userstory", storyRouter); // story route

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect MongoDB:", error);
    process.exit(1);
  }
};

startServer();
