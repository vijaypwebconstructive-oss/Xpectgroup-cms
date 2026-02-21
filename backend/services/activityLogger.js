import ActivityLog from '../models/ActivityLog.js';

/**
 * Centralized Activity Logging Service
 * 
 * All activity logging should go through this service to ensure consistency.
 * Activities are logged asynchronously and do not block the main request flow.
 */

/**
 * Core logging function - logs activity to database
 * @param {Object} logData - Activity log data
 */
export const logActivity = async (logData) => {
  try {
    const activity = new ActivityLog(logData);
    await activity.save();
  } catch (error) {
    // Don't throw - activity logging should never break the main flow
    console.error('Failed to log activity:', error);
  }
};

// ============================================================================
// INVITATION & ONBOARDING ACTIVITIES
// ============================================================================

export const logInvitationActivity = {
  /**
   * Admin sent invitation
   */
  sent: async (actorId, actorName, invitationId, employeeName) => {
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'INVITATION_SENT',
      entityType: 'Invitation',
      entityId: invitationId,
      message: `Admin sent invitation to ${employeeName}`,
      metadata: { employeeName }
    });
  },

  /**
   * Employee verified OTP
   */
  otpVerified: async (actorId, actorName, invitationId, employeeName) => {
    await logActivity({
      actorId,
      actorRole: 'employee',
      actorName,
      actionType: 'OTP_VERIFIED',
      entityType: 'Invitation',
      entityId: invitationId,
      message: `${employeeName} verified OTP`,
      metadata: { employeeName }
    });
  },

  /**
   * Employee started onboarding (first progress save)
   */
  onboardingStarted: async (actorId, actorName, invitationId, employeeName) => {
    await logActivity({
      actorId,
      actorRole: 'employee',
      actorName,
      actionType: 'ONBOARDING_STARTED',
      entityType: 'Invitation',
      entityId: invitationId,
      message: `${employeeName} started onboarding`,
      metadata: { employeeName }
    });
  },

  /**
   * Employee completed onboarding
   */
  onboardingCompleted: async (actorId, actorName, invitationId, employeeName) => {
    await logActivity({
      actorId,
      actorRole: 'employee',
      actorName,
      actionType: 'ONBOARDING_COMPLETED',
      entityType: 'Invitation',
      entityId: invitationId,
      message: `${employeeName} completed onboarding`,
      metadata: { employeeName }
    });
  },

  /**
   * Admin deleted invitation
   */
  deleted: async (actorId, actorName, invitationId, employeeName) => {
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'INVITATION_DELETED',
      entityType: 'Invitation',
      entityId: invitationId,
      message: `Admin deleted invitation for ${employeeName}`,
      metadata: { employeeName }
    });
  },

  /**
   * Admin resent OTP
   */
  otpResent: async (actorId, actorName, invitationId, employeeName) => {
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'OTP_RESENT',
      entityType: 'Invitation',
      entityId: invitationId,
      message: `Admin resent OTP to ${employeeName}`,
      metadata: { employeeName }
    });
  }
};

// ============================================================================
// DOCUMENT ACTIVITIES
// ============================================================================

