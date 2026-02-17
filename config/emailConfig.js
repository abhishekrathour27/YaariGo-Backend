import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify email configuration
const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log("Email services are ready");
    return true;
  } catch (error) {
    console.error("Email configuration error:", error);
    return false;
  }
};

// Initialize verification
verifyTransporter();

const getEmailTemplate = (
  content,
  title = "Auth forget passaword"
) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f8fafc;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 12px; 
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .logo { 
          font-size: 28px; 
          font-weight: bold; 
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        .tagline { 
          font-size: 14px; 
          opacity: 0.9; 
        }
        .content { 
          padding: 40px 30px; 
        }
        .button { 
          display: inline-block; 
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
          color: white; 
          padding: 14px 28px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600;
          margin: 20px 0;
          transition: transform 0.2s;
        }
        .button:hover { 
          transform: translateY(-2px); 
        }
        .footer { 
          background: #f1f5f9; 
          padding: 25px; 
          text-align: center; 
          font-size: 12px; 
          color: #64748b; 
          border-top: 1px solid #e2e8f0;
        }
        .divider { 
          height: 3px; 
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
          margin: 20px 0; 
        }
        .highlight { 
          background: #eff6ff; 
          padding: 15px; 
          border-left: 4px solid #3b82f6; 
          margin: 15px 0; 
          border-radius: 0 8px 8px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🚗 Vehiql</div>
          <div class="tagline">Your Trusted AI-Powered Car Marketplace</div>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p><strong>Vehiql</strong> - Find Your Dream Car with AI</p>
          <p>📧 support@vehiql.com | 📱 1-800-VEHIQL | 🌐 www.vehiql.com</p>
          <p style="margin-top: 10px;">© 2025 Vehiql. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generic email sending function
const sendEmail = async (to, subject, content, title) => {
  try {
    const htmlBody = getEmailTemplate(content, title);

    await transporter.sendMail({
      from: `Vehiql - AI Car Marketplace <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlBody,
    });

    console.log(`✅ Email sent successfully to ${to}: ${subject}`);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    return { success: false, error: error.message };
  }
};

export const sendResetPasswordLinkToEmail = async (to, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const content = `
    <h2 style="color: #1e293b; margin-bottom: 20px;">🔐 YaariGo Password Reset</h2>
    <p>Hey YaariGo Friend 👋</p>
    <p>We received a request to reset the password for your <strong>YaariGo</strong> account. Don't worry, it happens to the best of us!</p>
    
    <div class="highlight">
      <p><strong>🛡 Security Notice:</strong> This link will expire in 24 hours for your security.</p>
    </div>
    
    <p>Click the button below to create a new password:</p>
    <center>
      <a href="${resetUrl}" class="button">🔑 Reset My YaariGo Password</a>
    </center>
    
    <p>Or copy and paste this link in your browser:</p>
    <p style="word-break: break-all; color: #3b82f6; font-family: monospace; background: #f8fafc; padding: 10px; border-radius: 4px;">${resetUrl}</p>
    
    <div class="divider"></div>
    
    <p><strong>⚠ Didn't request this?</strong></p>
    <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged and your account will stay secure.</p>
    
    <p style="margin-top: 30px;">
      Warm regards,<br>
      <strong>The YaariGo Security Team</strong>
    </p>
  `;

  return await sendEmail(
    to,
    "🔐 Reset Your YaariGo Password",
    content,
    "Password Reset"
  );
};
