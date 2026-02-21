import express from 'express';
import Cleaner from '../models/Cleaner.js';
import { logDocumentActivity } from '../services/activityLogger.js';

const router = express.Router();

// GET all documents for a cleaner
router.get('/cleaner/:cleanerId', async (req, res) => {
  try {
    const cleaner = await Cleaner.findOne({ id: req.params.cleanerId });
    if (!cleaner) {
      return res.status(404).json({ error: 'Cleaner not found' });
    }
    res.json(cleaner.documents || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents', message: error.message });
  }
});

// POST add document to cleaner
router.post('/cleaner/:cleanerId', async (req, res) => {
  try {
    const cleaner = await Cleaner.findOne({ id: req.params.cleanerId });
    if (!cleaner) {
      return res.status(404).json({ error: 'Cleaner not found' });
    }

    if (!cleaner.documents) {
      cleaner.documents = [];
    }

    cleaner.documents.push(req.body);
    await cleaner.save();

    const newDocument = cleaner.documents[cleaner.documents.length - 1];

    // Log activity: Document uploaded/added
    // Determine if it's from employee (onboarding) or admin
    const isFromEmployee = req.body.uploadedBy === 'employee' || !req.body.uploadedBy;
    if (isFromEmployee) {
      await logDocumentActivity.uploaded(
        cleaner.email, // Actor ID
        cleaner.name,  // Actor Name
        cleaner.id,
        cleaner.name,
        newDocument.name,
        newDocument.id
      );
    } else {
      await logDocumentActivity.added(
        'admin-001',
        'Admin',
        cleaner.id,
        cleaner.name,
        newDocument.name,
        newDocument.id
      );
    }

    res.status(201).json(newDocument);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add document', message: error.message });
  }
});

// PUT update document
router.put('/cleaner/:cleanerId/document/:documentId', async (req, res) => {
  try {
    const cleaner = await Cleaner.findOne({ id: req.params.cleanerId });
    if (!cleaner) {
      return res.status(404).json({ error: 'Cleaner not found' });
    }

    const documentIndex = cleaner.documents?.findIndex(
      doc => doc.id === req.params.documentId
    );

    if (documentIndex === -1 || documentIndex === undefined) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const oldDocument = cleaner.documents[documentIndex].toObject();
    const oldStatus = oldDocument.status;

    cleaner.documents[documentIndex] = {
      ...oldDocument,
      ...req.body
    };

    await cleaner.save();
    const updatedDocument = cleaner.documents[documentIndex];

    // Log activity: Document status updated
    if (req.body.status && req.body.status !== oldStatus) {
      if (req.body.status === 'Verified') {
        await logDocumentActivity.verified('admin-001', 'Admin', cleaner.id, cleaner.name, updatedDocument.name, updatedDocument.id);
      } else if (req.body.status === 'Rejected') {
        await logDocumentActivity.rejected('admin-001', 'Admin', cleaner.id, cleaner.name, updatedDocument.name, updatedDocument.id);
      } else {
        await logDocumentActivity.statusUpdated('admin-001', 'Admin', cleaner.id, cleaner.name, updatedDocument.name, updatedDocument.id, oldStatus, req.body.status);
      }
    }

    res.json(updatedDocument);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update document', message: error.message });
  }
});

// DELETE document
router.delete('/cleaner/:cleanerId/document/:documentId', async (req, res) => {
  try {
    const cleaner = await Cleaner.findOne({ id: req.params.cleanerId });
    if (!cleaner) {
      return res.status(404).json({ error: 'Cleaner not found' });
    }

    const documentToDelete = cleaner.documents?.find(
      doc => doc.id === req.params.documentId
    );

    cleaner.documents = cleaner.documents?.filter(
      doc => doc.id !== req.params.documentId
    ) || [];

    await cleaner.save();

    // Log activity: Document deleted
    if (documentToDelete) {
      await logDocumentActivity.deleted(
        'admin-001',
        'Admin',
        cleaner.id,
        cleaner.name,
        documentToDelete.name,
        documentToDelete.id
      );
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document', message: error.message });
  }
});

export default router;
