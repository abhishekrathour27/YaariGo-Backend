import user from "../models/userModel.js";
import response from "../utils/responseHandler.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendResetPasswordLinkToEmail } from "../config/emailConfig.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return response(res, 404, "All fields are required");
    }

    const existUser = await user.findOne({ email });

    if (existUser) {
      return response(res, 401, " This email is already registered");
    }

    const hashpassword = await bcrypt.hash(password, 10);

    await user.create({
      name,
      email,
      password: hashpassword,
    });
    return response(res, 201, "Sign-up successfully");
  } catch (error) {
    response(res, 500, error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      response(res, 404, "Please provide email or password");
    }

    const existUser = await user.findOne({ email });
    if (!existUser) {
      response(res, 404, "Email is not registered");
    }

    const matchPassword = await bcrypt.compare(password, existUser.password);
    if (!matchPassword) {
      response(res, 400, "invalid password");
    }

    if (!process.env.JWT_SECRET) {
      response(res, 404, "Provide JWT token first");
    }

    const accessToken = jwt.sign(
      { userID: existUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return response(res, 200, "Login successfully", {
      user: existUser,
      token: accessToken,
      id: existUser._id,
    });
  } catch (error) {
    response(res, 500, error.message);
  }
};
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      response(res, 404, "Provide your email first");
    }

    const existUser = await user.findOne({ email });

    const resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    const resetPasswordToken = crypto.randomBytes(20).toString("hex");

    existUser.resetPasswordExpires = resetPasswordExpires;
    existUser.resetPasswordToken = resetPasswordToken;
    await existUser.save();

    try {
      await sendResetPasswordLinkToEmail(email, resetPasswordToken);
      return response(res, 200, "Password reset link send successfully", {
        token: resetPasswordToken,
      });
    } catch (error) {
      existUser.resetPasswordExpires = null;
      existUser.resetPasswordToken = null;
      existUser.save();
      return response(res, 500, error.message);
    }
  } catch (error) {
    return response(res, 500, error.message);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    console.log("BODY 👉", req.body);
    console.log("NEW PASSWORD 👉", req.body?.newpassword);

    if (newPassword !== confirmPassword) {
      return response(
        res,
        400,
        "New password or Confirm password should be same"
      );
    }

    const existUser = await user.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!existUser) {
      return response(res, 404, "reset link has expired");
    }

    const hashpassword = await bcrypt.hash(newPassword, 10);

    existUser.password = hashpassword;

    existUser.resetPasswordExpires = undefined;
    existUser.resetPasswordToken = undefined;

    existUser.save();
    return response(res, 200, "Password reset successfully", {
      password: newPassword,
    });
  } catch (error) {
    return response(res, 500, error.message);
  }
};

export const logout = async (req, res) => {
  try {
    return response(res, 200, "Logout successfully");
  } catch (error) {
    return response(res, 500, "Internal Server Error", error.message);
  }
};
