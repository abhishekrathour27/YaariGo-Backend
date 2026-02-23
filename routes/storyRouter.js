import express from "express";
import { createStory } from "../controllers/storyController.js";
import upload from "../config/multerUploader.js";
import { authChecker } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-story", authChecker, upload.single("media"), createStory);

export default router;
