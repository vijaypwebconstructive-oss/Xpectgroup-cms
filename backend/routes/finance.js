import express from 'express';
import { randomUUID } from 'crypto';
import PayrollRecord from '../models/PayrollRecord.js';
import SalarySlip from '../models/SalarySlip.js';
import SiteContract from '../models/SiteContract.js';
import Invoice from '../models/Invoice.js';
import InvoiceSettings from '../models/InvoiceSettings.js';
import Quotation from '../models/Quotation.js';
import Cleaner from '../models/Cleaner.js';
import WorkerAssignment from '../models/WorkerAssignment.js';
import { sendSalarySlipWithPdf, sendFinanceInvoice } from '../services/emailService.js';
import { generateSalarySlipPdf, saveSalarySlipPdf } from '../services/salarySlipPdf.js';
import { createAndSendSalarySlip, regenerateSalarySlipPdf } from '../services/salarySlipService.js';

const router = express.Router();
const DEFAULT_HOURS_PER_MONTH = 160;
const WEEKS_PER_MONTH = 4.33;
const MONTHS_SHORT = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ── Payroll ───────────────────────────────────────────────────────

router.get('/payroll', async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};
    if (month != null) filter.month = parseInt(month, 10);
    if (year != null) filter.year = parseInt(year, 10);
    const docs = await PayrollRecord.find(filter).sort({ year: -1, month: -1, workerName: 1 }).lean();
    res.json(docs);
  } catch (err) {
    console.error('Error fetching payroll:', err);
    res.status(500).json({ error: 'Failed to fetch payroll', message: err.message });
  }
});

router.get('/payroll/:id', async (req, res) => {
  try {
    const doc = await PayrollRecord.findOne({ id: req.params.id }).lean();
    if (!doc) return res.status(404).json({ error: 'Not found', message: 'Payroll record not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error fetching payroll:', err);
    res.status(500).json({ error: 'Failed to fetch payroll', message: err.message });
  }
});

router.post('/payroll', async (req, res) => {
  try {
    const body = req.body;
    // Single-record payload: create one payroll from form
    if (body.workerId != null && body.workerName != null) {
      const {
        workerId,
        workerName,
        month,
        year,
        payType = 'Hourly',
        hoursWorked,
        hourlyRate,
        monthlySalary,
        totalSalary,
        siteId,
        siteName,
        role,
        paymentStatus = 'Pending',
        paymentDate,
      } = body;
      if (month == null || year == null || totalSalary == null) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'workerId, workerName, month, year, totalSalary are required',
        });
      }
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      const isMonthly = payType === 'Monthly';
      const hw = hoursWorked != null ? parseFloat(hoursWorked) : (isMonthly ? 0 : 160);
      const hr = hourlyRate != null ? parseFloat(hourlyRate) : (isMonthly ? 0 : 12);
      const ms = monthlySalary != null ? parseFloat(monthlySalary) : (isMonthly ? parseFloat(totalSalary) : null);
      const existing = await PayrollRecord.findOne({ workerId: String(workerId), month: m, year: y });
      if (existing) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Payroll for this cleaner already exists for the selected pay period.',
        });
      }
      const doc = await PayrollRecord.create({
        workerId: String(workerId),
        workerName: String(workerName),
        month: m,
        year: y,
        payType: isMonthly ? 'Monthly' : 'Hourly',
        hoursWorked: hw,
        hourlyRate: hr,
        monthlySalary: ms,
        totalSalary: parseFloat(totalSalary),
        siteId: siteId ?? '',
        siteName: siteName ?? '',
        role: role ?? 'Cleaner',
        paymentStatus: paymentStatus === 'Paid' ? 'Paid' : 'Pending',
        paymentDate: paymentStatus === 'Paid' ? (paymentDate || new Date().toISOString().split('T')[0]) : null,
      });
      const obj = doc.toObject();
      return res.status(201).json(obj);
    }

    // Batch: from assignments
    const { month, year, workerOverrides } = body;
    const m = month != null ? parseInt(month, 10) : new Date().getMonth() + 1;
    const y = year != null ? parseInt(year, 10) : new Date().getFullYear();

    const cleaners = await Cleaner.find().lean();
    const assignments = await WorkerAssignment.find().lean();
    const cleanerMap = Object.fromEntries(cleaners.map(c => [c.id, c]));

    const overrides = (workerOverrides || {});
    const created = [];

    for (const a of assignments) {
      const cleaner = cleanerMap[a.workerId];
      const staffPayType = cleaner?.payType || 'Hourly';
      const isMonthly = staffPayType === 'Monthly';

      let payType = 'Hourly';
      let hoursWorked = 0;
      let hourlyRate = 0;
      let monthlySalary = null;
      let totalSalary = 0;

      if (isMonthly) {
        payType = 'Monthly';
        monthlySalary = cleaner?.monthlySalary ?? 0;
        totalSalary = Math.round((monthlySalary || 0) * 100) / 100;
      } else {
        hourlyRate = cleaner?.hourlyPayRate ?? 12;
        hoursWorked = DEFAULT_HOURS_PER_MONTH;
        if (a.hoursPerWeek != null && a.hoursPerWeek > 0) {
          hoursWorked = Math.round(a.hoursPerWeek * WEEKS_PER_MONTH * 10) / 10;
        }
        if (overrides[a.workerId] != null && typeof overrides[a.workerId].hoursWorked === 'number') {
          hoursWorked = overrides[a.workerId].hoursWorked;
        }
        totalSalary = Math.round(hoursWorked * hourlyRate * 100) / 100;
      }

      const existing = await PayrollRecord.findOne({ workerId: a.workerId, month: m, year: y });
      if (existing) continue;

      const doc = await PayrollRecord.create({
        workerId: a.workerId,
        workerName: cleaner?.name ?? a.workerName ?? 'Unknown',
        month: m,
        year: y,
        payType,
        hoursWorked,
        hourlyRate,
        monthlySalary,
        totalSalary,
        paymentStatus: 'Pending',
        siteId: a.siteId,
        siteName: a.siteName || '',
        role: a.role || 'Cleaner',
      });
      created.push(doc.toObject());
    }

    res.status(201).json(created);
  } catch (err) {
    console.error('Error generating payroll:', err);
    res.status(500).json({ error: 'Failed to generate payroll', message: err.message });
  }
});

