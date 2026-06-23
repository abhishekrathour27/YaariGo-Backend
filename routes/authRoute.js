import express from "express";
import {
  registerUser,
  loginUser,
  logout,
  forgetPassword,
  resetPassword,
} from "../controllers/authController.js";
import passport from "passport";
import { generateToken } from "../utils/generateToken.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logout);
router.post("/forget-password" , forgetPassword);
router.post("/reset-password/:token", resetPassword);

// Google auth route
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google callback route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/user-login`,
    session: false,
  }),
  (req, res) => {
    const accessToken = generateToken(req?.user);

    // Redirect with token as URL parameter
    res.redirect(
      `${process.env.FRONTEND_URL}?token=${accessToken}`
    );
  }
);

export default router;