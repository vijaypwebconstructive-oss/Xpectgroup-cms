import express from 'express';
import Cleaner from '../models/Cleaner.js';
import { logCleanerActivity, logVerificationActivity, logActivity, logDocumentActivity } from '../services/activityLogger.js';

const router = express.Router();

const ALLOWED_BULK_STATUSES = ['Verified', 'Rejected', 'Pending'];

// Action-to-status mapping for bulk-action endpoint (WordPress-style)
const BULK_ACTION_TO_STATUS = {
  VERIFY: 'Verified',
  REJECT: 'Rejected',
  PENDING: 'Pending'
};

// PATCH bulk-action (WordPress-style: action + cleanerIds; must be before /:id)
router.patch('/bulk-action', async (req, res) => {
  try {
    const { action, cleanerIds } = req.body;

    if (!Array.isArray(cleanerIds) || cleanerIds.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'cleanerIds must be a non-empty array'
      });
    }

    if (!action || !BULK_ACTION_TO_STATUS[action]) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'action must be one of: VERIFY, REJECT, PENDING'
      });
    }

    const validIds = cleanerIds.filter(id => typeof id === 'string' && id.trim().length > 0);
    if (validIds.length !== cleanerIds.length) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'All cleanerIds must be non-empty strings'
      });
    }

    const status = BULK_ACTION_TO_STATUS[action];
    const result = await Cleaner.updateMany(
      { id: { $in: validIds } },
      { $set: { verificationStatus: status } }
    );

    try {
      await logVerificationActivity.bulkStatusUpdate(
        'admin-001',
        'Admin',
        result.modifiedCount,
        status
      );
    } catch (logErr) {
      console.error('Failed to log bulk action activity:', logErr);
    }

    res.json({ updatedCount: result.modifiedCount, status });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to apply bulk action',
      message: error.message
    });
  }
});

// PATCH bulk status update (must be before /:id to avoid route conflict)
router.patch('/bulk-status', async (req, res) => {
  try {
    const { cleanerIds, status } = req.body;

    if (!Array.isArray(cleanerIds) || cleanerIds.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'cleanerIds must be a non-empty array'
      });
    }

    if (!status || !ALLOWED_BULK_STATUSES.includes(status)) {
      return res.status(400).json({
        error: 'Validation error',
        message: `status must be one of: ${ALLOWED_BULK_STATUSES.join(', ')}`
      });
    }

    // Ensure all IDs are non-empty strings
    const validIds = cleanerIds.filter(id => typeof id === 'string' && id.trim().length > 0);
    if (validIds.length !== cleanerIds.length) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'All cleanerIds must be non-empty strings'
      });
    }

    const result = await Cleaner.updateMany(
      { id: { $in: validIds } },
      { $set: { verificationStatus: status } }
    );

    // Single activity log for the entire bulk operation
    try {
      await logVerificationActivity.bulkStatusUpdate(
        'admin-001',
        'Admin',
        result.modifiedCount,
        status
      );
    } catch (logErr) {
      console.error('Failed to log bulk status activity:', logErr);
    }

    res.json({
      updatedCount: result.modifiedCount,
      status
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update staff status',
      message: error.message
    });
  }
});

// POST bulk delete (must be before /:id to avoid route conflict)
router.post('/bulk-delete', async (req, res) => {
  try {
    const { cleanerIds } = req.body;

    if (!Array.isArray(cleanerIds) || cleanerIds.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'cleanerIds must be a non-empty array'
      });
    }

    const validIds = cleanerIds.filter(id => typeof id === 'string' && id.trim().length > 0);
    if (validIds.length !== cleanerIds.length) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'All cleanerIds must be non-empty strings'
      });
    }

    const result = await Cleaner.deleteMany({ id: { $in: validIds } });

    res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete staff',
      message: error.message
    });
  }
});

const ALLOWED_EMPLOYMENT_TYPES = ['Contractor', 'Permanent', 'Temporary', 'Sub-contractor'];