router.patch('/payroll/:id', async (req, res) => {
  try {
    const { payType, hoursWorked, hourlyRate, monthlySalary, totalSalary, month, year, paymentStatus, paymentDate } = req.body;
    const doc = await PayrollRecord.findOne({ id: req.params.id });
    if (!doc) return res.status(404).json({ error: 'Not found', message: 'Payroll record not found' });
    const wasPaid = doc.paymentStatus === 'Paid';
    if (payType) doc.payType = payType === 'Monthly' ? 'Monthly' : 'Hourly';
    if (hoursWorked != null) doc.hoursWorked = parseFloat(hoursWorked);
    if (hourlyRate != null) doc.hourlyRate = parseFloat(hourlyRate);
    if (monthlySalary != null) doc.monthlySalary = parseFloat(monthlySalary);
    if (totalSalary != null) doc.totalSalary = parseFloat(totalSalary);
    if (month != null) doc.month = parseInt(month, 10);
    if (year != null) doc.year = parseInt(year, 10);
    if (paymentStatus) doc.paymentStatus = paymentStatus;
    if (paymentDate != null) doc.paymentDate = paymentDate;
    if (paymentStatus === 'Paid' && !doc.paymentDate) {
      doc.paymentDate = new Date().toISOString().split('T')[0];
    }
    await doc.save();
    const obj = doc.toObject();

    if (paymentStatus === 'Paid' && !wasPaid && !doc.salarySlipSentAt) {
      try {
        await createAndSendSalarySlip(doc);
        obj.salarySlipSentAt = doc.salarySlipSentAt;
      } catch (emailErr) {
        console.warn('Salary slip generation/email skipped or failed:', emailErr.message);
      }
    } else {
      // Regenerate PDF when payroll is edited and a slip already exists, so download/send match current data
      try {
        await regenerateSalarySlipPdf(doc);
      } catch (regenErr) {
        console.warn('Salary slip PDF regeneration failed:', regenErr.message);
      }
    }

    res.json(obj);
  } catch (err) {
    console.error('Error updating payroll:', err);
    res.status(500).json({ error: 'Failed to update payroll', message: err.message });
  }
});

