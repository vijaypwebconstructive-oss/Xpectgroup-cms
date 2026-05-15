import nodemailer from "nodemailer";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Create reusable transporter using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

/**
 * Send invitation email with onboarding link and OTP
 * @param {string} email - Recipient email
 * @param {string} employeeName - Employee name
 * @param {string} onboardingUrl - Onboarding URL with token
 * @param {string} otp - 6-digit OTP
 */
export const sendInvitationEmail = async (
  email,
  employeeName,
  onboardingUrl,
  otp,
) => {
  try {
    // Validate email configuration
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error(
        "❌ Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env",
      );
      throw new Error("Email service not configured");
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Xpect Group" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Xpect Group – Employee Onboarding Invitation",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Xpect Group Onboarding Invitation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f2f6f9; padding: 30px; border-radius: 10px;">
            <h2 style="color: #2e4150; margin-top: 0;">Welcome to Xpect Group, ${employeeName}!</h2>
            
            <p>You have been invited to join Xpect Group. Please complete your onboarding by following the link below:</p>
            
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2e4150;">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #2e4150;">Onboarding Link:</p>
              <a href="${onboardingUrl}" style="color: #135bec; text-decoration: none; word-break: break-all; font-size: 14px;">${onboardingUrl}</a>
            </div>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #92400e;">Your OTP Code:</p>
              <p style="font-size: 24px; font-weight: bold; color: #2e4150; margin: 10px 0; letter-spacing: 4px; font-family: monospace;">${otp}</p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #92400e;">⚠️ This OTP will expire in 10 minutes.</p>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              <strong>Instructions:</strong><br>
              1. Click the onboarding link above<br>
              2. Enter the OTP code when prompted<br>
              3. Complete the onboarding form
            </p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #e7ebf3; padding-top: 20px;">
              If you did not expect this invitation, please ignore this email.<br>
              This is an automated message from Xpect Group.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
Xpect Group – Employee Onboarding Invitation

Welcome to Xpect Group, ${employeeName}!

You have been invited to join Xpect Group. Please complete your onboarding by following the link below:

Onboarding Link:
${onboardingUrl}

Your OTP Code: ${otp}

⚠️ This OTP will expire in 10 minutes.

Instructions:
1. Click the onboarding link above
2. Enter the OTP code when prompted
3. Complete the onboarding form

If you did not expect this invitation, please ignore this email.
This is an automated message from Xpect Group.
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully:", {
      messageId: info.messageId,
      to: email,
      subject: mailOptions.subject,
    });

    return {
      success: true,
      messageId: info.messageId,
      to: email,
    };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send OTP resend email
 * @param {string} email - Recipient email
 * @param {string} employeeName - Employee name
 * @param {string} onboardingUrl - Onboarding URL with token
 * @param {string} otp - New 6-digit OTP
 */
export const sendOTPResendEmail = async (
  email,
  employeeName,
  onboardingUrl,
  otp,
) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("❌ Gmail credentials not configured");
      throw new Error("Email service not configured");
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Xpect Group" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Xpect Group – Your Onboarding OTP",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f2f6f9; padding: 30px; border-radius: 10px;">
            <h2 style="color: #2e4150; margin-top: 0;">Your OTP Has Been Resent</h2>
            
            <p>Dear ${employeeName},</p>
            
            <p>Your OTP has been resent. Please use the code below to verify your identity:</p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #92400e;">Your OTP Code:</p>
              <p style="font-size: 24px; font-weight: bold; color: #2e4150; margin: 10px 0; letter-spacing: 4px; font-family: monospace;">${otp}</p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #92400e;">⚠️ This OTP will expire in 10 minutes.</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2e4150;">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #2e4150;">Onboarding Link:</p>
              <a href="${onboardingUrl}" style="color: #135bec; text-decoration: none; word-break: break-all; font-size: 14px;">${onboardingUrl}</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #e7ebf3; padding-top: 20px;">
              This is an automated message from Xpect Group.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
Xpect Group – Your Onboarding OTP

Dear ${employeeName},

Your OTP has been resent. Please use the code below to verify your identity:

Your OTP Code: ${otp}

⚠️ This OTP will expire in 10 minutes.

Onboarding Link:
${onboardingUrl}

This is an automated message from Xpect Group.
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ OTP resend email sent:", {
      messageId: info.messageId,
      to: email,
    });

    return {
      success: true,
      messageId: info.messageId,
      to: email,
    };
  } catch (error) {
    console.error("❌ Error resending OTP email:", error);
    throw new Error(`Failed to resend OTP email: ${error.message}`);
  }
};

