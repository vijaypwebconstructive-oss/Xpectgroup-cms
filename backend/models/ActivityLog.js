import mongoose from 'mongoose';

/**
 * ActivityLog Model
 * Stores all system activities for audit and compliance tracking.
 * Powers the "Recent Activity" panel and activity log pages.
 */
const ActivityLogSchema = new mongoose.Schema({
  actorId: {
    type: String,
    required: true,
    index: true
  },
  actorRole: {
    type: String,
    enum: ['admin', 'employee', 'system'],
    required: true,
    index: true
  },
  actorName: {
    type: String,
    required: true
  },
  actionType: {
    type: String,
    enum: [
      // Invitation & Onboarding
      'INVITATION_SENT',
      'OTP_VERIFIED',
      'ONBOARDING_STARTED',
      'ONBOARDING_COMPLETED',
      'ONBOARDING_EXPIRED',
      'INVITATION_DELETED',
      'OTP_RESENT',
      // Document Actions
      'DOCUMENT_UPLOADED',
      'DOCUMENT_VIEWED',
      'DOCUMENT_VERIFIED',
      'DOCUMENT_REJECTED',
      'DOCUMENT_STATUS_UPDATED',
      'DOCUMENT_DELETED',
      'DOCUMENT_ADDED',
      // Staff / Cleaner Profile Actions
      'CLEANER_CREATED',
      'CLEANER_UPDATED',
      'EMPLOYMENT_ALLOCATION_UPDATED',
      'HOURLY_PAY_RATE_UPDATED',
      'EMPLOYMENT_STATUS_CHANGED',
      'IMMIGRATION_INFO_UPDATED',
      'AUDITOR_NOTES_UPDATED',
      // Verification & Compliance Actions
      'CLEANER_VERIFIED',
      'CLEANER_REJECTED',
      'VERIFICATION_REVOKED',
      'BULK_STATUS_UPDATE',
      'COMPLIANCE_ISSUE_MARKED',
      'COMPLIANCE_ISSUE_RESOLVED',
      // System Events
      'SYSTEM_ONBOARDING_EXPIRED'
    ],
    required: true,
    index: true
  },
  entityType: {
    type: String,
    enum: ['Cleaner', 'Document', 'Invitation', 'System'],
    required: true,
    index: true
  },
  entityId: {
    type: String,
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for efficient querying
ActivityLogSchema.index({ createdAt: -1 }); // For recent activities (most important)
ActivityLogSchema.index({ entityId: 1 }); // For activities related to a specific entity
ActivityLogSchema.index({ actorRole: 1 }); // For filtering by actor role
ActivityLogSchema.index({ actionType: 1 }); // For filtering by action type
ActivityLogSchema.index({ entityType: 1, entityId: 1 }); // Compound index for entity queries

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

export default ActivityLog;