router.delete('/payroll/:id', async (req, res) => {
  try {
    const doc = await PayrollRecord.findOneAndDelete({ id: req.params.id });
    if (!doc) return res.status(404).json({ error: 'Not found', message: 'Payroll record not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting payroll:', err);
    res.status(500).json({ error: 'Failed to delete payroll', message: err.message });
  }
});

// ── Invoices ───────────────────────────────────────────────────────

function computeInvoiceStatus(doc) {
  if (doc.status === 'Paid') return 'Paid';
  const dueStr = doc.dueDate;
  if (dueStr) {
    const dueDate = new Date(dueStr);
    if (!isNaN(dueDate.getTime()) && dueDate < new Date()) return 'Overdue';
  }
  return doc.status || 'Pending';
}

router.get('/invoices', async (req, res) => {
  try {
    const { status, clientName, year } = req.query;
    const filter = {};
    if (status) filter.status = String(status);
    if (clientName) filter['billTo.clientName'] = new RegExp(String(clientName), 'i');
    if (year != null) {
      const y = parseInt(year, 10);
      filter.$or = [
        { issueDate: { $regex: String(y) } },
        { dueDate: { $regex: String(y) } },
      ];
    }
    const docs = await Invoice.find(filter).sort({ createdAt: -1 }).lean();
    const withStatus = docs.map(d => ({ ...d, status: computeInvoiceStatus(d) }));
    res.json(withStatus);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ error: 'Failed to fetch invoices', message: err.message });
  }
});

router.get('/invoices/:id', async (req, res) => {
  try {
    const doc = await Invoice.findOne({ id: req.params.id }).lean();
    if (!doc) return res.status(404).json({ error: 'Not found', message: 'Invoice not found' });
    const status = computeInvoiceStatus(doc);
    res.json({ ...doc, status });
  } catch (err) {
    console.error('Error fetching invoice:', err);
    res.status(500).json({ error: 'Failed to fetch invoice', message: err.message });
  }
});

async function nextInvoiceNumber() {
  const y = new Date().getFullYear();
  let prefixTemplate = 'INV-YYYY';
  try {
    const settings = await InvoiceSettings.findOne({ id: 'default' }).lean();
    if (settings?.invoicePrefix) prefixTemplate = String(settings.invoicePrefix);
  } catch (_) { /* use default */ }
  const prefix = prefixTemplate.replace('YYYY', String(y)) + '-';
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const last = await Invoice.findOne({ invoiceNumber: new RegExp(`^${escapedPrefix}`) })
    .sort({ invoiceNumber: -1 })
    .lean();
  let seq = 1;
  if (last && last.invoiceNumber) {
    const m = last.invoiceNumber.match(new RegExp(`^${escapedPrefix}(\\d+)$`));
    if (m) seq = parseInt(m[1], 10) + 1;
  }
  return `${prefix}${String(seq).padStart(3, '0')}`;
}

function parseDateToISO(str) {
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return null;
}

router.post('/invoices', async (req, res) => {
  try {
    const body = req.body;
    const invoiceNumber = body.invoiceNumber || (await nextInvoiceNumber());
    const issueDate = body.issueDate || new Date().toISOString().split('T')[0];
    const dueDate = body.dueDate || issueDate;
    const status = body.status === 'Paid' ? 'Paid' : 'Pending';

    const doc = await Invoice.create({
      invoiceNumber,
      issueDate,
      dueDate,
      servicePeriod: body.servicePeriod ?? '',
      status,
      billBy: body.billBy ?? {},
      billTo: body.billTo ?? {},
      serviceItems: Array.isArray(body.serviceItems) ? body.serviceItems : [],
      subtotal: parseFloat(body.subtotal) || 0,
      discount: parseFloat(body.discount) || 0,
      vat: parseFloat(body.vat) || 0,
      serviceCharges: parseFloat(body.serviceCharges) || 0,
      totalAmount: parseFloat(body.totalAmount) || 0,
      payableAmount: parseFloat(body.payableAmount) || 0,
      serviceDetails: (() => {
        const sd = body.serviceDetails;
        if (!sd) return [];
        if (Array.isArray(sd)) return sd;
        return [sd];
      })(),
      notes: body.notes ?? '',
      footer: body.footer ?? '',
      clientId: body.clientId ?? '',
    });
    const obj = doc.toObject();
    obj.status = computeInvoiceStatus(obj);
    res.status(201).json(obj);
  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(500).json({ error: 'Failed to create invoice', message: err.message });
  }
});

