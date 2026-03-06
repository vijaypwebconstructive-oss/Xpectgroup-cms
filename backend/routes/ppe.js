import express from 'express';
import { sendPPEInvoice } from '../services/emailService.js';
import PPEInvoice from '../models/PPEInvoice.js';
import PPEIssueRecord from '../models/PPEIssueRecord.js';
import PPEInventory from '../models/PPEInventory.js';

const router = express.Router();

/**
 * GET /api/ppe/invoices
 * Fetch all PPE invoice records
 */
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await PPEInvoice.find().sort({ createdAt: -1 }).lean();
    const records = invoices.map(doc => ({
      id: doc.id,
      clientId: doc.clientId,
      clientName: doc.clientName,
      issueDate: doc.issueDate,
      invoiceFile: doc.invoiceFile || '',
      invoiceFileData: doc.invoiceFileData,
      emailStatus: doc.emailStatus || 'PENDING',
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    }));
    res.json(records);
  } catch (error) {
    console.error('Error fetching PPE invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices', message: error.message });
  }
});

/**
 * POST /api/ppe/invoices
 * Create a new PPE invoice record
 */
router.post('/invoices', async (req, res) => {
  try {
    const { clientId, clientName, issueDate, invoiceFile, invoiceFileData, emailStatus } = req.body;
    if (!clientId || !clientName || !issueDate) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'clientId, clientName, and issueDate are required',
      });
    }
    const doc = await PPEInvoice.create({
      clientId,
      clientName,
      issueDate,
      invoiceFile: invoiceFile || '',
      invoiceFileData: invoiceFileData || undefined,
      emailStatus: emailStatus === 'SENT' ? 'SENT' : 'PENDING',
    });
    const record = {
      id: doc.id,
      clientId: doc.clientId,
      clientName: doc.clientName,
      issueDate: doc.issueDate,
      invoiceFile: doc.invoiceFile || '',
      invoiceFileData: doc.invoiceFileData,
      emailStatus: doc.emailStatus,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    };
    res.status(201).json(record);
  } catch (error) {
    console.error('Error creating PPE invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice', message: error.message });
  }
});

/**
 * PATCH /api/ppe/invoices/:id
 * Update a PPE invoice record (e.g. emailStatus)
 */
router.patch('/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    if (req.body.emailStatus && ['PENDING', 'SENT'].includes(req.body.emailStatus)) {
      updates.emailStatus = req.body.emailStatus;
    }
    const doc = await PPEInvoice.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    );
    if (!doc) {
      return res.status(404).json({ error: 'Invoice not found', message: `No invoice with id ${id}` });
    }
    const record = {
      id: doc.id,
      clientId: doc.clientId,
      clientName: doc.clientName,
      issueDate: doc.issueDate,
      invoiceFile: doc.invoiceFile || '',
      invoiceFileData: doc.invoiceFileData,
      emailStatus: doc.emailStatus,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    };
    res.json(record);
  } catch (error) {
    console.error('Error updating PPE invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice', message: error.message });
  }
});

/**
 * POST /api/ppe/send-invoice
 * Send PPE invoice email to client with attachment
 * Body: { email, clientName, invoiceFilename, invoiceBase64 }
 */
// PPE Records (worker issuance)
router.get('/records', async (req, res) => {
  try {
    const docs = await PPEIssueRecord.find().sort({ createdAt: -1 }).lean();
    res.json(docs);
  } catch (err) {
    console.error('Error fetching PPE records:', err);
    res.status(500).json({ error: 'Failed to fetch PPE records', message: err.message });
  }
});

router.get('/records/:id', async (req, res) => {
  try {
    const doc = await PPEIssueRecord.findOne({ id: req.params.id }).lean();
    if (!doc) return res.status(404).json({ error: 'PPE record not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error fetching PPE record:', err);
    res.status(500).json({ error: 'Failed to fetch record', message: err.message });
  }
});

router.post('/records', async (req, res) => {
  try {
    const body = req.body;
    if (!body.workerName || !body.ppeType || !body.issueDate || !body.nextReplacementDue) {
      return res.status(400).json({ error: 'workerName, ppeType, issueDate, nextReplacementDue are required' });
    }
    const doc = await PPEIssueRecord.create({
      workerId: body.workerId || '',
      workerName: body.workerName,
      workerLocation: body.workerLocation || '',
      workerInitials: body.workerInitials || '',
      workerAvatarColor: body.workerAvatarColor || 'bg-blue-500',
      ppeType: body.ppeType,
      size: body.size || '',
      issueDate: body.issueDate,
      conditionAtIssue: body.conditionAtIssue || 'New',
      replacementPeriodMonths: body.replacementPeriodMonths || 6,
      nextReplacementDue: body.nextReplacementDue,
      issuedBy: body.issuedBy || '',
      notes: body.notes || '',
      acknowledgement: body.acknowledgement || { status: 'Pending', acknowledgedAt: '' },
      status: body.status || 'Valid',
      replacementHistory: body.replacementHistory || [],
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error('Error creating PPE record:', err);
    res.status(500).json({ error: 'Failed to create record', message: err.message });
  }
});

router.patch('/records/:id', async (req, res) => {
  try {
    const doc = await PPEIssueRecord.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'PPE record not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error updating PPE record:', err);
    res.status(500).json({ error: 'Failed to update record', message: err.message });
  }
});

router.delete('/records/:id', async (req, res) => {
  try {
    const result = await PPEIssueRecord.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'PPE record not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting PPE record:', err);
    res.status(500).json({ error: 'Failed to delete record', message: err.message });
  }
});

// PPE Inventory
router.get('/inventory', async (req, res) => {
  try {
    const docs = await PPEInventory.find().sort({ ppeType: 1 }).lean();
    res.json(docs);
  } catch (err) {
    console.error('Error fetching PPE inventory:', err);
    res.status(500).json({ error: 'Failed to fetch inventory', message: err.message });
  }
});

router.post('/inventory', async (req, res) => {
  try {
    const body = req.body;
    if (!body.ppeType) {
      return res.status(400).json({ error: 'ppeType is required' });
    }
    const doc = await PPEInventory.create({
      ppeType: body.ppeType,
      availableQuantity: body.availableQuantity ?? 0,
      minimumStockLevel: body.minimumStockLevel ?? 0,
      lastRestocked: body.lastRestocked || '',
      stockStatus: body.stockStatus || 'Normal',
      unit: body.unit || 'units',
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error('Error creating inventory item:', err);
    res.status(500).json({ error: 'Failed to create inventory item', message: err.message });
  }
});

router.patch('/inventory/:id', async (req, res) => {
  try {
    const doc = await PPEInventory.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Inventory item not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error updating inventory:', err);
    res.status(500).json({ error: 'Failed to update inventory', message: err.message });
  }
});

router.delete('/inventory/:id', async (req, res) => {
  try {
    const result = await PPEInventory.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Inventory item not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ error: 'Failed to delete item', message: err.message });
  }
});

router.post('/send-invoice', async (req, res) => {
  try {
    const { email, clientName, invoiceFilename, invoiceBase64 } = req.body;

    if (!email || !clientName) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'email and clientName are required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid email format',
      });
    }

    await sendPPEInvoice(email, clientName, invoiceFilename || 'invoice.pdf', invoiceBase64 || '');

    res.status(200).json({
      success: true,
      message: 'Invoice sent successfully',
    });
  } catch (error) {
    console.error('Error sending PPE invoice:', error);
    res.status(500).json({
      error: 'Failed to send invoice',
      message: error.message,
    });
  }
});

export default router;
