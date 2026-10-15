import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { fileURLToPath } from "url";
import Cleaner from "../models/Cleaner.js";
import User from "../models/userModel.js";
import { authenticateEmployeeUser } from "../middleware/auth.js";
import { logActivity } from "../services/activityLogger.js";
import { sendDocumentsResubmittedEmail } from "../services/applicationEmails.js";

/**
 * "My Application" — routes for a logged-in employee whose verification is
 * "Docs Required". The employee can only read and change their OWN record:
 *   GET    /api/my-application                       → own application
 *   PATCH  /api/my-application/details               → update basic details
 *   POST   /api/my-application/documents/:docId      → re-upload a rejected document
 *   POST   /api/my-application/submit                → submit for review again
 */

const router = express.Router();
router.use(authenticateEmployeeUser);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCUMENTS_DIR = path.join(__dirname, "..", "uploads", "documents");
const DOCUMENTS_URL = "/api/uploads/documents";
fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const randomName = (ext) =>
  `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, DOCUMENTS_DIR),
    filename: (req, file, cb) =>
      cb(null, randomName(ALLOWED_MIME_TYPES[file.mimetype] || "bin")),
  }),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES[file.mimetype]) return cb(null, true);
    cb(new Error("Only PDF, JPG, PNG or WEBP files are allowed."));
  },
});

const DOCS_REQUIRED = "Docs Required";

const isUkOrIrish = (citizenshipStatus) =>
  citizenshipStatus === "UK Citizen" || citizenshipStatus === "Irish Citizen";

// Only the fields the employee is allowed to see (no passwords, no base64 blobs)
const toApplicationResponse = (cleaner, username) => ({
  id: cleaner.id,
  applicationRef: cleaner.applicationRef || "",
  name: cleaner.name,
  email: cleaner.email,
  dob: cleaner.dob,
  phoneNumber: cleaner.phoneNumber,
  address: cleaner.address,
  citizenshipStatus: cleaner.citizenshipStatus,
  visaType: cleaner.visaType || "",
  shareCode: cleaner.shareCode || "",
  canEditShareCode: !isUkOrIrish(cleaner.citizenshipStatus),
  avatar: cleaner.avatar || "",
  verificationStatus: cleaner.verificationStatus,
  auditorNotes: cleaner.auditorNotes || "",
  resubmittedAt: cleaner.resubmittedAt || null,
  resubmissionCount: cleaner.resubmissionCount || 0,
  username: username || cleaner.accountDetails?.username || "",
  documents: (cleaner.documents || []).map((doc) => ({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    status: doc.status,
    uploadDate: doc.uploadDate,
    fileName: doc.fileName || "",
    hasFile: !!doc.fileUrl,
    reuploadedAt: doc.reuploadedAt || null,
  })),
});

// Copy an old document file into the history folder and return its URL.
// Old onboarding documents are stored as base64 data URLs; they are written
// to disk so the history does not bloat the staff record.
const archiveOldFile = (fileUrl) => {
  if (!fileUrl) return "";
  if (!fileUrl.startsWith("data:")) return fileUrl; // already a file path

  const match = fileUrl.match(/^data:([^;]+);base64,(.*)$/);
  if (!match) return "";
  const ext = ALLOWED_MIME_TYPES[match[1]] || "bin";
  const fileName = `history-${randomName(ext)}`;
  fs.writeFileSync(
    path.join(DOCUMENTS_DIR, fileName),
    Buffer.from(match[2], "base64"),
  );
  return `${DOCUMENTS_URL}/${fileName}`;
};

const removeUploadedFile = (file) => {
  if (file?.path) fs.unlink(file.path, () => {});
};

const createNameSlug = (name) =>
  String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Same format as the frontend staff URL: /staff/<first-name>-<id>
const getStaffUrl = (cleaner) => {
  const firstName = String(cleaner.name || "").split(" ")[0];
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  return `${frontendUrl}/staff/${createNameSlug(firstName)}-${createNameSlug(cleaner.id)}`;
};

// GET /api/my-application
router.get("/", async (req, res) => {
  try {
    const cleaner = await Cleaner.findOne({
      id: req.employeeUser.cleanerId,
    }).lean();

    if (!cleaner) {
      return res.status(404).json({
        error: "Not found",
        message: "Your staff record could not be found.",
      });
    }

    res.json(toApplicationResponse(cleaner, req.employeeUser.username));
  } catch (error) {
    console.error("Get my application error:", error);
    res.status(500).json({
      error: "Failed to load application",
      message: error.message,
    });
  }
});

// PATCH /api/my-application/details — phone, address, share code
router.patch("/details", async (req, res) => {
  try {
    const cleaner = await Cleaner.findOne({
      id: req.employeeUser.cleanerId,
    }).lean();

    if (!cleaner) {
      return res.status(404).json({
        error: "Not found",
        message: "Your staff record could not be found.",
      });
    }

    if (cleaner.verificationStatus !== DOCS_REQUIRED) {
      return res.status(403).json({
        error: "Not allowed",
        message: "Your details can only be changed while documents are required.",
      });
    }

    const updates = {};
    const { phoneNumber, address, shareCode } = req.body;

    if (phoneNumber !== undefined) {
      const value = String(phoneNumber).trim();
      if (!value) {
        return res.status(400).json({
          error: "Validation error",
          message: "Phone number is required.",
        });
      }
      updates.phoneNumber = value;
    }

    if (address !== undefined) {
      const value = String(address).trim();
      if (!value) {
        return res.status(400).json({
          error: "Validation error",
          message: "Address is required.",
        });
      }
      updates.address = value;
    }

    if (shareCode !== undefined && !isUkOrIrish(cleaner.citizenshipStatus)) {
      const value = String(shareCode).trim().toUpperCase();
      if (!/^[A-Z0-9]{9}$/.test(value)) {
        return res.status(400).json({
          error: "Validation error",
          message: "Share code must be 9 letters or numbers.",
        });
      }
      updates.shareCode = value;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "Validation error",
        message: "Nothing to update.",
      });
    }

    // updateOne avoids re-validating the whole record (older records may
    // be missing newer required fields)
    await Cleaner.updateOne({ id: cleaner.id }, { $set: updates });

    await logActivity({
      actorId: req.employeeUser.userId,
      actorRole: "employee",
      actorName: cleaner.name,
      actionType: "APPLICATION_DETAILS_UPDATED",
      entityType: "Cleaner",
      entityId: cleaner.id,
      message: `${cleaner.name} updated ${Object.keys(updates).join(", ")} on their application`,
      metadata: { cleanerName: cleaner.name, changedFields: Object.keys(updates) },
    });

    const updated = await Cleaner.findOne({ id: cleaner.id }).lean();
    res.json(toApplicationResponse(updated, req.employeeUser.username));
  } catch (error) {
    console.error("Update my details error:", error);
    res.status(500).json({
      error: "Failed to update details",
      message: error.message,
    });
  }
});

// POST /api/my-application/documents/:docId — re-upload a rejected document
router.post(
  "/documents/:docId",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        const message =
          err.code === "LIMIT_FILE_SIZE"
            ? "File is too large. Maximum size is 10MB."
            : err.message || "Upload failed.";
        return res.status(400).json({ error: "Upload error", message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Validation error",
          message: "Please choose a file to upload.",
        });
      }

      const cleaner = await Cleaner.findOne({
        id: req.employeeUser.cleanerId,
      }).lean();

      if (!cleaner) {
        removeUploadedFile(req.file);
        return res.status(404).json({
          error: "Not found",
          message: "Your staff record could not be found.",
        });
      }

      if (cleaner.verificationStatus !== DOCS_REQUIRED) {
        removeUploadedFile(req.file);
        return res.status(403).json({
          error: "Not allowed",
          message: "Documents can only be re-uploaded while documents are required.",
        });
      }

      const doc = (cleaner.documents || []).find(
        (d) => d.id === req.params.docId,
      );

      // Only rejected documents (or ones already replaced in this round)
      // can be uploaded by the employee
      const canReplace =
        doc &&
        (doc.status === "Rejected" ||
          (doc.status === "Pending" && doc.reuploadedAt));

      if (!canReplace) {
        removeUploadedFile(req.file);
        return res.status(403).json({
          error: "Not allowed",
          message: "Only documents that were rejected can be re-uploaded.",
        });
      }

      const now = new Date();
      const previousVersion = {
        fileUrl: archiveOldFile(doc.fileUrl),
        fileName: doc.fileName || "",
        uploadDate: doc.uploadDate,
        status: doc.status,
        replacedAt: now,
      };

      await Cleaner.updateOne(
        { id: cleaner.id, "documents.id": doc.id },
        {
          $set: {
            "documents.$.fileUrl": `${DOCUMENTS_URL}/${req.file.filename}`,
            "documents.$.fileName": req.file.originalname,
            "documents.$.type":
              req.file.mimetype === "application/pdf" ? "PDF" : "IMG",
            "documents.$.uploadDate": now.toISOString().split("T")[0],
            "documents.$.status": "Pending",
            "documents.$.reuploadedAt": now,
          },
          $push: { "documents.$.previousVersions": previousVersion },
        },
      );

      await logActivity({
        actorId: req.employeeUser.userId,
        actorRole: "employee",
        actorName: cleaner.name,
        actionType: "DOCUMENT_REUPLOADED",
        entityType: "Cleaner",
        entityId: cleaner.id,
        message: `${cleaner.name} re-uploaded ${doc.name}`,
        metadata: { cleanerName: cleaner.name, documentId: doc.id, documentName: doc.name },
      });

      const updated = await Cleaner.findOne({ id: cleaner.id }).lean();
      res.json(toApplicationResponse(updated, req.employeeUser.username));
    } catch (error) {
      removeUploadedFile(req.file);
      console.error("Re-upload document error:", error);
      res.status(500).json({
        error: "Failed to upload document",
        message: error.message,
      });
    }
  },
);

// POST /api/my-application/submit — send the application for review again
router.post("/submit", async (req, res) => {
  try {
    const cleaner = await Cleaner.findOne({
      id: req.employeeUser.cleanerId,
    }).lean();

    if (!cleaner) {
      return res.status(404).json({
        error: "Not found",
        message: "Your staff record could not be found.",
      });
    }

    if (cleaner.verificationStatus !== DOCS_REQUIRED) {
      return res.status(400).json({
        error: "Not allowed",
        message: "Your application is not waiting for documents.",
      });
    }

    const stillRejected = (cleaner.documents || []).filter(
      (d) => d.status === "Rejected",
    );
    if (stillRejected.length > 0) {
      return res.status(400).json({
        error: "Documents missing",
        message: `Please re-upload: ${stillRejected.map((d) => d.name).join(", ")}`,
      });
    }

    await Cleaner.updateOne(
      { id: cleaner.id },
      {
        $set: { verificationStatus: "Pending", resubmittedAt: new Date() },
        $inc: { resubmissionCount: 1 },
      },
    );

    const reuploadedNames = (cleaner.documents || [])
      .filter((d) => d.reuploadedAt && d.status === "Pending")
      .map((d) => d.name);

    await logActivity({
      actorId: req.employeeUser.userId,
      actorRole: "employee",
      actorName: cleaner.name,
      actionType: "DOCUMENTS_RESUBMITTED",
      entityType: "Cleaner",
      entityId: cleaner.id,
      message: `${cleaner.name} resubmitted their application for review`,
      metadata: { cleanerName: cleaner.name, documents: reuploadedNames },
    });

    // Notify all admins (non-blocking)
    User.find({ role: "Admin", email: { $nin: [null, ""] } })
      .distinct("email")
      .then((adminEmails) =>
        sendDocumentsResubmittedEmail(
          adminEmails,
          cleaner.name,
          reuploadedNames,
          getStaffUrl(cleaner),
        ),
      )
      .catch((err) => console.error("Admin notification error:", err));

    const updated = await Cleaner.findOne({ id: cleaner.id }).lean();
    res.json(toApplicationResponse(updated, req.employeeUser.username));
  } catch (error) {
    console.error("Submit application error:", error);
    res.status(500).json({
      error: "Failed to submit application",
      message: error.message,
    });
  }
});

export default router;
