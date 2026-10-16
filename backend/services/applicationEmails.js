/**
 * Emails for the "Docs Required" → re-upload → resubmit flow.
 * Uses the shared transport in mailer.js (Hostinger SMTP or Gmail fallback).
 */
import {
  createTransporter,
  isEmailConfigured,
  getFromAddress,
} from "./mailer.js";

const getLoginUrl = () =>
  `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`;

/**
 * Sent to the employee when an admin sets their status to "Docs Required".
 * Lists the rejected documents, the admin's notes and an ERP login button
 * so they can log in and re-upload.
 */
export const sendDocsRequiredEmail = async (
  email,
  cleanerName,
  rejectedDocs = [],
  auditorNotes = "",
  username = "",
) => {
  try {
    if (!isEmailConfigured()) {
      console.warn("Email not configured - skipping docs required email");
      return { success: false, skipped: true };
    }

    const loginUrl = getLoginUrl();
    const docs = Array.isArray(rejectedDocs)
      ? rejectedDocs.filter(Boolean)
      : [];
    const notes =
      String(auditorNotes || "").trim() || "No additional notes provided.";

    const html = `
  <table width="100%" style="background:#f4f6f9;padding:40px 0;font-family:Arial, sans-serif;">
    <tr>
      <td align="center">
        <table width="520" style="background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding-bottom:10px;">
              <h1 style="margin:0;font-size:20px;color:#b45309;">Action Required: Documents Needed</h1>
            </td>
          </tr>
          <tr>
            <td style="font-size:14px;color:#4b5563;line-height:1.6;">
              Hello <b>${cleanerName}</b>,<br/><br/>
              We have reviewed your application. Some of your documents need to be
              <b>uploaded again</b> before we can complete your verification.
            </td>
          </tr>
          ${
            docs.length
              ? `<tr>
            <td style="padding-top:20px;">
              <div style="font-weight:bold;color:#111827;margin-bottom:6px;">Documents to re-upload</div>
              <ul style="padding-left:18px;margin:0;color:#374151;">
                ${docs.map((doc) => `<li style="margin-bottom:4px;">${doc}</li>`).join("")}
              </ul>
            </td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding-top:16px;">
              <div style="font-weight:bold;color:#111827;margin-bottom:6px;">Notes from our team</div>
              <p style="margin:0;color:#4b5563;line-height:1.6;">${notes}</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:20px;">
              <div style="background:#fffbeb;border-radius:8px;padding:12px;font-size:13px;color:#92400e;line-height:1.5;">
                <b>What to do next:</b><br/>
                Log in to the ERP, open <b>My Application</b>, upload the new documents
                and click <b>Submit for review</b>.
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:24px;">
              <a href="${loginUrl}" target="_blank"
                style="display:inline-block;background:#2e4150;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 28px;border-radius:8px;">
                Login to ERP Dashboard
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-top:16px;">
              <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:12px;font-size:13px;color:#374151;line-height:1.6;">
                ${username ? `<b>Username:</b> ${username}<br/>` : ""}
                <b>Password:</b> The password you created during onboarding
              </div>
              <p style="margin:10px 0 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">
                If the button does not work, copy this link into your browser:<br/>
                <a href="${loginUrl}" style="color:#2563eb;">${loginUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px;font-size:12px;color:#9ca3af;text-align:center;">
              If you have any questions or need assistance, please contact our support team.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;

    const text = [
      "Action Required: Documents Needed",
      "",
      `Hello ${cleanerName}, some of your documents need to be uploaded again.`,
      "",
      "Documents to re-upload:",
      ...(docs.length ? docs.map((doc) => `- ${doc}`) : ["- See notes below"]),
      "",
      "Notes:",
      notes,
      "",
      "Log in to the ERP, open My Application, upload the new documents and click Submit for review.",
      loginUrl,
      ...(username ? [`Username: ${username}`] : []),
      "Password: The password you created during onboarding",
      "",
      "Regards,",
      "Xpect Group",
    ].join("\n");

    await createTransporter().sendMail({
      from: getFromAddress(),
      to: email,
      subject: "Action Required: Please Re-upload Your Documents - Xpect Group",
      html,
      text,
    });

    console.log("Docs required email sent:", email);
    return { success: true };
  } catch (error) {
    console.error("Docs required email failed:", error.message);
    return { success: false };
  }
};

/**
 * Sent to all admins when an employee re-submits their documents for review.
 */
export const sendDocumentsResubmittedEmail = async (
  adminEmails,
  cleanerName,
  documentNames = [],
  staffUrl = "",
) => {
  try {
    if (!isEmailConfigured()) {
      console.warn("Email not configured - skipping resubmission email");
      return { success: false, skipped: true };
    }
    if (!Array.isArray(adminEmails) || adminEmails.length === 0) {
      console.warn("No admin emails found - skipping resubmission email");
      return { success: false, skipped: true };
    }

    const docs = documentNames.filter(Boolean);

    const html = `
  <table width="100%" style="background:#f4f6f9;padding:40px 0;font-family:Arial, sans-serif;">
    <tr>
      <td align="center">
        <table width="520" style="background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding-bottom:10px;">
              <h1 style="margin:0;font-size:20px;color:#1f2a37;">Documents Resubmitted</h1>
            </td>
          </tr>
          <tr>
            <td style="font-size:14px;color:#4b5563;line-height:1.6;">
              <b>${cleanerName}</b> has re-uploaded their documents and submitted
              their application for review again.
            </td>
          </tr>
          ${
            docs.length
              ? `<tr>
            <td style="padding-top:16px;">
              <div style="font-weight:bold;color:#111827;margin-bottom:6px;">Re-uploaded documents</div>
              <ul style="padding-left:18px;margin:0;color:#374151;">
                ${docs.map((doc) => `<li style="margin-bottom:4px;">${doc}</li>`).join("")}
              </ul>
            </td>
          </tr>`
              : ""
          }
          ${
            staffUrl
              ? `<tr>
            <td align="center" style="padding-top:24px;">
              <a href="${staffUrl}" target="_blank"
                style="display:inline-block;background:#2e4150;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 28px;border-radius:8px;">
                Review Application
              </a>
            </td>
          </tr>`
              : ""
          }
        </table>
      </td>
    </tr>
  </table>`;

    const text = [
      "Documents Resubmitted",
      "",
      `${cleanerName} has re-uploaded their documents and submitted their application for review again.`,
      ...(docs.length
        ? ["", "Re-uploaded documents:", ...docs.map((d) => `- ${d}`)]
        : []),
      ...(staffUrl ? ["", `Review: ${staffUrl}`] : []),
    ].join("\n");

    await createTransporter().sendMail({
      from: getFromAddress(),
      to: adminEmails.join(","),
      subject: `Documents resubmitted for review - ${cleanerName}`,
      html,
      text,
    });

    console.log("Resubmission email sent to admins:", adminEmails);
    return { success: true };
  } catch (error) {
    console.error("Resubmission email failed:", error.message);
    return { success: false };
  }
};
