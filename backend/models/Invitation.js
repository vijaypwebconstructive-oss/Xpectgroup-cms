import mongoose from "mongoose";
import { randomUUID } from "crypto";

const InvitationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => randomUUID(),
    },
    employeeName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    inviteToken: {
      type: String,
      required: true,
      unique: true,
      default: () => randomUUID(),
    },
    senderName: {
      type: String,
      required: true,
    },

    senderDesignation: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: false,
    },
    salaryType: {
      type: String,
      enum: ["Hourly", "Weekly", "Monthly"],
      required: true,
    },
    salaryAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    otpExpiresAt: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ["SENT", "VERIFIED", "PENDING", "COMPLETED", "EXPIRED"],
      default: "SENT",
      required: true,
    },
    onboardingProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    reminderCount: {
      type: Number,
      default: 0,
    },

    lastReminderSentAt: {
      type: Date,
      default: null,
    },

    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
// id and inviteToken indexes are already created by unique:true on the field definition
InvitationSchema.index({ email: 1 });
InvitationSchema.index({ status: 1 });
InvitationSchema.index({ createdAt: -1 });

// Method to check if OTP is valid
InvitationSchema.methods.isOtpValid = function () {
  if (!this.otp || !this.otpExpiresAt) {
    return false;
  }
  return new Date() < this.otpExpiresAt;
};

// Onboarding must be completed within 3 working days (Saturday and Sunday
// are not counted). E.g. sent Friday 10:00 → expires Wednesday 10:00.
export const ONBOARDING_WORKING_DAYS = 3;

export const getInvitationExpiryDate = (createdAt) => {
  const deadline = new Date(createdAt || Date.now());
  let workingDaysAdded = 0;
  while (workingDaysAdded < ONBOARDING_WORKING_DAYS) {
    deadline.setDate(deadline.getDate() + 1);
    const day = deadline.getDay(); // 0 = Sunday, 6 = Saturday
    if (day !== 0 && day !== 6) workingDaysAdded++;
  }
  return deadline;
};

// Method to check if invitation is expired (3 working days, excl. weekends)
InvitationSchema.methods.isExpired = function () {
  return (
    this.status !== "COMPLETED" &&
    new Date() > getInvitationExpiryDate(this.createdAt)
  );
};

const Invitation = mongoose.model("Invitation", InvitationSchema);

export default Invitation;
