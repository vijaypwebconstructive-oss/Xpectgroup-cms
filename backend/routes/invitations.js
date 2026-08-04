import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Invitation from "../models/Invitation.js";
import OnboardingProgress from "../models/OnboardingProgress.js";
import Cleaner from "../models/Cleaner.js";
import { getStepName } from "../constants/onboardingSteps.js";
import {
  sendInvitationEmail,
  sendOTPResendEmail,
} from "../services/emailService.js";
import {
  logInvitationActivity,
  logSystemActivity,
} from "../services/activityLogger.js";

const router = express.Router();

// JWT secret (should be in .env in production)
const JWT_SECRET =
  process.env.JWT_SECRET || "xpect-onboarding-secret-key-change-in-production";
const JWT_EXPIRY = "15m"; // 15 minutes

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP before storing
const hashOTP = async (otp) => {
  const saltRounds = 10;
  return await bcrypt.hash(otp, saltRounds);
};

// Compare OTP
const compareOTP = async (plainOTP, hashedOTP) => {
  return await bcrypt.compare(plainOTP, hashedOTP);
};

// Generate JWT token for onboarding access (deprecated - using inline generation now)
const generateOnboardingToken = (inviteToken, email) => {
  return jwt.sign(
    { inviteToken, email, role: "employee", onboardingAllowed: true },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY },
  );
};

