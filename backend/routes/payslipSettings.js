import express from 'express';
import PayslipSettings from '../models/PayslipSettings.js';

const router = express.Router();

const DEFAULT_SETTINGS = {
  id: 'default',
  payType: 'Hourly',
  company: {
    companyName: 'Xpect Group',
    companyAddress: 'Address Line 1, City, Postcode',
    payeReference: '123/AB45678',
    payPeriod: 'January 2026',
    payDate: '31 Jan 2026',
    payslipNumber: 'PS-2026-001',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  },
  earningsRows: [
    { description: 'Basic Pay', hours: '160', rate: '10.00', amount: '1600.00' },
    { description: 'Overtime Pay', hours: '0', rate: '15.00', amount: '0.00' },
    { description: 'Holiday Pay', hours: '0', rate: '10.00', amount: '0.00' },
    { description: 'Bonus', hours: '0', rate: '0.00', amount: '0.00' },
    { description: 'Allowance', hours: '0', rate: '0.00', amount: '0.00' },
  ],
  deductionsRows: [
    { description: 'PAYE Tax', amount: '150.00' },
    { description: 'National Insurance', amount: '85.00' },
    { description: 'Pension Contribution', amount: '75.00' },
    { description: 'Student Loan', amount: '0.00' },
    { description: 'Other Deductions', amount: '0.00' },
  ],
  leaveRows: [
    { leaveType: 'Annual Leave', entitled: '28', used: '5', balance: '23' },
    { leaveType: 'Sick Leave', entitled: '10', used: '0', balance: '10' },
  ],
  ytdSummary: {
    grossPayYTD: '19200.00',
    taxPaidYTD: '1800.00',
    niPaidYTD: '1020.00',
    pensionYTD: '900.00',
  },
  notes: '',
};

router.get('/', async (req, res) => {
  try {
    let doc = await PayslipSettings.findOne({ id: 'default' }).lean();
    if (!doc) {
      doc = await PayslipSettings.create(DEFAULT_SETTINGS);
      doc = doc.toObject();
    }
    res.json(doc);
  } catch (err) {
    console.error('Error fetching payslip settings:', err);
    res.status(500).json({ error: 'Failed to fetch payslip settings', message: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const body = req.body;
    const updates = {
      payType: body.payType || 'Hourly',
      company: body.company ?? {},
      earningsRows: Array.isArray(body.earningsRows) ? body.earningsRows : [],
      deductionsRows: Array.isArray(body.deductionsRows) ? body.deductionsRows : [],
      leaveRows: Array.isArray(body.leaveRows) ? body.leaveRows : [],
      ytdSummary: body.ytdSummary ?? {},
      notes: body.notes ?? '',
    };
    const doc = await PayslipSettings.findOneAndUpdate(
      { id: 'default' },
      { $set: updates },
      { new: true, upsert: true }
    ).lean();
    res.json(doc);
  } catch (err) {
    console.error('Error updating payslip settings:', err);
    res.status(500).json({ error: 'Failed to update payslip settings', message: err.message });
  }
});

export default router;
