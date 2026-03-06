import express from 'express';
import PolicyDocument from '../models/PolicyDocument.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const docs = await PolicyDocument.find().sort({ createdAt: -1 }).lean();
    const list = docs.map(d => ({
      id: d.id,
      title: d.title,
      category: d.category,
      owner: d.owner,
      department: d.department || '',
      version: d.version || '1.0',
      status: d.status || 'draft',
      effectiveDate: d.effectiveDate,
      lastReviewDate: d.lastReviewDate || '',
      nextReviewDate: d.nextReviewDate || '',
      reviewFrequencyMonths: d.reviewFrequencyMonths || 12,
      description: d.description || '',
      fileName: d.fileName || '',
      fileSize: d.fileSize || '',
      submittedBy: d.submittedBy || '',
      submittedDate: d.submittedDate || '',
      versionHistory: d.versionHistory || [],
    }));
    res.json(list);
  } catch (err) {
    console.error('Error fetching policy documents:', err);
    res.status(500).json({ error: 'Failed to fetch documents', message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await PolicyDocument.findOne({ id: req.params.id }).lean();
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json({
      ...doc,
      fileData: doc.fileData,
    });
  } catch (err) {
    console.error('Error fetching document:', err);
    res.status(500).json({ error: 'Failed to fetch document', message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    if (!body.title || !body.category || !body.owner || !body.effectiveDate) {
      return res.status(400).json({ error: 'title, category, owner, effectiveDate are required' });
    }
    const doc = await PolicyDocument.create({
      title: body.title,
      category: body.category,
      owner: body.owner,
      department: body.department || '',
      version: body.version || '1.0',
      status: body.status || 'draft',
      effectiveDate: body.effectiveDate,
      lastReviewDate: body.lastReviewDate || body.effectiveDate,
      nextReviewDate: body.nextReviewDate || '',
      reviewFrequencyMonths: body.reviewFrequencyMonths || 12,
      description: body.description || '',
      fileName: body.fileName || '',
      fileSize: body.fileSize || '',
      fileData: body.fileData,
      submittedBy: body.submittedBy || '',
      submittedDate: body.submittedDate || '',
      versionHistory: body.versionHistory || [],
    });
    res.status(201).json({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      owner: doc.owner,
      department: doc.department,
      version: doc.version,
      status: doc.status,
      effectiveDate: doc.effectiveDate,
      lastReviewDate: doc.lastReviewDate,
      nextReviewDate: doc.nextReviewDate,
      reviewFrequencyMonths: doc.reviewFrequencyMonths,
      description: doc.description,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      submittedBy: doc.submittedBy,
      submittedDate: doc.submittedDate,
      versionHistory: doc.versionHistory,
    });
  } catch (err) {
    console.error('Error creating document:', err);
    res.status(500).json({ error: 'Failed to create document', message: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const doc = await PolicyDocument.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error updating document:', err);
    res.status(500).json({ error: 'Failed to update document', message: err.message });
  }
});

export default router;