router.patch('/invoices/:id', async (req, res) => {
  try {
    const doc = await Invoice.findOne({ id: req.params.id });
    if (!doc) return res.status(404).json({ error: 'Not found', message: 'Invoice not found' });
    const body = req.body;
    const allowed = [
      'invoiceNumber', 'issueDate', 'dueDate', 'servicePeriod', 'status',
      'billBy', 'billTo', 'serviceItems', 'subtotal', 'discount', 'vat',
      'serviceCharges', 'totalAmount', 'payableAmount',       'serviceDetails', 'notes', 'footer', 'clientId',
    ];
    for (const k of allowed) {
      if (body[k] === undefined) continue;
      if (k === 'status') doc[k] = ['Paid', 'Overdue', 'Sent'].includes(body[k]) ? body[k] : 'Pending';
      else if (['billBy', 'billTo'].includes(k) && typeof body[k] === 'object') doc[k] = body[k];
      else if (k === 'serviceDetails') {
        const sd = body[k];
        doc[k] = !sd ? [] : Array.isArray(sd) ? sd : [sd];
      }
      else if (k === 'serviceItems' && Array.isArray(body[k])) doc[k] = body[k];
      else if (['subtotal', 'discount', 'vat', 'serviceCharges', 'totalAmount', 'payableAmount'].includes(k)) doc[k] = parseFloat(body[k]) || 0;
      else if (typeof body[k] === 'string') doc[k] = body[k];
    }
    await doc.save();
    const obj = doc.toObject();
    obj.status = computeInvoiceStatus(obj);
    res.json(obj);
  } catch (err) {
    console.error('Error updating invoice:', err);
    res.status(500).json({ error: 'Failed to update invoice', message: err.message });
  }
});

