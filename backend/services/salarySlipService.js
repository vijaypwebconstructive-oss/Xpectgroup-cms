import { randomUUID } from 'crypto';
import PayrollRecord from '../models/PayrollRecord.js';
import SalarySlip from '../models/SalarySlip.js';
import Cleaner from '../models/Cleaner.js';
import { sendSalarySlipWithPdf } from './emailService.js';
import { generateSalarySlipPdf, saveSalarySlipPdf } from './salarySlipPdf.js';

const MONTHS_SHORT = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Create and send salary slip for a payroll record (used when status → Paid)
 * @param {object} payrollDoc - Mongoose PayrollRecord document or plain object
 * @returns {Promise<void>}
 */
export async function createAndSendSalarySlip(payrollDoc) {
  const existingSlip = await SalarySlip.findOne({ payrollId: payrollDoc.id });
  if (existingSlip) return;

  const slipId = `ss-${randomUUID().slice(0, 8)}`;
  const slipNumber = `SS-${payrollDoc.year}${String(payrollDoc.month).padStart(2, '0')}-${slipId.slice(-6)}`;
  const payPeriod = `${MONTHS_SHORT[payrollDoc.month] || payrollDoc.month} ${payrollDoc.year}`;
  const cleaner = await Cleaner.findOne({ id: payrollDoc.workerId }).lean();
  const workerName = (payrollDoc.workerName || cleaner?.name || 'Unknown').trim() || cleaner?.name || 'Unknown';

  const obj = payrollDoc.toObject ? payrollDoc.toObject() : payrollDoc;
  const pdfBuffer = await generateSalarySlipPdf(obj);
  const { fullPath, relativePath } = await saveSalarySlipPdf(pdfBuffer, slipId);

  await SalarySlip.create({
    id: slipId,
    payrollId: payrollDoc.id,
    cleanerId: payrollDoc.workerId,
    workerName,
    month: payrollDoc.month,
    year: payrollDoc.year,
    payPeriod,
    salaryAmount: payrollDoc.totalSalary,
    paymentStatus: 'Paid',
    slipNumber,
    pdfPath: relativePath,
  });

  const email = cleaner?.email;
  if (email) {
    await sendSalarySlipWithPdf(email, workerName, obj, fullPath, `salary-slip-${payPeriod.replace(/\s/g, '-')}.pdf`);
  }

  if (payrollDoc.save) {
    payrollDoc.salarySlipSentAt = new Date();
    await payrollDoc.save();
  }
}

/**
 * Regenerate the PDF for an existing salary slip when payroll record is updated.
 * Ensures the downloaded/sent payslip matches the current payroll data.
 * @param {object} payrollDoc - Updated PayrollRecord document or plain object
 * @returns {Promise<boolean>} true if PDF was regenerated, false if no slip exists
 */
export async function regenerateSalarySlipPdf(payrollDoc) {
  const slip = await SalarySlip.findOne({ payrollId: payrollDoc.id });
  if (!slip) return false;

  const obj = payrollDoc.toObject ? payrollDoc.toObject() : payrollDoc;
  const pdfBuffer = await generateSalarySlipPdf(obj);
  const { fullPath, relativePath } = await saveSalarySlipPdf(pdfBuffer, slip.id);

  slip.salaryAmount = payrollDoc.totalSalary;
  slip.workerName = payrollDoc.workerName || slip.workerName;
  slip.payPeriod = `${MONTHS_SHORT[payrollDoc.month] || payrollDoc.month} ${payrollDoc.year}`;
  await slip.save();

  return true;
}