// Verify JWT token
export const verifyOnboardingToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// POST /api/invitations/send - Send invitation
router.post("/send", async (req, res) => {
  try {
    const {
      employeeName,
      email,
      senderName,
      senderDesignation,
      salaryType,
      salaryAmount,
    } = req.body;

    // Validation
    if (
      !employeeName ||
      !email ||
      !senderName ||
      !senderDesignation ||
      !salaryType ||
      salaryAmount === undefined
    ) {
      return res.status(400).json({
        error: "Validation error",
        message: "All fields are required",
      });
    }

    if (Number(salaryAmount) <= 0) {
      return res.status(400).json({
        error: "Validation error",
        message: "Salary amount must be greater than 0",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Validation error",
        message: "Invalid email format",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Condition 1: Check if email has an active invitation (Pending, Sent, Accepted/Verified, Completed)
    const ACTIVE_INVITATION_STATUSES = [
      "PENDING",
      "SENT",
      "VERIFIED",
      "COMPLETED",
    ];
    const existingInvitation = await Invitation.findOne({
      email: normalizedEmail,
      status: { $in: ACTIVE_INVITATION_STATUSES },
    });

    if (existingInvitation) {
      return res.status(400).json({
        error: "Invitation exists",
        message: "Invitation already sent to this email.",
      });
    }

    // Condition 2: Check if email already belongs to existing staff
    const existingCleaner = await Cleaner.findOne({
      email: normalizedEmail,
    });

    if (existingCleaner) {
      return res.status(400).json({
        error: "Email exists",
        message: "This email already belongs to a staff member.",
      });
    }

    // Generate OTP and set expiration (10 minutes)
    const otp = generateOTP();
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10);

    // Hash OTP before storing
    const hashedOTP = await hashOTP(otp);

    // Create invitation
    const invitation = new Invitation({
      employeeName,
      email: normalizedEmail,
      senderName,
      senderDesignation,
      salaryType,
      salaryAmount,
      otp: hashedOTP,
      otpExpiresAt,
      status: "SENT",
    });

    await invitation.save();

    // Generate onboarding URL
    const onboardingUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/onboarding/auth/${invitation.inviteToken}`;

    // Send REAL email using Gmail SMTP
    await sendInvitationEmail(email, employeeName, onboardingUrl, otp);

    // Log activity: Admin sent invitation
    await logInvitationActivity.sent(
      "admin-001", // Admin ID (default admin)
      "Admin", // Admin name
      invitation.id,
      employeeName,
    );

    res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      invitation: {
        id: invitation.id,
        employeeName: invitation.employeeName,
        email: invitation.email,
        status: invitation.status,
        inviteToken: invitation.inviteToken,
        createdAt: invitation.createdAt,
      },
    });
  } catch (error) {
    console.error("Error sending invitation:", error);
    res.status(500).json({
      error: "Failed to send invitation",
      message: error.message,
    });
  }
});

// POST /api/invitations/verify-otp - Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { inviteToken, otp } = req.body;

    if (!inviteToken || !otp) {
      return res.status(400).json({
        error: "Validation error",
        message: "Invite token and OTP are required",
      });
    }

    // Find invitation
    const invitation = await Invitation.findOne({ inviteToken });

    if (!invitation) {
      return res.status(404).json({
        error: "Invalid token",
        message: "Invitation not found",
      });
    }

    // Check if already completed
    if (invitation.status === "COMPLETED") {
      return res.status(400).json({
        error: "Already completed",
        message: "This invitation has already been used",
      });
    }

    // Check if expired
    if (invitation.isExpired()) {
      invitation.status = "EXPIRED";
      await invitation.save();
      return res.status(400).json({
        error: "Invitation expired",
        message: "This invitation has expired",
      });
    }

    // Check OTP expiration first
    if (!invitation.isOtpValid()) {
      return res.status(400).json({
        error: "OTP expired",
        message: "The OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP using bcrypt
    if (!invitation.otp) {
      return res.status(400).json({
        error: "Invalid OTP",
        message: "The OTP you entered is incorrect",
      });
    }

    const isOtpValid = await compareOTP(otp, invitation.otp);
    if (!isOtpValid) {
      return res.status(400).json({
        error: "Invalid OTP",
        message: "The OTP you entered is incorrect",
      });
    }

    // Update invitation status
    invitation.status = "VERIFIED";
    invitation.verifiedAt = new Date();
    // Clear OTP after successful verification
    invitation.otp = undefined;
    invitation.otpExpiresAt = undefined;
    await invitation.save();

    // Log activity: Employee verified OTP
    await logInvitationActivity.otpVerified(
      invitation.inviteToken, // Using inviteToken as actorId for employee
      invitation.employeeName,
      invitation.id,
      invitation.employeeName,
    );

    // Generate JWT token with employee role and onboarding access (15 minutes)
    const onboardingToken = jwt.sign(
      {
        inviteToken: invitation.inviteToken,
        email: invitation.email,
        role: "employee",
        onboardingAllowed: true,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY },
    );

    // Return success with JWT token for onboarding access
    res.json({
      success: true,
      token: onboardingToken,
      message: "OTP verified successfully",
      data: {
        inviteToken: invitation.inviteToken,
        employeeName: invitation.employeeName,
        email: invitation.email,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      error: "Failed to verify OTP",
      message: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  console.time("Invitation API");

  const invitations = await Invitation.find();

  console.timeEnd("Invitation API");

  res.json(invitations);
});

router.get("/", async (req, res) => {
  try {
    const invitations = await Invitation.find()
      .sort({ createdAt: -1 })
      .select("-otp -otpExpiresAt")
      .lean();

    // Get all invite tokens
    const inviteTokens = invitations.map((i) => i.inviteToken);

    // Get onboarding progress records
    const progressRecords = await OnboardingProgress.find({
      inviteToken: { $in: inviteTokens },
    }).lean();

    // Convert to map for quick lookup
    const progressMap = new Map();

    progressRecords.forEach((progress) => {
      progressMap.set(progress.inviteToken, progress);
    });

    // Attach current step name
    const invitationsWithSteps = invitations.map((invitation) => {
      const progress = progressMap.get(invitation.inviteToken);

      const currentStep = progress?.currentStep || 1;

      return {
        ...invitation,
        currentStep,
        currentStepName: getStepName(currentStep),
      };
    });

    res.json(invitationsWithSteps);
  } catch (error) {
    console.error("Error fetching invitations:", error);

    res.status(500).json({
      error: "Failed to fetch invitations",
      message: error.message,
    });
  }
});

// POST /api/invitations/:id/resend-otp - Resend OTP
router.post("/:id/resend-otp", async (req, res) => {
  try {
    const { id } = req.params;

    const invitation = await Invitation.findOne({ id });

    if (!invitation) {
      return res.status(404).json({
        error: "Invitation not found",
        message: "Invalid invitation ID",
      });
    }

    if (invitation.status === "COMPLETED") {
      return res.status(400).json({
        error: "Already completed",
        message: "Cannot resend OTP for completed invitation",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10);

    // Hash OTP before storing
    const hashedOTP = await hashOTP(otp);

    invitation.otp = hashedOTP;
    invitation.otpExpiresAt = otpExpiresAt;
    if (invitation.status === "EXPIRED") {
      invitation.status = "SENT";
    }
    await invitation.save();

    // Generate onboarding URL
    const onboardingUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/onboarding/auth/${invitation.inviteToken}`;

    // Send REAL email using Gmail SMTP
    await sendOTPResendEmail(
      invitation.email,
      invitation.employeeName,
      onboardingUrl,
      otp,
    );

    // Log activity: Admin resent OTP
    await logInvitationActivity.otpResent(
      "admin-001",
      "Admin",
      invitation.id,
      invitation.employeeName,
    );

    res.json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({
      error: "Failed to resend OTP",
      message: error.message,
    });
  }
});

// PATCH /api/invitations/:id/complete - Mark invitation as completed
router.patch("/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;
    const { onboardingProgress } = req.body;

    const invitation = await Invitation.findOne({ id });

    if (!invitation) {
      return res.status(404).json({
        error: "Invitation not found",
        message: "Invalid invitation ID",
      });
    }

    invitation.status = "COMPLETED";
    invitation.onboardingProgress = onboardingProgress || 100;
    invitation.lastActivityAt = new Date();
    await invitation.save();

    // Log activity: Employee completed onboarding
    await logInvitationActivity.onboardingCompleted(
      invitation.inviteToken,
      invitation.employeeName,
      invitation.id,
      invitation.employeeName,
    );

    res.json({
      success: true,
      message: "Invitation marked as completed",
      invitation,
    });
  } catch (error) {
    console.error("Error completing invitation:", error);
    res.status(500).json({
      error: "Failed to complete invitation",
      message: error.message,
    });
  }
});