export const logDocumentActivity = {
  /**
   * Employee uploaded document
   */
  uploaded: async (actorId, actorName, cleanerId, cleanerName, documentName, documentId) => {
    await logActivity({
      actorId,
      actorRole: 'employee',
      actorName,
      actionType: 'DOCUMENT_UPLOADED',
      entityType: 'Document',
      entityId: documentId,
      message: `${cleanerName} uploaded ${documentName}`,
      metadata: { cleanerId, cleanerName, documentName }
    });
  },

  /**
   * Admin added document
   */
  added: async (actorId, actorName, cleanerId, cleanerName, documentName, documentId) => {
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'DOCUMENT_ADDED',
      entityType: 'Document',
      entityId: documentId,
      message: `Admin added new document '${documentName}' for ${cleanerName}`,
      metadata: { cleanerId, cleanerName, documentName }
    });
  },

  /**
   * Admin updated document status
   */
  statusUpdated: async (actorId, actorName, cleanerId, cleanerName, documentName, documentId, oldStatus, newStatus) => {
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'DOCUMENT_STATUS_UPDATED',
      entityType: 'Document',
      entityId: documentId,
      message: `Admin updated status of '${documentName}' for ${cleanerName} from ${oldStatus} to ${newStatus}`,
      metadata: { cleanerId, cleanerName, documentName, oldStatus, newStatus }
    });
  },

  /**
   * Admin verified document
   */
  verified: async (actorId, actorName, cleanerId, cleanerName, documentName, documentId) => {
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'DOCUMENT_VERIFIED',
      entityType: 'Document',
      entityId: documentId,
      message: `Admin verified ${documentName} for ${cleanerName}`,
      metadata: { cleanerId, cleanerName, documentName }
    });
  },

  /**
   * Admin rejected document
   */
  rejected: async (actorId, actorName, cleanerId, cleanerName, documentName, documentId) => {
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'DOCUMENT_REJECTED',
      entityType: 'Document',
      entityId: documentId,
      message: `Admin rejected ${documentName} for ${cleanerName}`,
      metadata: { cleanerId, cleanerName, documentName }
    });
  },

  /**
   * Admin deleted document
   */
  deleted: async (actorId, actorName, cleanerId, cleanerName, documentName, documentId) => {
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'DOCUMENT_DELETED',
      entityType: 'Document',
      entityId: documentId,
      message: `Admin deleted document '${documentName}' for ${cleanerName}`,
      metadata: { cleanerId, cleanerName, documentName }
    });
  },

  /**
   * Admin viewed document
   */
  viewed: async (actorId, actorName, cleanerId, cleanerName, documentName, documentId) => {
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'DOCUMENT_VIEWED',
      entityType: 'Document',
      entityId: documentId,
      message: `Admin viewed document '${documentName}' for ${cleanerName}`,
      metadata: { cleanerId, cleanerName, documentName }
    });
  }
};

// ============================================================================
// CLEANER / STAFF PROFILE ACTIVITIES
// ============================================================================

export const logCleanerActivity = {
  /**
   * Cleaner profile created (from onboarding or admin)
   */
  created: async (actorId, actorName, cleanerId, cleanerName, source = 'admin') => {
    await logActivity({
      actorId,
      actorRole: source === 'onboarding' ? 'employee' : 'admin',
      actorName,
      actionType: 'CLEANER_CREATED',
      entityType: 'Cleaner',
      entityId: cleanerId,
      message: `${actorName} created staff profile for ${cleanerName}`,
      metadata: { cleanerName, source }
    });
  },

  /**
   * Cleaner profile updated
   */
  updated: async (actorId, actorName, cleanerId, cleanerName, metadata) => {
    const message = metadata.changedFields && metadata.changedFields.length > 0
      ? `Admin updated ${metadata.changedFieldNames} for ${cleanerName}`
      : `Admin updated details for ${cleanerName}`;
    
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'CLEANER_UPDATED',
      entityType: 'Cleaner',
      entityId: cleanerId,
      message,
      metadata: { cleanerName, ...metadata }
    });
  },

  /**
   * Employment allocation updated
   */
  employmentAllocationUpdated: async (actorId, actorName, cleanerId, cleanerName) => {
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'EMPLOYMENT_ALLOCATION_UPDATED',
      entityType: 'Cleaner',
      entityId: cleanerId,
      message: `Admin updated employment allocation for ${cleanerName}`,
      metadata: { cleanerName }
    });
  },

  /**
   * Hourly pay rate updated
   */
  hourlyPayRateUpdated: async (actorId, actorName, cleanerId, cleanerName, oldRate, newRate) => {
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'HOURLY_PAY_RATE_UPDATED',
      entityType: 'Cleaner',
      entityId: cleanerId,
      message: `Admin updated hourly pay rate for ${cleanerName} from £${oldRate || 'N/A'} to £${newRate}`,
      metadata: { cleanerName, oldRate, newRate }
    });
  },

  /**
   * Employment status changed
   */
  employmentStatusChanged: async (actorId, actorName, cleanerId, cleanerName, oldStatus, newStatus) => {
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'EMPLOYMENT_STATUS_CHANGED',
      entityType: 'Cleaner',
      entityId: cleanerId,
      message: `Admin changed employment status for ${cleanerName} from ${oldStatus || 'N/A'} to ${newStatus}`,
      metadata: { cleanerName, oldStatus, newStatus }
    });
  },

  /**
   * Immigration/right-to-work info updated
   */
  immigrationInfoUpdated: async (actorId, actorName, cleanerId, cleanerName) => {
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'IMMIGRATION_INFO_UPDATED',
      entityType: 'Cleaner',
      entityId: cleanerId,
      message: `Admin updated immigration/right-to-work info for ${cleanerName}`,
      metadata: { cleanerName }
    });
  },

  /**
   * Auditor notes updated
   */
  auditorNotesUpdated: async (actorId, actorName, cleanerId, cleanerName) => {
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'AUDITOR_NOTES_UPDATED',
      entityType: 'Cleaner',
      entityId: cleanerId,
      message: `Admin updated auditor notes for ${cleanerName}`,
      metadata: { cleanerName }
    });
  }
};

