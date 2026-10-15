import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

/**
 * Creates and returns a Nodemailer transporter.
 * Supports standard SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
 * as well as direct Brevo / Gmail configuration.
 */
export const createEmailTransporter = () => {
  const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const smtpHost = process.env.SMTP_HOST || (emailUser && emailUser.includes("brevo.com") ? "smtp-relay.brevo.com" : null);
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

  if (emailUser && emailPass && !emailUser.includes("brevo.com")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  }

  return null;
};

/**
 * Send email directly via Brevo REST API (HTTPS port 443).
 * Ideal for cloud platforms like Render where SMTP ports may occasionally face latency or firewalls.
 */
export const sendViaBrevoApi = async ({ to, subject, html, text }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return null;

  const senderEmail = process.env.EMAIL_FROM || "harshviswakarma9749247288@gmail.com";
  const senderName = "SkillLoop";
  const toEmail = typeof to === "string" ? to : to?.address || to?.[0]?.email;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: toEmail }],
      subject,
      htmlContent: html || `<p>${text || ""}</p>`
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Brevo API HTTP ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  return { messageId: data.messageId, provider: "brevo-api" };
};

export const verifyTransporter = async () => {
  let isReady = false;

  // 1. Check Brevo REST API if configured
  if (process.env.BREVO_API_KEY) {
    try {
      const res = await fetch("https://api.brevo.com/v3/account", {
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY
        }
      });
      if (res.ok) {
        console.log("✅ [EMAIL CONFIG] Brevo REST API authenticated successfully.");
        isReady = true;
      } else {
        console.warn(`⚠️ [EMAIL CONFIG] Brevo API key check returned status ${res.status}`);
      }
    } catch (err) {
      console.warn("⚠️ [EMAIL CONFIG] Brevo API verification failed:", err.message);
    }
  }

  // 2. Check SMTP Transporter if configured
  const transporterInstance = createEmailTransporter();
  if (transporterInstance) {
    try {
      await transporterInstance.verify();
      console.log("✅ [EMAIL CONFIG] SMTP Email Transporter (Brevo/Relay) connected successfully.");
      isReady = true;
    } catch (error) {
      console.warn("⚠️ [EMAIL CONFIG] SMTP connection test failed:", error.message);
    }
  }

  if (!isReady) {
    console.log("ℹ️ [EMAIL CONFIG] Running in mock/dev-logger email mode.");
  }

  return isReady;
};

const transporter = {
  sendMail: async (mailOptions) => {
    // Priority 1: Brevo REST API (HTTPS port 443 - zero firewall/port issues on Render)
    if (process.env.BREVO_API_KEY) {
      try {
        const apiResult = await sendViaBrevoApi(mailOptions);
        if (apiResult) {
          return apiResult;
        }
      } catch (apiErr) {
        console.warn("⚠️ [EMAIL CONFIG] Brevo REST API failed, falling back to SMTP:", apiErr.message);
      }
    }

    // Priority 2: Nodemailer SMTP
    const activeTransporter = createEmailTransporter();
    if (activeTransporter) {
      return activeTransporter.sendMail(mailOptions);
    }

    // Fallback: Local logger
    console.log("📧 [MOCK EMAIL] Transporter called with:", mailOptions.to, mailOptions.subject);
    return { mock: true };
  }
};

export default transporter;