// POST /api/invitations/verify-token - Verify employee JWT token
router.post("/verify-token", async (req, res) => {
  try {
    const { onboardingToken, inviteToken } = req.body;

    if (!onboardingToken || !inviteToken) {
      return res.status(400).json({
        error: "Validation error",
        message: "Token and invite token are required",
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(onboardingToken, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        error: "Invalid token",
        message: "Token is invalid or expired",
      });
    }

    // Verify invite token matches
    if (decoded.inviteToken !== inviteToken) {
      return res.status(403).json({
        error: "Token mismatch",
        message: "Token does not match invitation",
      });
    }

    // Check if invitation exists and is valid
    const invitation = await Invitation.findOne({ inviteToken });
    if (!invitation) {
      return res.status(404).json({
        error: "Invitation not found",
        message: "Invalid invitation token",
      });
    }

    // Check if invitation is expired
    if (invitation.isExpired() && invitation.status !== "COMPLETED") {
      return res.status(400).json({
        error: "Invitation expired",
        message: "This invitation has expired",
      });
    }

    // Return success with decoded token data
    res.json({
      success: true,
      message: "Token verified successfully",
      data: {
        role: decoded.role || "employee",
        onboardingAllowed: decoded.onboardingAllowed || true,
        inviteToken: decoded.inviteToken,
        email: decoded.email,
      },
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({
      error: "Failed to verify token",
      message: error.message,
    });
  }
});

// DELETE /api/invitations/:id - Delete invitation
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const invitation = await Invitation.findOne({ id });

    if (!invitation) {
      return res.status(404).json({
        error: "Invitation not found",
        message: "Invalid invitation ID",
      });
    }

    const employeeName = invitation.employeeName;
    const invitationId = invitation.id;

    // Delete invitation
    await Invitation.findOneAndDelete({ id });

    // Log activity: Admin deleted invitation
    await logInvitationActivity.deleted(
      "admin-001",
      "Admin",
      invitationId,
      employeeName,
    );

    res.json({
      success: true,
      message: "Invitation deleted successfully",
      invitation: {
        id: invitation.id,
        employeeName: invitation.employeeName,
        email: invitation.email,
      },
    });
  } catch (error) {
    console.error("Error deleting invitation:", error);
    res.status(500).json({
      error: "Failed to delete invitation",
      message: error.message,
    });
  }
});