// ============================================================================
// VERIFICATION & COMPLIANCE ACTIVITIES
// ============================================================================

export const logVerificationActivity = {
  /**
   * Cleaner verified
   */
  verified: async (actorId, actorName, cleanerId, cleanerName) => {
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'CLEANER_VERIFIED',
      entityType: 'Cleaner',
      entityId: cleanerId,
      message: `Admin verified and activated ${cleanerName}`,
      metadata: { cleanerName }
    });
  },

  /**
   * Cleaner rejected
   */
  rejected: async (actorId, actorName, cleanerId, cleanerName) => {
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'CLEANER_REJECTED',
      entityType: 'Cleaner',
      entityId: cleanerId,
      message: `Admin rejected application for ${cleanerName}`,
      metadata: { cleanerName }
    });
  },

  /**
   * Verification revoked
   */
  revoked: async (actorId, actorName, cleanerId, cleanerName) => {
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'VERIFICATION_REVOKED',
      entityType: 'Cleaner',
      entityId: cleanerId,
      message: `Admin revoked verification for ${cleanerName}`,
      metadata: { cleanerName }
    });
  },

  /**
   * Bulk status update (single log entry for the whole operation)
   */
  bulkStatusUpdate: async (actorId, actorName, affectedCount, targetStatus) => {
    const count = affectedCount === 1 ? '1 staff member' : `${affectedCount} staff members`;
    const message = targetStatus === 'Rejected'
      ? `Admin marked ${count} as Rejected`
      : `Admin updated status to ${targetStatus} for ${count}`;
    await logActivity({
      actorId,
      actorRole: 'admin',
      actorName,
      actionType: 'BULK_STATUS_UPDATE',
      entityType: 'Cleaner',
      entityId: 'bulk', // No single entity; bulk operation
      message,
      metadata: { affectedEntityCount: affectedCount, targetStatus }
    });
  }
};

// ============================================================================
// SYSTEM EVENTS
// ============================================================================

export const logSystemActivity = {
  /**
   * Onboarding expired (30 days)
   */
  onboardingExpired: async (invitationId, employeeName) => {
    await logActivity({
      actorId: 'system',
      actorRole: 'system',
      actorName: 'System',
      actionType: 'SYSTEM_ONBOARDING_EXPIRED',
      entityType: 'Invitation',
      entityId: invitationId,
      message: `System expired onboarding for ${employeeName} (30 days inactive)`,
      metadata: { employeeName }
    });
  }
};
