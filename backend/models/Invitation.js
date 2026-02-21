import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const InvitationSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => randomUUID()
  },
  employeeName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true
  },
  inviteToken: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => randomUUID()
  },
  otp: { 
    type: String,
    required: false
  },
  otpExpiresAt: { 
    type: Date,
    required: false
  },
  status: { 
    type: String, 
    enum: ['SENT', 'VERIFIED', 'PENDING', 'COMPLETED', 'EXPIRED'],
    default: 'SENT',
    required: true 
  },
  onboardingProgress: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  },
  verifiedAt: { 
    type: Date 
  }
}, {
  timestamps: true
});

// Indexes for better query performance
InvitationSchema.index({ email: 1 });
InvitationSchema.index({ inviteToken: 1 });
InvitationSchema.index({ status: 1 });
InvitationSchema.index({ createdAt: -1 });

// Method to check if OTP is valid
InvitationSchema.methods.isOtpValid = function() {
  if (!this.otp || !this.otpExpiresAt) {
    return false;
  }
  return new Date() < this.otpExpiresAt;
};

// Method to check if invitation is expired (30 days)
InvitationSchema.methods.isExpired = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.createdAt < thirtyDaysAgo && this.status !== 'COMPLETED';
};

const Invitation = mongoose.model('Invitation', InvitationSchema);

export default Invitation;