/**
 * Send training expiry reminder email to cleaner
 * @param {string} email - Recipient (cleaner) email
 * @param {string} cleanerName - Cleaner name
 * @param {string} courseName - Training course name
 * @param {string} expiryDate - Expiry date (YYYY-MM-DD)
 */
export const sendTrainingExpiryReminder = async (
  email,
  cleanerName,
  courseName,
  expiryDate,
) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("❌ Gmail credentials not configured");
      throw new Error("Email service not configured");
    }

    const transporter = createTransporter();
    const formattedDate = expiryDate
      ? new Date(expiryDate).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : expiryDate;

    const mailOptions = {
      from: `"Xpect Group" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Xpect Group – Training Certification Expiring Soon",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f2f6f9; padding: 30px; border-radius: 10px;">
            <h2 style="color: #2e4150; margin-top: 0;">Training Certification Expiring Soon</h2>
            
            <p>Dear ${cleanerName},</p>
            
            <p>This is a reminder that your training certification is expiring soon.</p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0 0 8px 0; font-weight: bold; color: #92400e;">Training Course:</p>
              <p style="margin: 0 0 8px 0; color: #2e4150;">${courseName}</p>
              <p style="margin: 0 0 0 0; font-weight: bold; color: #92400e;">Expiry Date:</p>
              <p style="margin: 0; color: #2e4150;">${formattedDate}</p>
            </div>
            
            <p>Please arrange to renew your certification before the expiry date.</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #e7ebf3; padding-top: 20px;">
              This is an automated message from Xpect Group.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
Xpect Group – Training Certification Expiring Soon

Dear ${cleanerName},

This is a reminder that your training certification is expiring soon.

Training Course: ${courseName}
Expiry Date: ${formattedDate}

Please arrange to renew your certification before the expiry date.

This is an automated message from Xpect Group.
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Training expiry reminder sent:", {
      messageId: info.messageId,
      to: email,
      cleanerName,
      courseName,
    });

    return {
      success: true,
      messageId: info.messageId,
      to: email,
    };
  } catch (error) {
    console.error("❌ Error sending training expiry reminder:", error);
    throw new Error(
      `Failed to send training expiry reminder: ${error.message}`,
    );
  }
};

/**
 * Send PPE invoice email to client with attachment
 * @param {string} email - Client email
 * @param {string} clientName - Client name
 * @param {string} attachmentFilename - Invoice filename
 * @param {string} attachmentBase64 - Invoice file content (base64)
 */
export const sendPPEInvoice = async (
  email,
  clientName,
  attachmentFilename,
  attachmentBase64,
) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("❌ Gmail credentials not configured");
      throw new Error("Email service not configured");
    }

    const transporter = createTransporter();

    const attachments = [];
    if (attachmentFilename && attachmentBase64) {
      let content = attachmentBase64;
      if (content.includes(",")) {
        content = content.split(",")[1] || content;
      }
      attachments.push({
        filename: attachmentFilename,
        content: Buffer.from(content, "base64"),
      });
    }

    const mailOptions = {
      from: `"Xpect Group" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "PPE Invoice – Xpect Group",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f2f6f9; padding: 30px; border-radius: 10px;">
            <h2 style="color: #2e4150; margin-top: 0;">PPE Invoice – Xpect Group</h2>
            <p>Dear Client,</p>
            <p>Please find attached the PPE invoice issued for your site.</p>
            <p>Regards<br>Xpect Group</p>
            <p style="margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #e7ebf3; padding-top: 20px;">
              This is an automated message from Xpect Group.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
Dear Client,

Please find attached the PPE invoice issued for your site.

Regards
Xpect Group
      `,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ PPE invoice sent:", {
      messageId: info.messageId,
      to: email,
      clientName,
    });

    return {
      success: true,
      messageId: info.messageId,
      to: email,
    };
  } catch (error) {
    console.error("❌ Error sending PPE invoice:", error);
    throw new Error(`Failed to send PPE invoice: ${error.message}`);
  }
};

/**
 * Send finance invoice email to client (HTML body with details)
 * @param {string} email - Client email
 * @param {string} clientName - Client name
 * @param {object} invoice - Invoice document with billBy, billTo, serviceItems, amounts, etc.
 */
export const sendFinanceInvoice = async (
  email,
  clientName,
  invoice,
  pdfBuffer,
) => {
  const transporter = createTransporter();

  const attachments = [];

  if (pdfBuffer) {
    attachments.push({
      filename: `Invoice-${invoice.invoiceNumber}.pdf`,
      content: pdfBuffer,
    });
  }

  const mailOptions = {
    from: `"Xpect Group" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Invoice ${invoice.invoiceNumber} – Xpect Group`,
    html: `<p>Please find your invoice attached.</p>`,
    attachments, // ✅ NOW CORRECT
  };

  await transporter.sendMail(mailOptions);
};

export const sendQuotationEmail = async (
  email,
  clientName,
  quotation,
  pdfBuffer,
) => {
  const transporter = createTransporter();

  const attachments = [];

  if (pdfBuffer) {
    attachments.push({
      filename: `Quotation-${quotation.quotationNumber}.pdf`,
      content: pdfBuffer,
    });
  }

  const mailOptions = {
    from: `"Xpect Group" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Quotation ${quotation.quotationNumber}`,
    html: `<p>Please find your quotation attached.</p>`,
    attachments,
  };

  await transporter.sendMail(mailOptions);
};
/**
 * Send salary slip email to cleaner
 * @param {string} email - Cleaner email
 * @param {string} cleanerName - Cleaner/employee name
 * @param {object} record - Payroll record { workerName, month, year, hoursWorked, hourlyRate, totalSalary, paymentStatus, paymentDate }
 */
export const sendSalarySlip = async (email, cleanerName, record) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn(
        "⚠️ Gmail credentials not configured – skipping salary slip email",
      );
      return { success: false, skipped: true, reason: "Email not configured" };
    }

    const transporter = createTransporter();
    const months = [
      "",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthLabel = months[record.month] || record.month;
    const year = record.year || "";
    const hours = record.hoursWorked ?? 0;
    const rate = record.hourlyRate ?? 0;
    const salary = record.totalSalary ?? 0;
    const status = record.paymentStatus || "Paid";
    const paidDate = record.paymentDate || "";

    const mailOptions = {
      from: `"Xpect Group" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Salary Slip – ${monthLabel} ${year} – Xpect Group`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f2f6f9; padding: 30px; border-radius: 10px;">
            <h2 style="color: #2e4150; margin-top: 0;">Salary Slip – Xpect Group</h2>
            <p>Dear ${cleanerName},</p>
            <p>Please find your salary slip details for <strong>${monthLabel} ${year}</strong>.</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #e7ebf3; padding-top: 20px;">
              This is an automated message from Xpect Group.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `Salary Slip – ${monthLabel} ${year}\n\nEmployee: ${record.workerName || cleanerName}\nHours: ${hours}\nRate: £${Number(rate).toFixed(2)}\nGross Salary: £${Number(salary).toFixed(2)}\nPayment Status: ${status}\nDate Paid: ${paidDate || "—"}\n\nXpect Group`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Salary slip sent:", {
      messageId: info.messageId,
      to: email,
      cleanerName,
    });
    return { success: true, messageId: info.messageId, to: email };
  } catch (error) {
    console.error("❌ Error sending salary slip:", error);
    throw new Error(`Failed to send salary slip: ${error.message}`);
  }
};

/**
 * Send salary slip email with PDF attachment
 * @param {string} email - Cleaner email
 * @param {string} cleanerName - Cleaner/employee name
 * @param {object} record - Payroll record
 * @param {string} pdfFullPath - Absolute path to PDF file on disk
 * @param {string} pdfFilename - Filename for attachment (e.g. salary-slip-jan-2026.pdf)
 */
export const sendSalarySlipWithPdf = async (
  email,
  cleanerName,
  record,
  pdfFullPath,
  pdfFilename,
) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn(
        "⚠️ Gmail credentials not configured – skipping salary slip email",
      );
      return { success: false, skipped: true, reason: "Email not configured" };
    }

    if (!fs.existsSync(pdfFullPath)) {
      throw new Error(`PDF file not found: ${pdfFullPath}`);
    }

    const transporter = createTransporter();
    const months = [
      "",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthLabel = months[record.month] || record.month;
    const year = record.year || "";
    const hours = record.hoursWorked ?? 0;
    const rate = record.hourlyRate ?? 0;
    const salary = record.totalSalary ?? 0;
    const status = record.paymentStatus || "Paid";
    const paidDate = record.paymentDate || "";

    const mailOptions = {
      from: `"Xpect Group" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Salary Slip – ${monthLabel} ${year} – Xpect Group`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f2f6f9; padding: 30px; border-radius: 10px;">
            <h2 style="color: #2e4150; margin-top: 0;">Salary Slip – Xpect Group</h2>
            <p>Dear ${cleanerName},</p>
            <p>Please find your salary slip details for <strong>${monthLabel} ${year}</strong> attached as a PDF.</p>
            
            <p style="margin-top: 20px;">Your salary slip PDF is attached to this email.</p>
            <p style="margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #e7ebf3; padding-top: 20px;">
              This is an automated message from Xpect Group.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `Salary Slip – ${monthLabel} ${year}\n\nEmployee: ${record.workerName || cleanerName}\nGross Salary: £${Number(salary).toFixed(2)}\nPayment Date: ${paidDate || "—"}\n\nYour salary slip PDF is attached.\n\nXpect Group`,
      attachments: [
        {
          filename: pdfFilename || `salary-slip-${monthLabel}-${year}.pdf`,
          content: fs.readFileSync(pdfFullPath),
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Salary slip sent with PDF:", {
      messageId: info.messageId,
      to: email,
      cleanerName,
    });
    return { success: true, messageId: info.messageId, to: email };
  } catch (error) {
    console.error("❌ Error sending salary slip with PDF:", error);
    throw new Error(`Failed to send salary slip: ${error.message}`);
  }
};

/**
 * Send verification status update email to cleaner
 * @param {string} email
 * @param {string} cleanerName
 * @param {string} status
 * @param {string[]} rejectedDocs
 * @param {string} auditorNotes
 */
export const sendVerificationStatusEmail = async (
  email,
  cleanerName,
  status,
  rejectedDocs = [],
  auditorNotes = "",
) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn("⚠️ Email not configured – skipping verification email");
      return { success: false, skipped: true };
    }

    const transporter = createTransporter();

    let subject = "";
    let html = "";
    let text = "";

    if (status === "Verified") {
      subject = "🎉 Verification Approved – Xpect Group";

      // html = `
      //   <div class="verification-email-container" style="font-family: Arial; padding: 20px;">
      //     <h2 style="color:#2e4150;">Congratulations ${cleanerName}!</h2>
      //     <p>Your background verification has been <b style="color:green;">approved</b>.</p>
      //     <p>You are now eligible to start working.</p>
      //     <br/>
      //     <p>Regards,<br/><strong>Xpect Group</strong></p>
      //   </div>
      // `;
      html = getVerifiedTemplate(cleanerName);

      // text = `Hi ${cleanerName}, your verification is approved. You can now start working.`;
    }

    if (status === "Rejected") {
      subject = "⚠️ Verification Update – Xpect Group";

      const safeRejectedDocs = Array.isArray(rejectedDocs)
        ? rejectedDocs.filter(Boolean)
        : [];
      const rejectedDocsHtml = safeRejectedDocs.length
        ? `<ul style="margin:8px 0 16px 20px; padding:0;">
            ${safeRejectedDocs.map((doc) => `<li style="margin:4px 0;">${doc}</li>`).join("")}
          </ul>`
        : '<p style="margin:8px 0 16px 0;">No rejected documents listed.</p>';
      const reasonText =
        String(auditorNotes || "").trim() || "No additional notes provided.";

      // html = `
      //   <div style="font-family: Arial, sans-serif; padding: 20px; color: #0d121b;">
      //     <h2 style="color:#2e4150; margin:0 0 16px 0;">Verification Update</h2>
      //     <p style="margin:0 0 16px 0;">Hello ${cleanerName}, your background verification was <b style="color:#c62828;">rejected</b>.</p>
      //     <h3 style="margin:0 0 8px 0; color:#2e4150;">Rejected Documents</h3>
      //     ${rejectedDocsHtml}
      //     <h3 style="margin:0 0 8px 0; color:#2e4150;">Reason</h3>
      //     <p style="margin:0 0 16px 0;">${reasonText}</p>
      //     <p>Regards,<br/><strong>Xpect Group</strong></p>
      //   </div>
      // `;

      html = getRejectedTemplate(cleanerName, safeRejectedDocs, reasonText);

      text = [
        "Verification Update",
        "",
        `Hello ${cleanerName}, your background verification was rejected.`,
        "",
        "Rejected Documents:",
        ...(safeRejectedDocs.length
          ? safeRejectedDocs.map((doc) => `- ${doc}`)
          : ["- No rejected documents listed."]),
        "",
        "Reason:",
        reasonText,
        "",
        "Regards,",
        "Xpect Group",
      ].join("\n");
    }

    if (!subject) return;

    const info = await transporter.sendMail({
      from: `"Xpect Group" <${process.env.GMAIL_USER}>`,
      to: email,
      subject,
      html,
      text,
    });

    console.log("✅ Verification email sent:", {
      to: email,
      status,
      messageId: info.messageId,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Verification email failed:", error.message);
    return { success: false };
  }
};

