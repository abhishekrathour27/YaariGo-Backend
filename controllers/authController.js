import User from "../model/userModel.js";
import { generateToken } from "../utils/generateToken.js";
import response from "../utils/responseHandler.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendResetPasswordLinkToEmail } from "../utils/emailSender.js";

const registerUser = async (req, res) => {
  try {
    const { username, name, email, password, gender } = req.body;
    const finalUsername = username || name;

    if (!finalUsername || !email || !password) {
      return response(res, 400, "Username, email, and password are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return response(res, 400, "User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: finalUsername,
      email,
      password: hashedPassword,
      gender,
    });

    await newUser.save();

    const accessToken = generateToken(newUser);

    return response(res, 201, "User created successfully", {
      username: newUser.username,
      email: newUser.email,
      token: accessToken,
    });
  } catch (error) {
    console.log(error);
    return response(res, 500, "Internal server error", error.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return response(res, 404, "User not found with this email");
    }

    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
      return response(res, 401, "Invalid password");
    }

    const accessToken = generateToken(user);

    return response(res, 200, "User logged in successfully", {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      accessToken,
    });
  } catch (error) {
    console.log(error);
    return response(res, 500, "Internal server error", error.message);
  }
};
const logout = (req, res) => {
  try {
    return response(res, 200, "User logged out successfully");
  } catch (error) {
    console.log(error);
    return response(res, 500, "Internal server error", error.message);
  }
};
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return response(res, 400, "Provide your email first");
    }

    const existUser = await User.findOne({ email });

    if (!existUser) {
      return response(res, 404, "User not found");
    }

    const resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    const resetPasswordToken = crypto.randomBytes(20).toString("hex");

    await User.findByIdAndUpdate(existUser._id, {
      resetPasswordExpires,
      resetPasswordToken,
    });

    try {
      await sendResetPasswordLinkToEmail(email, resetPasswordToken);

      return response(res, 200, "Password reset link sent successfully", {
        token: resetPasswordToken,
      });
    } catch (error) {
      await User.findByIdAndUpdate(existUser._id, {
        resetPasswordExpires: null,
        resetPasswordToken: null,
      });

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

    // console.log("BODY 👉", req.body);
    // console.log("NEW PASSWORD 👉", req.body?.newpassword);

    if (newPassword !== confirmPassword) {
      return response(
        res,
        400,
        "New password or Confirm password should be same",
      );
    }

    const existUser = await User.findOne({
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

export { registerUser, loginUser, logout };
