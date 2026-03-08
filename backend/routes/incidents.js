import express from 'express';
import Incident from '../models/Incident.js';
import CorrectiveAction from '../models/CorrectiveAction.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const docs = await Incident.find().sort({ createdAt: -1 }).lean();
    res.json(docs);
  } catch (err) {
    console.error('Error fetching incidents:', err);
    res.status(500).json({ error: 'Failed to fetch incidents', message: err.message });
  }
});

// Must be before /:id to avoid "actions" being captured as id
router.get('/:id/actions', async (req, res) => {
  try {
    const actions = await CorrectiveAction.find({ incidentId: req.params.id }).sort({ createdAt: 1 }).lean();
    res.json(actions);
  } catch (err) {
    console.error('Error fetching corrective actions:', err);
    res.status(500).json({ error: 'Failed to fetch actions', message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await Incident.findOne({ id: req.params.id }).lean();
    if (!doc) return res.status(404).json({ error: 'Incident not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error fetching incident:', err);
    res.status(500).json({ error: 'Failed to fetch incident', message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    if (!body.date || !body.site || !body.worker || !body.type || !body.severity || !body.description) {
      return res.status(400).json({ error: 'date, site, worker, type, severity, description are required' });
    }
    const doc = await Incident.create({
      date: body.date,
      site: body.site,
      worker: body.worker,
      type: body.type,
      severity: body.severity,
      status: body.status || 'Open',
      investigator: body.investigator || '',
      description: body.description,
      injuryOccurred: body.injuryOccurred || false,
      injuryDescription: body.injuryDescription || '',
      medicalTreatmentRequired: body.medicalTreatmentRequired || false,
      propertyDamage: body.propertyDamage || '',
      immediateActionTaken: body.immediateActionTaken || '',
      supervisorNotified: body.supervisorNotified || false,
      investigationNotes: body.investigationNotes || '',
      rootCause: body.rootCause || '',
      witnessNotes: body.witnessNotes || '',
      hasPhotos: body.hasPhotos || false,
      photoEvidenceName: body.photoEvidenceName || '',
      photoEvidenceData: body.photoEvidenceData || '',
      closedDate: body.closedDate || '',
      closedBy: body.closedBy || '',
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error('Error creating incident:', err);
    res.status(500).json({ error: 'Failed to create incident', message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await CorrectiveAction.deleteMany({ incidentId: req.params.id });
    const result = await Incident.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Incident not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting incident:', err);
    res.status(500).json({ error: 'Failed to delete incident', message: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const doc = await Incident.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Incident not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error updating incident:', err);
    res.status(500).json({ error: 'Failed to update incident', message: err.message });
  }
});

router.post('/:id/actions', async (req, res) => {
  try {
    const body = req.body;
    if (!body.description || !body.assignedTo || !body.dueDate) {
      return res.status(400).json({ error: 'description, assignedTo, dueDate are required' });
    }
    const doc = await CorrectiveAction.create({
      incidentId: req.params.id,
      description: body.description,
      assignedTo: body.assignedTo,
      dueDate: body.dueDate,
      status: body.status || 'Open',
      completedDate: body.completedDate || '',
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error('Error creating corrective action:', err);
    res.status(500).json({ error: 'Failed to create action', message: err.message });
  }
});

router.patch('/:id/actions/:actionId', async (req, res) => {
  try {
    const doc = await CorrectiveAction.findOneAndUpdate(
      { id: req.params.actionId, incidentId: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Action not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error updating action:', err);
    res.status(500).json({ error: 'Failed to update action', message: err.message });
  }
});

export default router;
