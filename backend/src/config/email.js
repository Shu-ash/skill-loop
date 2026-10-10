import nodemailer from "nodemailer";

/**
 * Creates and returns a Nodemailer transporter.
 * Supports standard SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
 * as well as direct Gmail configuration (EMAIL_USER, EMAIL_PASS).
 */
export const createEmailTransporter = () => {
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

  if (smtpHost && emailUser && emailPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  }

  if (emailUser && emailPass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  }

  // Fallback in local development if no credentials configured
  return null;
};

export const verifyTransporter = async () => {
  const transporterInstance = createEmailTransporter();
  if (!transporterInstance) {
    console.log("ℹ️ [EMAIL CONFIG] No SMTP credentials in .env. Running in dev-logger mode.");
    return false;
  }

  try {
    await transporterInstance.verify();
    console.log("✅ [EMAIL CONFIG] SMTP Email Transporter connected successfully.");
    return true;
  } catch (error) {
    console.warn("⚠️ [EMAIL CONFIG] SMTP connection test failed:", error.message);
    return false;
  }
};

const transporter = {
  sendMail: async (mailOptions) => {
    const activeTransporter = createEmailTransporter();
    if (activeTransporter) {
      return activeTransporter.sendMail(mailOptions);
    }
    console.log("📧 [MOCK EMAIL] Transporter called with:", mailOptions.to, mailOptions.subject);
    return { mock: true };
  }
};

export default transporter;
