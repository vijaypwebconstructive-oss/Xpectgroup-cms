import express from 'express';
import TrainingRecord from '../models/TrainingRecord.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const docs = await TrainingRecord.find().sort({ createdAt: -1 }).lean();
    res.json(docs);
  } catch (err) {
    console.error('Error fetching training records:', err);
    res.status(500).json({ error: 'Failed to fetch training records', message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await TrainingRecord.findOne({ id: req.params.id }).lean();
    if (!doc) return res.status(404).json({ error: 'Training record not found' });
    res.json({ ...doc, certDocumentData: doc.certDocumentData });
  } catch (err) {
    console.error('Error fetching training record:', err);
    res.status(500).json({ error: 'Failed to fetch record', message: err.message });
  }
});

const addOneYear = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
};

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.course || !body.trainingStartDate) {
      return res.status(400).json({ error: 'name, course, and trainingStartDate are required' });
    }
    const startDate = body.trainingStartDate;
    const endDate = body.trainingEndDate || startDate;
    const expiryDate = body.expiryDate || addOneYear(endDate);
    const doc = await TrainingRecord.create({
      cleanerId: body.cleanerId || '',
      name: body.name,
      location: body.location || '',
      initials: body.initials || '',
      avatarColor: body.avatarColor || 'bg-blue-500',
      avatar: body.avatar || '',
      course: body.course,
      courseIcon: body.courseIcon || 'school',
      certName: body.certName || '',
      trainingStartDate: startDate,
      trainingEndDate: endDate,
      expiryDate,
      status: body.status || 'Trained',
      certDocument: body.certDocument || '',
      certDocumentData: body.certDocumentData,
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error('Error creating training record:', err);
    res.status(500).json({ error: 'Failed to create record', message: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const doc = await TrainingRecord.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Training record not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error updating training record:', err);
    res.status(500).json({ error: 'Failed to update record', message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await TrainingRecord.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Training record not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting training record:', err);
    res.status(500).json({ error: 'Failed to delete record', message: err.message });
  }
});

export default router;