const getRejectedTemplate = (cleanerName, rejectedDocs, reasonText) => {
  return `
 <table width="100%" style="background:#f4f6f9;padding:40px 0;font-family:Arial, sans-serif;">
    <tr>
      <td align="center">

        <table width="520" style="background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td align="left" style="padding-bottom:10px;">
              <h1 style="margin:0;font-size:20px;color:#1f2a37;">
                Verification Update
              </h1>
            </td>
          </tr>

          <!-- Status -->
          <tr>
            <td style="font-size:14px;color:#4b5563;line-height:1.6;">
              Hello <b>${cleanerName}</b>,<br/><br/>
              Thank you for submitting your documents. After reviewing your submission, we regret to inform you that your verification has been 
              <span style="color:#e53935;font-weight:bold;">rejected</span>.
            </td>
          </tr>

          ${
            rejectedDocs.length
              ? `
          <!-- Rejected Docs -->
          <tr>
            <td style="padding-top:20px;">
              <div style="font-weight:bold;color:#111827;margin-bottom:6px;">
                Rejected Documents
              </div>
              <ul style="padding-left:18px;margin:0;color:#374151;">
                ${rejectedDocs.map((doc) => `<li style="margin-bottom:4px;">${doc}</li>`).join("")}
              </ul>
            </td>
          </tr>`
              : ""
          }

          <!-- Reason -->
          <tr>
            <td style="padding-top:16px;">
              <div style="font-weight:bold;color:#111827;margin-bottom:6px;">
                Reason for Rejection
              </div>
              <p style="margin:0;color:#4b5563;line-height:1.6;">
                ${reasonText}
              </p>
            </td>
          </tr>

          <!-- Guidance -->
          <tr>
            <td style="padding-top:20px;">
              <div style="background:#f1f5f9;border-radius:8px;padding:12px;font-size:13px;color:#475569;line-height:1.5;">
                <b>Next Steps:</b><br/>
                Please review the above feedback carefully and ensure that all required documents are accurate, clear, and up to date before resubmitting.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;font-size:12px;color:#9ca3af;text-align:center;">
              If you have any questions or need assistance, please contact our support team.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
  `;
};

