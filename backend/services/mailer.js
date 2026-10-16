import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Shared email transport for all emails sent by the backend.
 *
 * Uses your own domain mailbox (e.g. Hostinger) when SMTP_* is set in .env:
 *   SMTP_HOST=smtp.hostinger.com
 *   SMTP_PORT=465            (465 = SSL, 587 = STARTTLS)
 *   SMTP_USER=hr@yourdomain.com
 *   SMTP_PASS=your-mailbox-password
 *   MAIL_FROM_NAME=Xpect Group          (optional)
 *   MAIL_REPLY_TO=hr@yourdomain.com     (optional)
 *
 * Falls back to the old Gmail settings (GMAIL_USER / GMAIL_APP_PASSWORD)
 * when SMTP_* is not set.
 */

const useSmtp = () =>
  !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

export const isEmailConfigured = () =>
  useSmtp() ||
  !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

// The sender must be the mailbox you log in with — SMTP servers (and spam
// filters) reject or distrust mail "from" a different address.
export const getSenderEmail = () =>
  useSmtp() ? process.env.SMTP_USER : process.env.GMAIL_USER;

export const getFromAddress = () =>
  `"${process.env.MAIL_FROM_NAME || "Xpect Group"}" <${getSenderEmail()}>`;

// Plain-text copy of an HTML email. Emails sent with HTML only are more
// likely to be marked as spam, so every email gets a text version.
const htmlToPlainText = (html) =>
  String(html)
    .replace(/<(style|script|head|title)[\s\S]*?<\/\1>/gi, "")
    .replace(
      /<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
      (match, href, label) => {
        const text = label.replace(/<[^>]+>/g, "").trim();
        return text && text !== href ? `${text} (${href})` : href;
      },
    )
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h[1-6]|table|ul)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export const createTransporter = () => {
  const port = Number(process.env.SMTP_PORT || 465);

  const transporter = useSmtp()
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465, // SSL on 465, STARTTLS on 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

  transporter.use("compile", (mail, callback) => {
    // Add a plain-text version to any email that only has HTML
    if (typeof mail.data.html === "string" && !mail.data.text) {
      mail.data.text = htmlToPlainText(mail.data.html);
    }
    // Replies go to a real, monitored mailbox
    if (!mail.data.replyTo && process.env.MAIL_REPLY_TO) {
      mail.data.replyTo = process.env.MAIL_REPLY_TO;
    }
    callback();
  });

  return transporter;
};
