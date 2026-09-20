// src/utils/emailService.js
import crypto from "crypto";
import transporter from "../config/email.js";

/**
 * Generate 6-Digit Cryptographically Secure OTP
 */
export const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const generate6DigitOtp = generateOtp;

/**
 * Hash OTP using SHA-256 for secure MongoDB storage
 */
export const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(String(otp).trim())
    .digest("hex");
};

/**
 * Send OTP Email via Nodemailer or Dev Console Fallback
 * Supports both sendOtpEmail(email, otp) and sendOtpEmail({ to, otp, purpose, name })
 */
export const sendOtpEmail = async (param1, param2) => {
  let to;
  let otp;
  let purpose = "verify_email";
  let name = "SkillLoop Member";

  if (typeof param1 === "object" && param1 !== null) {
    to = param1.to || param1.email;
    otp = param1.otp;
    purpose = param1.purpose || "verify_email";
    name = param1.name || "SkillLoop Member";
  } else {
    to = param1;
    otp = param2;
  }

  const isReset = purpose === "forgot_password";
  const isLogin = purpose === "login";

  const title = isReset
    ? "Reset Your SkillLoop Password"
    : isLogin
      ? "Your SkillLoop Login Verification Code"
      : "Verify Your SkillLoop Account";

  const headline = isReset
    ? "Password Reset Request"
    : isLogin
      ? "One-Time Login Code"
      : "Verify your SkillLoop email";

  const description = isReset
    ? "We received a request to reset your password. Use the verification code below to set a new password:"
    : isLogin
      ? "Use this 6-digit verification code to complete your secure sign-in:"
      : "Thank you for joining SkillLoop! Your verification code is:";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #0f172a; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 32px 28px; text-align: center; }
        .greeting { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
        .desc { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 20px; }
        .otp-box { background: #eef2ff; border: 2px dashed #6366f1; border-radius: 16px; padding: 16px 24px; display: inline-block; margin: 10px auto 20px auto; letter-spacing: 8px; font-size: 32px; font-weight: 800; color: #4338ca; font-family: monospace; }
        .expiry { font-size: 13px; color: #ef4444; font-weight: 600; margin-bottom: 20px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔄 SkillLoop</h1>
          <p>Peer-to-Peer Skill Exchange</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${name},</div>
          <h2>${headline}</h2>
          <p class="desc">${description}</p>
          
          <div class="otp-box">${otp}</div>
          
          <p class="expiry">⏱️ This code expires in 10 minutes.</p>
          <p style="font-size: 13px; color: #64748b;">If you didn't request this code, you can ignore this email.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} SkillLoop Community. Sent securely to ${to}
        </div>
      </div>
    </body>
    </html>
  `;

  console.log(`\n======================================================`);
  console.log(`📧 [EMAIL SERVICE] OTP SENT TO: ${to}`);
  console.log(`🎯 PURPOSE: ${purpose.toUpperCase()}`);
  console.log(`🔑 OTP CODE: [ ${otp} ]`);
  console.log(`⏱️ EXPIRES IN: 10 MINUTES`);
  console.log(`======================================================\n`);

  try {
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER ? `"SkillLoop" <${process.env.EMAIL_USER}>` : '"SkillLoop" <no-reply@skillloop.com>';
    await transporter.sendMail({
      from: fromAddress,
      to,
      subject: `Your SkillLoop Verification Code - ${otp}`,
      html: htmlContent
    });
    console.log(`🟢 [EMAIL SERVICE] Email delivered to ${to}`);
    return { success: true, otp };
  } catch (error) {
    console.error("⚠️ [EMAIL SERVICE] Email delivery warning:", error.message);
    return { success: true, otp };
  }
};