const getVerifiedTemplate = (cleanerName) => {
  return `
  <table width="100%" style="background:#f4f6f9;padding:40px 0;font-family:Arial, sans-serif;">
  <tr>
    <td align="center">

      <table width="520" style="background:#ffffff;border-radius:12px;padding:32px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <tr>
          <td style="padding-bottom:10px;">
            <h1 style="margin:0;font-size:20px;color:#2e7d32;">
              You're Verified 🎉
            </h1>
          </td>
        </tr>

        <!-- Message -->
        <tr>
          <td style="font-size:14px;color:#4b5563;line-height:1.6;">
            Hello <b>${cleanerName}</b>,<br/><br/>
            We’re pleased to inform you that your background verification has been 
            <span style="color:#2e7d32;font-weight:bold;">successfully approved</span>.
            <br/><br/>
            You are now eligible to begin your assigned work.
          </td>
        </tr>

        <!-- Info Box -->
        <tr>
          <td style="padding-top:20px;">
            <div style="background:#ecfdf5;border-radius:8px;padding:12px;font-size:13px;color:#065f46;line-height:1.5;">
              <b>Next Steps:</b><br/>
              Please ensure you stay compliant with all company policies and keep your documents up to date.
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding-top:24px;font-size:12px;color:#9ca3af;">
            If you have any questions, feel free to contact our support team.
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
  `;
};