router.delete('/invoices/:id', async (req, res) => {
  try {
    const doc = await Invoice.findOneAndDelete({ id: req.params.id });
    if (!doc) return res.status(404).json({ error: 'Not found', message: 'Invoice not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting invoice:', err);
    res.status(500).json({ error: 'Failed to delete invoice', message: err.message });
  }
});

router.post('/invoices/:id/send', async (req, res) => {
  try {
    const doc = await Invoice.findOne({ id: req.params.id }).lean();
    if (!doc) return res.status(404).json({ error: 'Not found', message: 'Invoice not found' });
    const email = doc.billTo?.email?.trim();
    if (!email) return res.status(400).json({ error: 'Validation error', message: 'Client email is required to send invoice' });
    await sendFinanceInvoice(email, doc.billTo?.clientName, doc);
    await Invoice.updateOne({ id: req.params.id }, { $set: { status: 'Sent' } });
    const updated = await Invoice.findOne({ id: req.params.id }).lean();
    const obj = { ...updated, status: computeInvoiceStatus(updated) };
    res.json(obj);
  } catch (err) {
    console.error('Error sending invoice:', err);
    res.status(500).json({ error: 'Failed to send invoice', message: err.message });
  }
});

// ── Salary Slips ───────────────────────────────────────────────────

router.get('/salary-slips', async (req, res) => {
  try {
    const { cleanerId } = req.query;
    const filter = {};
    if (cleanerId) filter.cleanerId = String(cleanerId);
    const docs = await SalarySlip.find(filter).sort({ year: -1, month: -1, workerName: 1 }).lean();
    res.json(docs);
  } catch (err) {
    console.error('Error fetching salary slips:', err);
    res.status(500).json({ error: 'Failed to fetch salary slips', message: err.message });
  }
});

router.get('/salary-slips/:id', async (req, res) => {
  try {
    const doc = await SalarySlip.findOne({ id: req.params.id }).lean();
    if (!doc) return res.status(404).json({ error: 'Not found', message: 'Salary slip not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error fetching salary slip:', err);
    res.status(500).json({ error: 'Failed to fetch salary slip', message: err.message });
  }
});

router.get('/salary-slips/:id/download', async (req, res) => {
  try {
    const slip = await SalarySlip.findOne({ id: req.params.id }).lean();
    if (!slip) return res.status(404).json({ error: 'Not found', message: 'Salary slip not found' });
    const pathModule = await import('path');
    const fsModule = await import('fs');
    const { fileURLToPath } = await import('url');
    const __dirname = pathModule.dirname(fileURLToPath(import.meta.url));
    const fullPath = pathModule.join(__dirname, '..', slip.pdfPath);
    if (!fsModule.existsSync(fullPath)) return res.status(404).json({ error: 'Not found', message: 'PDF file not found' });
    const filename = `salary-slip-${slip.payPeriod.replace(/\s/g, '-')}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(pathModule.resolve(fullPath));
  } catch (err) {
    console.error('Error downloading salary slip:', err);
    res.status(500).json({ error: 'Failed to download salary slip', message: err.message });
  }
});

router.post('/salary-slips/:id/send', async (req, res) => {
  try {
    const slip = await SalarySlip.findOne({ id: req.params.id }).lean();
    if (!slip) return res.status(404).json({ error: 'Not found', message: 'Salary slip not found' });

    const cleaner = await Cleaner.findOne({ id: slip.cleanerId }).lean();
    const email = cleaner?.email;
    if (!email) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Cleaner has no email address. Please add email in staff detail page.',
      });
    }

    const payrollDoc = await PayrollRecord.findOne({ id: slip.payrollId }).lean();
    const record = payrollDoc || {
      workerName: slip.workerName,
      month: slip.month,
      year: slip.year,
      hoursWorked: 0,
      hourlyRate: 0,
      totalSalary: slip.salaryAmount,
      paymentStatus: slip.paymentStatus,
      paymentDate: null,
    };

    const pathModule = await import('path');
    const fsModule = await import('fs');
    const { fileURLToPath } = await import('url');
    const __dirname = pathModule.dirname(fileURLToPath(import.meta.url));
    const fullPath = pathModule.join(__dirname, '..', slip.pdfPath);

    if (!fsModule.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Not found', message: 'PDF file not found' });
    }

    const pdfFilename = `salary-slip-${slip.payPeriod.replace(/\s/g, '-')}.pdf`;
    const result = await sendSalarySlipWithPdf(email, slip.workerName, record, fullPath, pdfFilename);

    if (result.skipped) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: result.reason || 'Email service not configured',
      });
    }

    res.json({ success: true, message: 'Payslip sent successfully', to: email });
  } catch (err) {
    console.error('Error sending salary slip:', err);
    res.status(500).json({ error: 'Failed to send salary slip', message: err.message });
  }
});

// ── Site Contracts (Client Revenue) ────────────────────────────────

router.get('/site-contracts', async (req, res) => {
  try {
    const docs = await SiteContract.find().sort({ clientName: 1, siteName: 1 }).lean();
    res.json(docs);
  } catch (err) {
    console.error('Error fetching site contracts:', err);
    res.status(500).json({ error: 'Failed to fetch site contracts', message: err.message });
  }
});

router.get('/site-contracts/:id', async (req, res) => {
  try {
    const doc = await SiteContract.findOne({ id: req.params.id }).lean();
    if (!doc) return res.status(404).json({ error: 'Not found', message: 'Site contract not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error fetching site contract:', err);
    res.status(500).json({ error: 'Failed to fetch site contract', message: err.message });
  }
});

router.post('/site-contracts', async (req, res) => {
  try {
    const { siteId, clientId, siteName, clientName, contractValue, billingPeriod, paymentStatus, lastBillingDate, paymentDate, paymentDocuments } = req.body;
    if (!siteId || !clientId || siteName == null || clientName == null || contractValue == null) {
      return res.status(400).json({ error: 'Validation error', message: 'siteId, clientId, siteName, clientName, contractValue are required' });
    }
    const existing = await SiteContract.findOne({ clientId, siteId });
    if (existing) {
      return res.status(409).json({ error: 'Conflict', message: 'A revenue contract already exists for this client and site.' });
    }
    const doc = await SiteContract.create({
      siteId,
      clientId,
      siteName: siteName || '',
      clientName: clientName || '',
      contractValue: parseFloat(contractValue),
      billingPeriod: billingPeriod || 'Monthly',
      paymentStatus: paymentStatus || 'Pending',
      lastBillingDate: lastBillingDate || null,
      paymentDate: paymentDate || null,
      paymentDocuments: Array.isArray(paymentDocuments) ? paymentDocuments : [],
    });
    res.status(201).json(doc.toObject());
  } catch (err) {
    console.error('Error creating site contract:', err);
    res.status(500).json({ error: 'Failed to create site contract', message: err.message });
  }
});

router.patch('/site-contracts/:id', async (req, res) => {
  try {
    const doc = await SiteContract.findOne({ id: req.params.id });
    if (!doc) return res.status(404).json({ error: 'Not found', message: 'Site contract not found' });
    const { contractValue, billingPeriod, paymentStatus, lastBillingDate, paymentDate, paymentDocuments } = req.body;
    if (contractValue != null) doc.contractValue = parseFloat(contractValue);
    if (billingPeriod) doc.billingPeriod = billingPeriod;
    if (paymentStatus) doc.paymentStatus = paymentStatus;
    if (lastBillingDate != null) doc.lastBillingDate = lastBillingDate;
    if (paymentDate != null) doc.paymentDate = paymentDate;
    if (Array.isArray(paymentDocuments)) doc.paymentDocuments = paymentDocuments;
    await doc.save();
    res.json(doc.toObject());
  } catch (err) {
    console.error('Error updating site contract:', err);
    res.status(500).json({ error: 'Failed to update site contract', message: err.message });
  }
});

// ── Quotations ─────────────────────────────────────────────────────

function normalizeQuotationDoc(doc) {
  if (!doc) return doc;
  const d = { ...doc };
  d.billTo = d.billTo || {};
  if (!d.billTo.clientName && d.clientName) d.billTo.clientName = d.clientName;
  if (!d.billTo.email && d.clientEmail) d.billTo.email = d.clientEmail;
  if (!d.billTo.clientAddress && d.serviceAddress) d.billTo.clientAddress = d.serviceAddress;
  if ((!d.serviceItems || d.serviceItems.length === 0) && d.serviceDescription && d.hourlyRate != null) {
    const nc = d.numCleaners ?? 1;
    const hpv = d.hoursPerVisit ?? 2;
    const vpw = d.visitsPerWeek ?? 5;
    const amount = Math.round(nc * hpv * vpw * 4 * (d.hourlyRate || 0) * 100) / 100;
    d.serviceItems = [{
      serviceDescription: d.serviceDescription || '',
      siteLocation: d.serviceAddress || '',
      quantity: String(nc * hpv * vpw * 4),
      rate: String(d.hourlyRate),
      discount: '0',
      amount: String(amount),
    }];
    d.subtotal = d.totalPrice ?? amount;
    d.totalAmount = d.totalPrice ?? amount;
    d.payableAmount = d.totalPrice ?? amount;
  }
  return d;
}

router.get('/quotations', async (req, res) => {
  try {
    const docs = await Quotation.find().sort({ createdAt: -1 }).lean();
    res.json(docs.map(normalizeQuotationDoc));
  } catch (err) {
    console.error('Error fetching quotations:', err);
    res.status(500).json({ error: 'Failed to fetch quotations', message: err.message });
  }
});

router.get('/quotations/:id', async (req, res) => {
  try {
    const doc = await Quotation.findOne({ id: req.params.id }).lean();
    if (!doc) return res.status(404).json({ error: 'Not found', message: 'Quotation not found' });
    res.json(normalizeQuotationDoc(doc));
  } catch (err) {
    console.error('Error fetching quotation:', err);
    res.status(500).json({ error: 'Failed to fetch quotation', message: err.message });
  }
});

router.post('/quotations', async (req, res) => {
  try {
    const body = req.body;
    const hasNewFormat = body.billTo != null || (Array.isArray(body.serviceItems) && body.serviceItems.length > 0);

    if (hasNewFormat) {
      const issueDate = body.issueDate || new Date().toISOString().split('T')[0];
      const expiryDate = body.expiryDate || issueDate;
      let qn = body.quotationNumber;
      if (!qn) {
        const last = await Quotation.findOne().sort({ createdAt: -1 }).lean();
        const seq = last ? (parseInt(last.quotationNumber.replace(/\D/g, ''), 10) || 0) + 1 : 1;
        qn = `QUO-${new Date().getFullYear()}-${String(seq).padStart(3, '0')}`;
      }
      const doc = await Quotation.create({
        quotationNumber: qn,
        issueDate,
        expiryDate,
        status: body.status === 'Sent' || body.status === 'Accepted' || body.status === 'Rejected' ? body.status : 'Draft',
        billBy: body.billBy ?? {},
        billTo: body.billTo ?? {},
        serviceItems: Array.isArray(body.serviceItems) ? body.serviceItems : [],
        subtotal: parseFloat(body.subtotal) || 0,
        discount: parseFloat(body.discount) || 0,
        vat: parseFloat(body.vat) || 0,
        serviceCharges: parseFloat(body.serviceCharges) || 0,
        totalAmount: parseFloat(body.totalAmount) || 0,
        payableAmount: parseFloat(body.payableAmount) || 0,
        notes: body.notes ?? '',
        footer: body.footer ?? '',
      });
      return res.status(201).json(normalizeQuotationDoc(doc.toObject()));
    }

    const { quotationNumber, clientName, clientEmail, serviceAddress, serviceDescription, numCleaners, hoursPerVisit, visitsPerWeek, hourlyRate, totalPrice, status } = body;
    if (!clientName || !clientEmail || hourlyRate == null) {
      return res.status(400).json({ error: 'Validation error', message: 'clientName, clientEmail, hourlyRate are required' });
    }
    const nc = numCleaners ?? 1;
    const hpv = hoursPerVisit ?? 2;
    const vpw = visitsPerWeek ?? 5;
    const hr = parseFloat(hourlyRate);
    const computedPrice = totalPrice != null ? parseFloat(totalPrice) : Math.round(nc * hpv * vpw * 4 * hr * 100) / 100;
    const qn = quotationNumber || `QUO-${Date.now()}`;
    const doc = await Quotation.create({
      quotationNumber: qn,
      clientName,
      clientEmail,
      serviceAddress: serviceAddress || '',
      serviceDescription: serviceDescription || '',
      numCleaners: nc,
      hoursPerVisit: hpv,
      visitsPerWeek: vpw,
      hourlyRate: hr,
      totalPrice: computedPrice,
      status: status || 'Draft',
    });
    res.status(201).json(normalizeQuotationDoc(doc.toObject()));
  } catch (err) {
    console.error('Error creating quotation:', err);
    res.status(500).json({ error: 'Failed to create quotation', message: err.message });
  }
});

router.patch('/quotations/:id', async (req, res) => {
  try {
    const doc = await Quotation.findOne({ id: req.params.id });
    if (!doc) return res.status(404).json({ error: 'Not found', message: 'Quotation not found' });
    const body = req.body;
    const allowed = ['quotationNumber', 'issueDate', 'expiryDate', 'status', 'billBy', 'billTo', 'serviceItems', 'subtotal', 'discount', 'vat', 'serviceCharges', 'totalAmount', 'payableAmount', 'notes', 'footer', 'clientName', 'clientEmail', 'serviceAddress', 'serviceDescription', 'numCleaners', 'hoursPerVisit', 'visitsPerWeek', 'hourlyRate', 'totalPrice'];
    for (const k of allowed) {
      if (body[k] === undefined) continue;
      if (k === 'status') doc[k] = ['Sent', 'Accepted', 'Rejected'].includes(body[k]) ? body[k] : 'Draft';
      else if (['billBy', 'billTo'].includes(k) && typeof body[k] === 'object') doc[k] = body[k];
      else if (k === 'serviceItems' && Array.isArray(body[k])) doc[k] = body[k];
      else if (['subtotal', 'discount', 'vat', 'serviceCharges', 'totalAmount', 'payableAmount', 'hourlyRate', 'totalPrice'].includes(k)) doc[k] = parseFloat(body[k]) || 0;
      else if (['numCleaners', 'hoursPerVisit', 'visitsPerWeek'].includes(k)) doc[k] = parseInt(body[k], 10) || 0;
      else if (typeof body[k] === 'string') doc[k] = body[k];
    }
    await doc.save();
    res.json(normalizeQuotationDoc(doc.toObject()));
  } catch (err) {
    console.error('Error updating quotation:', err);
    res.status(500).json({ error: 'Failed to update quotation', message: err.message });
  }
});

router.delete('/quotations/:id', async (req, res) => {
  try {
    const doc = await Quotation.findOneAndDelete({ id: req.params.id });
    if (!doc) return res.status(404).json({ error: 'Not found', message: 'Quotation not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting quotation:', err);
    res.status(500).json({ error: 'Failed to delete quotation', message: err.message });
  }
});

export default router;
