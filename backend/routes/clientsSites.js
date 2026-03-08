import express from 'express';
import Client from '../models/Client.js';
import Site from '../models/Site.js';
import WorkerAssignment from '../models/WorkerAssignment.js';

const router = express.Router();

// ── Clients ───────────────────────────────────────────────────
router.get('/clients', async (req, res) => {
  try {
    const docs = await Client.find().sort({ createdAt: -1 }).lean();
    const list = docs.map(d => ({
      id: d.id,
      name: d.name,
      industry: d.industry,
      contactPerson: d.contactPerson,
      email: d.email,
      phone: d.phone || '',
      contractStart: d.contractStart,
      contractEnd: d.contractEnd,
      insuranceExpiry: d.insuranceExpiry,
      address: d.address || '',
      notes: d.notes || '',
      documents: (d.documents || []).map(doc => ({
        key: doc.key,
        name: doc.name,
        size: doc.size || 0,
        type: doc.type || '',
        uploadedAt: doc.uploadedAt || '',
        dataUrl: doc.dataUrl || '',
      })),
    }));
    res.json(list);
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ error: 'Failed to fetch clients', message: err.message });
  }
});

router.post('/clients', async (req, res) => {
  try {
    const { name, industry, contactPerson, email, phone, contractStart, contractEnd, insuranceExpiry, address, notes, documents } = req.body;
    if (!name || !industry || !contactPerson || !email || !contractStart || !contractEnd || !insuranceExpiry) {
      return res.status(400).json({ error: 'Validation error', message: 'name, industry, contactPerson, email, contractStart, contractEnd, insuranceExpiry are required' });
    }
    const docsToStore = Array.isArray(documents)
      ? documents.filter(d => d && d.key && d.name).map(d => ({
          key: d.key,
          name: d.name,
          size: typeof d.size === 'number' ? d.size : 0,
          type: d.type || '',
          uploadedAt: d.uploadedAt || '',
          dataUrl: d.dataUrl || '',
        }))
      : [];
    const doc = await Client.create({
      name,
      industry,
      contactPerson,
      email,
      phone: phone || '',
      contractStart,
      contractEnd,
      insuranceExpiry,
      address: address || '',
      notes: notes || '',
      documents: docsToStore,
    });
    const created = doc.toObject();
    res.status(201).json({
      id: created.id,
      name: created.name,
      industry: created.industry,
      contactPerson: created.contactPerson,
      email: created.email,
      phone: created.phone || '',
      contractStart: created.contractStart,
      contractEnd: created.contractEnd,
      insuranceExpiry: created.insuranceExpiry,
      address: created.address || '',
      notes: created.notes || '',
      documents: (created.documents || []).map(d => ({
        key: d.key,
        name: d.name,
        size: d.size || 0,
        type: d.type || '',
        uploadedAt: d.uploadedAt || '',
        dataUrl: d.dataUrl || '',
      })),
    });
  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ error: 'Failed to create client', message: err.message });
  }
});

router.delete('/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findOne({ id });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    const siteIds = (await Site.find({ clientId: id }).lean()).map(s => s.id);
    await WorkerAssignment.deleteMany({ siteId: { $in: siteIds } });
    await Site.deleteMany({ clientId: id });
    await Client.deleteOne({ id });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting client:', err);
    res.status(500).json({ error: 'Failed to delete client', message: err.message });
  }
});

// ── Sites ─────────────────────────────────────────────────────
router.get('/sites', async (req, res) => {
  try {
    const docs = await Site.find().sort({ createdAt: -1 }).lean();
    const list = docs.map(d => ({
      id: d.id,
      clientId: d.clientId,
      name: d.name,
      address: d.address || '',
      postcode: d.postcode || '',
      riskLevel: d.riskLevel || 'Low',
      requiredTrainings: d.requiredTrainings || [],
      emergencyContact: d.emergencyContact || '',
      emergencyPhone: d.emergencyPhone || '',
      accessInstructions: d.accessInstructions || '',
      activeWorkers: d.activeWorkers ?? 0,
      complianceDocuments: (d.complianceDocuments || []).map(cd => ({
        key: cd.key,
        name: cd.name || '',
        dataUrl: cd.dataUrl || '',
      })),
    }));
    res.json(list);
  } catch (err) {
    console.error('Error fetching sites:', err);
    res.status(500).json({ error: 'Failed to fetch sites', message: err.message });
  }
});

router.post('/sites', async (req, res) => {
  try {
    const { clientId, name, address, postcode, riskLevel, requiredTrainings, emergencyContact, emergencyPhone, accessInstructions, activeWorkers } = req.body;
    if (!clientId || !name) {
      return res.status(400).json({ error: 'Validation error', message: 'clientId and name are required' });
    }
    const doc = await Site.create({
      clientId,
      name,
      address: address || '',
      postcode: postcode || '',
      riskLevel: riskLevel || 'Low',
      requiredTrainings: Array.isArray(requiredTrainings) ? requiredTrainings : [],
      emergencyContact: emergencyContact || '',
      emergencyPhone: emergencyPhone || '',
      accessInstructions: accessInstructions || '',
      activeWorkers: typeof activeWorkers === 'number' ? activeWorkers : 0,
    });
    res.status(201).json({
      id: doc.id,
      clientId: doc.clientId,
      name: doc.name,
      address: doc.address || '',
      postcode: doc.postcode || '',
      riskLevel: doc.riskLevel || 'Low',
      requiredTrainings: doc.requiredTrainings || [],
      emergencyContact: doc.emergencyContact || '',
      emergencyPhone: doc.emergencyPhone || '',
      accessInstructions: doc.accessInstructions || '',
      activeWorkers: doc.activeWorkers ?? 0,
      complianceDocuments: (doc.complianceDocuments || []).map(cd => ({
        key: cd.key,
        name: cd.name || '',
        dataUrl: cd.dataUrl || '',
      })),
    });
  } catch (err) {
    console.error('Error creating site:', err);
    res.status(500).json({ error: 'Failed to create site', message: err.message });
  }
});