export const sendERPAccessEmail = async (
  email,
  cleanerName,
  username,
  loginUrl,
) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn("⚠️ Email not configured");
      return { success: false };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Xpect Group" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your ERP Portal Access is Ready",

      html: `
      <table width="100%" style="background:#f4f6f9;padding:40px 0;font-family:Arial,sans-serif;">
        <tr>
          <td align="center">

            <table width="600" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

              <!-- Header -->
              <tr>
                <td style="background:#2e4150;padding:30px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:24px;">
                    Welcome to Xpect Group ERP
                  </h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:35px;">

                  <p style="font-size:15px;color:#555;line-height:1.7;margin-top:0;">
                    Hello <b>${cleanerName}</b>,
                  </p>

                  <p style="font-size:15px;color:#555;line-height:1.7;">
                    Your onboarding form has been submitted successfully.
                  </p>

                  <p style="font-size:15px;color:#555;line-height:1.7;">
                    You can now login to the Xpect Group ERP Portal using your credentials below.
                  </p>

                  <table width="100%" style="margin:25px 0;background:#f6f7fb;border-radius:12px;padding:20px;">
                    <tr>
                      <td>
                        <p style="margin:0 0 10px;font-size:14px;color:#777;">
                          <b>Username:</b> ${username}
                        </p>

                        <p style="margin:0;font-size:14px;color:#777;">
                          <b>Password:</b> The password you created during onboarding
                        </p>
                      </td>
                    </tr>
                  </table>

                  <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:30px auto;">
                    <tr>
                      <td align="center" bgcolor="#2e4150" style="border-radius:10px;">
                        <a href="${loginUrl}"
                          style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">
                          Login to ERP Portal
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="font-size:14px;color:#777;line-height:1.7;">
                    Please keep your login credentials secure and do not share them with anyone.
                  </p>

                  <p style="font-size:14px;color:#777;line-height:1.7;">
                    Your ERP access may remain restricted until background verification is completed.
                  </p>

                  <p style="font-size:14px;color:#555;margin-top:35px;">
                    Regards,<br/>
                    <b>Xpect Group Management</b>
                  </p>

                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>
      `,

      text: `
Welcome to Xpect Group ERP

Hello ${cleanerName},

Your onboarding form has been submitted successfully.

You can now login to the ERP portal.

Username: ${username}

Login URL:
${loginUrl}

Regards,
Xpect Group
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ ERP access email sent:", {
      messageId: info.messageId,
      to: email,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ ERP access email failed:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

export const sendPasswordResetOTP = async (email, username, otp) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn("⚠️ Email not configured");

      return {
        success: false,
      };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Xpect Group" <${process.env.GMAIL_USER}>`,

      to: email,

      subject: "Xpect Group ERP Password Reset OTP",

      html: `
      <table width="100%" style="background:#f4f6f9;padding:40px 0;font-family:Arial,sans-serif;">
        <tr>
          <td align="center">

            <table width="560" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

              <!-- Header -->
              <tr>
                <td style="background:#2e4150;padding:30px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:24px;">
                    Password Reset Request
                  </h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:35px;">

                  <p style="font-size:15px;color:#555;line-height:1.7;margin-top:0;">
                    Hello <b>${username}</b>,
                  </p>

                  <p style="font-size:15px;color:#555;line-height:1.7;">
                    We received a request to reset your ERP account password.
                  </p>

                  <p style="font-size:15px;color:#555;line-height:1.7;">
                    Please use the OTP below to verify your identity:
                  </p>

                  <div style="margin:30px 0;text-align:center;">
                    <div style="display:inline-block;background:#f6f7fb;padding:18px 30px;border-radius:12px;font-size:32px;font-weight:bold;letter-spacing:8px;color:#2e4150;">
                      ${otp}
                    </div>
                  </div>

                  <div style="background:#fff7ed;border:1px solid #fed7aa;padding:16px;border-radius:12px;margin-top:20px;">
                    <p style="margin:0;font-size:13px;color:#c2410c;">
                      ⚠️ This OTP will expire in 10 minutes.
                    </p>
                  </div>

                  <p style="font-size:14px;color:#777;line-height:1.7;margin-top:30px;">
                    If you did not request a password reset, please ignore this email.
                  </p>

                  <p style="font-size:14px;color:#555;margin-top:35px;">
                    Regards,<br/>
                    <b>Xpect Group Management</b>
                  </p>

                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>
      `,

      text: `
Password Reset Request

Hello ${username},

Your OTP code is:

${otp}

This OTP will expire in 10 minutes.

Regards,
Xpect Group
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Password reset OTP sent:", {
      messageId: info.messageId,
      to: email,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Password reset OTP failed:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};
