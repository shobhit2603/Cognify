import nodemailer from "nodemailer";
import envConfig from "../config/env.config.js";

// Create a reusable transporter object
const transporter = envConfig.NODE_ENV === "test"
  ? nodemailer.createTransport({ jsonTransport: true })
  : nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: envConfig.SMTP_EMAIL || "test@gmail.com", // You'll need to set this in .env
        pass: envConfig.SMTP_APP_PASSWORD || "testpassword", // You'll need to set this in .env
      },
    });

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} [options.html] - HTML body
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: `"Cognify" <${envConfig.SMTP_EMAIL || "test@gmail.com"}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    if (envConfig.NODE_ENV !== "test") {
      console.log("Email sent: %s", info.messageId);
    }
    return info;
  } catch (error) {
    if (envConfig.NODE_ENV !== "test") {
      console.error("Error sending email:", error);
    }
    throw new Error("Email could not be sent");
  }
};
