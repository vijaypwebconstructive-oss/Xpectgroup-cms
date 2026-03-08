import express from 'express';
import Prospect from '../models/Prospect.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const docs = await Prospect.find().sort({ createdAt: -1 }).lean();
    res.json(docs);
  } catch (err) {
    console.error('Error fetching prospects:', err);
    res.status(500).json({ error: 'Failed to fetch prospects', message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await Prospect.findOne({ id: req.params.id }).lean();
    if (!doc) return res.status(404).json({ error: 'Not found', message: 'Prospect not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error fetching prospect:', err);
    res.status(500).json({ error: 'Failed to fetch prospect', message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    if (!body.clientName?.trim()) {
      return res.status(400).json({ error: 'Validation error', message: 'Client name is required' });
    }
    const doc = await Prospect.create({
      clientName: body.clientName.trim(),
      company: body.company?.trim() ?? '',
      industryType: body.industryType?.trim() ?? '',
      email: body.email?.trim() ?? '',
      contactNumber: body.contactNumber?.trim() ?? '',
      address: body.address?.trim() ?? '',
      notes: body.notes?.trim() ?? '',
      status: ['New', 'Contacted', 'Qualified', 'Quotation Sent', 'Converted', 'Lost'].includes(body.status)
        ? body.status
        : 'New',
    });
    res.status(201).json(doc.toObject());
  } catch (err) {
    console.error('Error creating prospect:', err);
    res.status(500).json({ error: 'Failed to create prospect', message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const doc = await Prospect.findOne({ id: req.params.id });
    if (!doc) return res.status(404).json({ error: 'Not found', message: 'Prospect not found' });
    const body = req.body;
    const allowed = ['clientName', 'company', 'industryType', 'email', 'contactNumber', 'address', 'notes', 'status'];
    for (const k of allowed) {
      if (body[k] === undefined) continue;
      if (k === 'status') {
        doc[k] = ['New', 'Contacted', 'Qualified', 'Quotation Sent', 'Converted', 'Lost'].includes(body[k]) ? body[k] : doc[k];
      } else if (typeof body[k] === 'string') {
        doc[k] = body[k];
      }
    }
    await doc.save();
    res.json(doc.toObject());
  } catch (err) {
    console.error('Error updating prospect:', err);
    res.status(500).json({ error: 'Failed to update prospect', message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await Prospect.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found', message: 'Prospect not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting prospect:', err);
    res.status(500).json({ error: 'Failed to delete prospect', message: err.message });
  }
});

export default router;