// PATCH bulk update (hourly pay, employment type, location; must be before /:id)
router.patch('/bulk-update', async (req, res) => {
  try {
    const { cleanerIds, hourlyPayRate, employmentType, location } = req.body;

    if (!Array.isArray(cleanerIds) || cleanerIds.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'cleanerIds must be a non-empty array'
      });
    }

    const validIds = cleanerIds.filter(id => typeof id === 'string' && id.trim().length > 0);
    if (validIds.length !== cleanerIds.length) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'All cleanerIds must be non-empty strings'
      });
    }

    const updates = {};
    if (employmentType !== undefined && employmentType !== null && employmentType !== '') {
      if (!ALLOWED_EMPLOYMENT_TYPES.includes(employmentType)) {
        return res.status(400).json({
          error: 'Validation error',
          message: `employmentType must be one of: ${ALLOWED_EMPLOYMENT_TYPES.join(', ')}`
        });
      }
      updates.employmentType = employmentType;
    }
    if (hourlyPayRate !== undefined && hourlyPayRate !== null && hourlyPayRate !== '') {
      const rate = Number(hourlyPayRate);
      if (Number.isNaN(rate) || rate < 0) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'hourlyPayRate must be a non-negative number'
        });
      }
      updates.hourlyPayRate = rate;
    }
    if (location !== undefined && location !== null && typeof location === 'string') {
      updates.location = location.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Provide at least one of: hourlyPayRate, employmentType, location'
      });
    }

    const result = await Cleaner.updateMany(
      { id: { $in: validIds } },
      { $set: updates }
    );

    res.json({
      updatedCount: result.modifiedCount,
      updatedFields: Object.keys(updates)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update staff',
      message: error.message
    });
  }
});

// GET all cleaners
router.get('/', async (req, res) => {
  try {
    const cleaners = await Cleaner.find().sort({ createdAt: -1 });
    res.json(cleaners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cleaners', message: error.message });
  }
});

// GET cleaner by ID
router.get('/:id', async (req, res) => {
  try {
    const cleaner = await Cleaner.findOne({ id: req.params.id });
    if (!cleaner) {
      return res.status(404).json({ error: 'Cleaner not found' });
    }
    res.json(cleaner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cleaner', message: error.message });
  }
});

// POST create new cleaner
router.post('/', async (req, res) => {
  try {
    // Check if cleaner with same email or id already exists
    const existingCleaner = await Cleaner.findOne({ 
      $or: [
        { email: req.body.email },
        { id: req.body.id }
      ]
    });

    if (existingCleaner) {
      return res.status(400).json({ 
        error: 'Cleaner already exists', 
        message: 'A cleaner with this email or ID already exists' 
      });
    }

    const cleaner = new Cleaner(req.body);
    await cleaner.save();
    
    // Log activity: Cleaner created (detect if from onboarding or admin)
    const source = req.body.source || 'admin'; // Check if source is provided
    await logCleanerActivity.created(
      source === 'onboarding' ? req.body.email : 'admin-001',
      source === 'onboarding' ? req.body.name : 'Admin',
      cleaner.id,
      cleaner.name,
      source
    );
    
    res.status(201).json(cleaner);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', message: error.message });
    }
    res.status(500).json({ error: 'Failed to create cleaner', message: error.message });
  }
});

// PUT update cleaner
router.put('/:id', async (req, res) => {
  try {
    const cleaner = await Cleaner.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!cleaner) {
      return res.status(404).json({ error: 'Cleaner not found' });
    }

    res.json(cleaner);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', message: error.message });
    }
    res.status(500).json({ error: 'Failed to update cleaner', message: error.message });
  }
});

