import express from "express";
import {
  forgetPassword,
  login,
  logout,
  register,
  resetPassword,
} from "../controllers/userController.js";
import { authChecker } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/logout", authChecker, logout);


export default router;
