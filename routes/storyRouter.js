import express from "express";
import { createStory, getAllStory } from "../controllers/storyController.js";
import upload from "../config/multerUploader.js";
import { authChecker } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-story", authChecker, upload.single("media"), createStory);
router.get("/stories", authChecker, getAllStory);

export default router;