router.patch('/sites/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { complianceDocuments } = req.body;
    const site = await Site.findOne({ id });
    if (!site) return res.status(404).json({ error: 'Site not found' });
    const updates = {};
    if (Array.isArray(complianceDocuments)) {
      updates.complianceDocuments = complianceDocuments
        .filter(cd => cd && cd.key)
        .map(cd => ({
          key: cd.key,
          name: cd.name || '',
          dataUrl: cd.dataUrl || '',
        }));
    }
    const doc = await Site.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    ).lean();
    res.json({
      id: doc.id,
      clientId: doc.clientId,
      name: doc.name,
      address: doc.address || '',
      postcode: doc.postcode || '',
      riskLevel: doc.riskLevel || 'Low',
      requiredTrainings: doc.requiredTrainings || [],
      emergencyContact: doc.emergencyContact || '',
      emergencyPhone: doc.emergencyPhone || '',
      accessInstructions: doc.accessInstructions || '',
      activeWorkers: doc.activeWorkers ?? 0,
      complianceDocuments: (doc.complianceDocuments || []).map(cd => ({
        key: cd.key,
        name: cd.name || '',
        dataUrl: cd.dataUrl || '',
      })),
    });
  } catch (err) {
    console.error('Error updating site:', err);
    res.status(500).json({ error: 'Failed to update site', message: err.message });
  }
});

router.delete('/sites/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const site = await Site.findOne({ id });
    if (!site) return res.status(404).json({ error: 'Site not found' });
    await WorkerAssignment.deleteMany({ siteId: id });
    await Site.deleteOne({ id });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting site:', err);
    res.status(500).json({ error: 'Failed to delete site', message: err.message });
  }
});

// ── Worker Assignments ─────────────────────────────────────────
router.get('/assignments', async (req, res) => {
  try {
    const docs = await WorkerAssignment.find().sort({ createdAt: -1 }).lean();
    const list = docs.map(d => ({
      id: d.id,
      workerId: d.workerId,
      workerName: d.workerName,
      workerInitials: d.workerInitials || '',
      workerAvatarColor: d.workerAvatarColor || 'bg-blue-500',
      siteId: d.siteId,
      siteName: d.siteName,
      clientId: d.clientId,
      completedTrainings: d.completedTrainings || [],
      complianceStatus: d.complianceStatus || 'Compliant',
      assignedSince: d.assignedSince,
      role: d.role || 'Cleaner',
    }));
    res.json(list);
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'Failed to fetch assignments', message: err.message });
  }
});

router.post('/assignments', async (req, res) => {
  try {
    const { workerId, workerName, workerInitials, workerAvatarColor, siteId, siteName, clientId, completedTrainings, complianceStatus, assignedSince, role } = req.body;
    if (!workerId || !workerName || !siteId || !siteName || !clientId || !assignedSince) {
      return res.status(400).json({ error: 'Validation error', message: 'workerId, workerName, siteId, siteName, clientId, assignedSince are required' });
    }
    const doc = await WorkerAssignment.create({
      workerId,
      workerName,
      workerInitials: workerInitials || '',
      workerAvatarColor: workerAvatarColor || 'bg-blue-500',
      siteId,
      siteName,
      clientId,
      completedTrainings: Array.isArray(completedTrainings) ? completedTrainings : [],
      complianceStatus: complianceStatus || 'Compliant',
      assignedSince,
      role: role || 'Cleaner',
    });
    res.status(201).json({
      id: doc.id,
      workerId: doc.workerId,
      workerName: doc.workerName,
      workerInitials: doc.workerInitials || '',
      workerAvatarColor: doc.workerAvatarColor || 'bg-blue-500',
      siteId: doc.siteId,
      siteName: doc.siteName,
      clientId: doc.clientId,
      completedTrainings: doc.completedTrainings || [],
      complianceStatus: doc.complianceStatus || 'Compliant',
      assignedSince: doc.assignedSince,
      role: doc.role || 'Cleaner',
    });
  } catch (err) {
    console.error('Error creating assignment:', err);
    res.status(500).json({ error: 'Failed to create assignment', message: err.message });
  }
});

router.delete('/assignments', async (req, res) => {
  try {
    const { workerId, siteId } = req.query;
    if (!workerId || !siteId) {
      return res.status(400).json({ error: 'Validation error', message: 'workerId and siteId query params are required' });
    }
    const result = await WorkerAssignment.deleteOne({ workerId, siteId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error removing assignment:', err);
    res.status(500).json({ error: 'Failed to remove assignment', message: err.message });
  }
});

export default router;