// PATCH partial update cleaner
router.patch('/:id', async (req, res) => {
  try {
    // Get old cleaner data before update
    const oldCleaner = await Cleaner.findOne({ id: req.params.id });
    
    if (!oldCleaner) {
      return res.status(404).json({ error: 'Cleaner not found' });
    }

    const cleaner = await Cleaner.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // Log specific activity types based on what changed
    try {
      // Check for verification status change - log ALL status changes
      if (req.body.verificationStatus && req.body.verificationStatus !== oldCleaner.verificationStatus) {
        const oldStatus = oldCleaner.verificationStatus;
        const newStatus = req.body.verificationStatus;
        
        if (newStatus === 'Verified') {
          await logVerificationActivity.verified('admin-001', 'Admin', cleaner.id, cleaner.name);
        } else if (newStatus === 'Rejected') {
          await logVerificationActivity.rejected('admin-001', 'Admin', cleaner.id, cleaner.name);
        } else {
          // Log other status changes (Pending, Docs Required, etc.)
          await logActivity({
            actorId: 'admin-001',
            actorRole: 'admin',
            actorName: 'Admin',
            actionType: 'VERIFICATION_STATUS_CHANGED',
            entityType: 'Cleaner',
            entityId: cleaner.id,
            message: `Admin changed verification status for ${cleaner.name} from ${oldStatus} to ${newStatus}`,
            metadata: { cleanerName: cleaner.name, oldStatus, newStatus }
          });
        }
      }

      // Check for hourly pay rate change
      if (req.body.hourlyPayRate && req.body.hourlyPayRate !== oldCleaner.hourlyPayRate) {
        await logCleanerActivity.hourlyPayRateUpdated(
          'admin-001', 'Admin', cleaner.id, cleaner.name, oldCleaner.hourlyPayRate, req.body.hourlyPayRate
        );
      }

      // Check for employment status change
      if (req.body.contractStatus && req.body.contractStatus !== oldCleaner.contractStatus) {
        await logCleanerActivity.employmentStatusChanged(
          'admin-001', 'Admin', cleaner.id, cleaner.name, oldCleaner.contractStatus, req.body.contractStatus
        );
      }

      // Check for employment allocation updates (location, shift, pay type)
      const employmentAllocationFields = ['location', 'shiftType', 'payType', 'startDate', 'endDate'];
      const hasEmploymentAllocationChanges = employmentAllocationFields.some(field =>
        req.body[field] !== undefined && req.body[field] !== oldCleaner[field]
      );
      if (hasEmploymentAllocationChanges) {
        await logCleanerActivity.employmentAllocationUpdated('admin-001', 'Admin', cleaner.id, cleaner.name);
      }

      // Check for immigration info updates
      const immigrationInfoFields = ['citizenshipStatus', 'visaType', 'shareCode'];
      const hasImmigrationInfoChanges = immigrationInfoFields.some(field =>
        req.body[field] !== undefined && req.body[field] !== oldCleaner[field]
      );
      if (hasImmigrationInfoChanges) {
        await logCleanerActivity.immigrationInfoUpdated('admin-001', 'Admin', cleaner.id, cleaner.name);
      }

      // Check for auditor notes update
      if (req.body.auditorNotes !== undefined && req.body.auditorNotes !== oldCleaner.auditorNotes) {
        await logCleanerActivity.auditorNotesUpdated('admin-001', 'Admin', cleaner.id, cleaner.name);
      }

      // Check for document status changes when documents array is updated
      if (req.body.documents && Array.isArray(req.body.documents)) {
        const oldDocuments = oldCleaner.documents || [];
        const newDocuments = req.body.documents;
        
        // Compare each document to find status changes
        for (const newDoc of newDocuments) {
          const oldDoc = oldDocuments.find(d => d.id === newDoc.id);
          if (oldDoc && oldDoc.status !== newDoc.status) {
            if (newDoc.status === 'Verified') {
              await logDocumentActivity.verified('admin-001', 'Admin', cleaner.id, cleaner.name, newDoc.name, newDoc.id);
            } else if (newDoc.status === 'Rejected') {
              await logDocumentActivity.rejected('admin-001', 'Admin', cleaner.id, cleaner.name, newDoc.name, newDoc.id);
            } else {
              await logDocumentActivity.statusUpdated('admin-001', 'Admin', cleaner.id, cleaner.name, newDoc.name, newDoc.id, oldDoc.status, newDoc.status);
            }
          }
        }
      }

      // General update for personal details or other fields
      const personalDetailFields = ['name', 'email', 'phoneNumber', 'address', 'dob', 'gender', 'avatar'];
      const hasPersonalDetailChanges = personalDetailFields.some(field =>
        req.body[field] !== undefined && req.body[field] !== oldCleaner[field]
      );
      
      if (hasPersonalDetailChanges) {
        const changedFields = personalDetailFields.filter(f => req.body[f] !== undefined && req.body[f] !== oldCleaner[f]);
        await logCleanerActivity.updated('admin-001', 'Admin', cleaner.id, cleaner.name, {
          changedFields,
          changedFieldNames: changedFields.join(', ')
        });
      }
    } catch (logError) {
      console.error('Failed to log cleaner update activity:', logError);
      // Don't fail the request if logging fails
    }

    res.json(cleaner);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', message: error.message });
    }
    res.status(500).json({ error: 'Failed to update cleaner', message: error.message });
  }
});

// DELETE cleaner
router.delete('/:id', async (req, res) => {
  try {
    const cleaner = await Cleaner.findOneAndDelete({ id: req.params.id });
    
    if (!cleaner) {
      return res.status(404).json({ error: 'Cleaner not found' });
    }

    res.json({ message: 'Cleaner deleted successfully', cleaner });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete cleaner', message: error.message });
  }
});

// GET cleaners by status
router.get('/status/:status', async (req, res) => {
  try {
    const cleaners = await Cleaner.find({ verificationStatus: req.params.status })
      .sort({ createdAt: -1 });
    res.json(cleaners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cleaners', message: error.message });
  }
});

export default router;