// IMPORTANT: Progress routes must come BEFORE /:inviteToken route to avoid route conflicts
// POST /api/invitations/:inviteToken/progress - Save onboarding progress
router.post("/:inviteToken/progress", async (req, res) => {
  try {
    const { inviteToken } = req.params;
    const { step, formData, isStepCompleted } = req.body;

    // Validation
    if (!step || typeof step !== "number" || step < 1 || step > 11) {
      return res.status(400).json({
        error: "Validation error",
        message: "Valid step number (1-10) is required",
      });
    }

    if (!formData || typeof formData !== "object") {
      return res.status(400).json({
        error: "Validation error",
        message: "Form data object is required",
      });
    }

    // isStepCompleted indicates if the user completed this step (clicked Next)
    // If true, update lastCompletedStep; if false, just save currentStep
    const markAsCompleted = isStepCompleted === true;

    // Verify invitation exists and is valid
    const invitation = await Invitation.findOne({ inviteToken });
    if (!invitation) {
      return res.status(404).json({
        error: "Invitation not found",
        message: "Invalid invitation token",
      });
    }

    // Check if invitation is expired or completed
    if (invitation.isExpired() && invitation.status !== "COMPLETED") {
      return res.status(400).json({
        error: "Invitation expired",
        message: "This invitation has expired",
      });
    }

    if (invitation.status === "COMPLETED") {
      return res.status(400).json({
        error: "Already completed",
        message: "This invitation has already been completed",
      });
    }

    // Step-order validation: Ensure user cannot skip steps
    // Find existing progress
    const existingProgress = await OnboardingProgress.findOne({ inviteToken });
    const isFirstSave = !existingProgress;

    if (existingProgress) {
      // User can progress forward (step >= lastCompletedStep) but not backward beyond lastCompletedStep
      // Note: Steps can be conditional (e.g., step 3 skipped for UK/Irish citizens),
      // so we allow any step >= lastCompletedStep to support conditional step flow
      console.log("Incoming Step:", step);

      console.log("Existing Progress:", existingProgress?.lastCompletedStep);
      if (step < existingProgress.lastCompletedStep) {
        // Don't allow going backwards beyond last completed step
        return res.status(400).json({
          error: "Step order violation",
          message: `Cannot go backwards. Last completed step is ${existingProgress.lastCompletedStep}.`,
          lastCompletedStep: existingProgress.lastCompletedStep,
        });
      }
      // Allow forward movement (step >= lastCompletedStep) - conditional steps are handled by frontend
    } else {
      // First save - must start at step 1
      if (step > 1) {
        return res.status(400).json({
          error: "Step order violation",
          message: "Must start from step 1",
          lastCompletedStep: 0,
        });
      }
    }

    // Determine lastCompletedStep: if marking as completed, use current step; otherwise keep existing
    let lastCompletedStep = step;
    if (!markAsCompleted && existingProgress) {
      // If not completing the step, keep the existing lastCompletedStep
      lastCompletedStep = existingProgress.lastCompletedStep;
    } else if (markAsCompleted && existingProgress) {
      // If completing the step, update to current step (but don't go backwards)
      lastCompletedStep = Math.max(existingProgress.lastCompletedStep, step);
    }

    // Save or update progress
    const progress = await OnboardingProgress.findOneAndUpdate(
      { inviteToken },
      {
        inviteToken,
        currentStep: step, // Always save current step (where user is now)
        lastCompletedStep: lastCompletedStep, // Only update if step is completed
        formData: formData,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      { upsert: true, new: true, runValidators: true },
    );

    // Update invitation onboarding progress percentage based on lastCompletedStep
    const TOTAL_STEPS = 11;

    const progressPercentage = Math.round(
      (lastCompletedStep / TOTAL_STEPS) * 100,
    );
    invitation.onboardingProgress = progressPercentage;

    invitation.lastActivityAt = new Date();

    // Update status to PENDING if this is the first save and status is still VERIFIED
    if (isFirstSave && invitation.status === "VERIFIED") {
      invitation.status = "PENDING";

      // Log activity: Employee started onboarding (first progress save)
      await logInvitationActivity.onboardingStarted(
        invitation.inviteToken, // Using inviteToken as actorId for employee
        invitation.employeeName,
        invitation.id,
        invitation.employeeName,
      );
    }

    await invitation.save();

    res.json({
      success: true,
      message: "Progress saved successfully",
      progress: {
        currentStep: progress.currentStep,
        lastCompletedStep: progress.lastCompletedStep,
        savedAt: progress.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error saving onboarding progress:", error);
    res.status(500).json({
      error: "Failed to save progress",
      message: error.message,
    });
  }
});

// GET /api/invitations/:inviteToken/progress - Load onboarding progress
router.get("/:inviteToken/progress", async (req, res) => {
  try {
    const { inviteToken } = req.params;

    // Verify invitation exists
    const invitation = await Invitation.findOne({ inviteToken });
    if (!invitation) {
      return res.status(404).json({
        error: "Invitation not found",
        message: "Invalid invitation token",
      });
    }

    // Check if invitation is expired or completed
    if (invitation.isExpired() && invitation.status !== "COMPLETED") {
      return res.status(400).json({
        error: "Invitation expired",
        message: "This invitation has expired",
      });
    }

    // Find saved progress
    const progress = await OnboardingProgress.findOne({ inviteToken });

    if (!progress) {
      // No saved progress - return empty state
      return res.json({
        success: true,
        hasProgress: false,
        progress: null,
      });
    }

    res.json({
      success: true,
      hasProgress: true,
      progress: {
        currentStep: progress.currentStep,
        lastCompletedStep: progress.lastCompletedStep,
        formData: progress.formData,
        savedAt: progress.updatedAt,
        expiresAt: progress.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error loading onboarding progress:", error);
    res.status(500).json({
      error: "Failed to load progress",
      message: error.message,
    });
  }
});

// DELETE /api/invitations/:inviteToken/progress - Clear onboarding progress (on completion)
router.delete("/:inviteToken/progress", async (req, res) => {
  try {
    const { inviteToken } = req.params;

    // Delete progress
    const deleted = await OnboardingProgress.findOneAndDelete({ inviteToken });

    if (!deleted) {
      return res.status(404).json({
        error: "Progress not found",
        message: "No saved progress found for this invitation",
      });
    }

    res.json({
      success: true,
      message: "Progress cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing onboarding progress:", error);
    res.status(500).json({
      error: "Failed to clear progress",
      message: error.message,
    });
  }
});

// GET /api/invitations/:inviteToken - Get invitation by token (must be last to avoid conflicts)
router.get("/:inviteToken", async (req, res) => {
  try {
    const { inviteToken } = req.params;

    const invitation = await Invitation.findOne({ inviteToken }).select(
      "-otp -otpExpiresAt",
    ); // Don't return OTP

    if (!invitation) {
      return res.status(404).json({
        error: "Invitation not found",
        message: "Invalid invitation token",
      });
    }

    // Check if expired
    if (invitation.isExpired() && invitation.status !== "COMPLETED") {
      invitation.status = "EXPIRED";
      await invitation.save();
    }

    res.json(invitation);
  } catch (error) {
    console.error("Error fetching invitation:", error);
    res.status(500).json({
      error: "Failed to fetch invitation",
      message: error.message,
    });
  }
});

export default router;
