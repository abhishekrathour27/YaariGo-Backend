import nodemailer from "nodemailer";

export const sendResetPasswordLinkToEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: "Reset Password Link - YaariGo",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">YaariGo Password Reset</h2>
        <p>Hello,</p>
        <p>You requested to reset your password. Please click the button below to set a new password. This link is valid for 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">&copy; ${new Date().getFullYear()} YaariGo. All rights reserved.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
