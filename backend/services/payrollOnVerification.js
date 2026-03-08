import PayrollRecord from '../models/PayrollRecord.js';
import Cleaner from '../models/Cleaner.js';
import WorkerAssignment from '../models/WorkerAssignment.js';
import { createAndSendSalarySlip } from './salarySlipService.js';

const DEFAULT_HOURS_PER_MONTH = 160;
const WEEKS_PER_MONTH = 4.33;

/**
 * Create a payroll record for a cleaner when they are marked as Verified.
 * Skips if payroll already exists for this worker + current month + year.
 * @param {string} cleanerId - Cleaner id
 * @returns {Promise<string|null>} Created payroll id or null if skipped/failed
 */
export async function createPayrollForVerifiedCleaner(cleanerId) {
  try {
    const cleaner = await Cleaner.findOne({ id: cleanerId }).lean();
    if (!cleaner || cleaner.verificationStatus !== 'Verified') {
      return null;
    }

    const now = new Date();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();

    const existing = await PayrollRecord.findOne({ workerId: cleanerId, month: m, year: y });
    if (existing) {
      return null;
    }

    const assignment = await WorkerAssignment.findOne({ workerId: cleanerId }).lean();
    const siteId = assignment?.siteId ?? '';
    const siteName = assignment?.siteName ?? '';
    const role = assignment?.role ?? 'Cleaner';

    const staffPayType = cleaner.payType || 'Hourly';
    const isMonthly = staffPayType === 'Monthly';

    let payType = 'Hourly';
    let hoursWorked = 0;
    let hourlyRate = 0;
    let monthlySalary = null;
    let totalSalary = 0;

    if (isMonthly) {
      payType = 'Monthly';
      monthlySalary = cleaner.monthlySalary ?? 0;
      totalSalary = Math.round((monthlySalary || 0) * 100) / 100;
    } else {
      hourlyRate = cleaner.hourlyPayRate ?? 12;
      hoursWorked = DEFAULT_HOURS_PER_MONTH;
      if (assignment?.hoursPerWeek != null && assignment.hoursPerWeek > 0) {
        hoursWorked = Math.round(assignment.hoursPerWeek * WEEKS_PER_MONTH * 10) / 10;
      }
      totalSalary = Math.round(hoursWorked * hourlyRate * 100) / 100;
    }

    const createAsPaid = process.env.AUTO_PAYROLL_CREATE_AS_PAID === 'true';
    const paymentStatus = createAsPaid ? 'Paid' : 'Pending';
    const paymentDate = createAsPaid ? now.toISOString().split('T')[0] : null;

    const doc = await PayrollRecord.create({
      workerId: cleanerId,
      workerName: cleaner.name,
      month: m,
      year: y,
      payType,
      hoursWorked,
      hourlyRate,
      monthlySalary,
      totalSalary,
      paymentStatus,
      paymentDate,
      siteId,
      siteName,
      role,
    });

    if (createAsPaid) {
      try {
        await createAndSendSalarySlip(doc);
      } catch (slipErr) {
        console.warn('Salary slip creation/email failed for auto payroll:', slipErr.message);
      }
    }

    return doc.id;
  } catch (err) {
    console.error('createPayrollForVerifiedCleaner failed:', err.message);
    return null;
  }
}

/**
 * Create payroll records for multiple cleaners when they are marked as Verified.
 * @param {string[]} cleanerIds - Array of cleaner ids
 * @returns {Promise<{ created: string[] }>}
 */
export async function createPayrollForVerifiedCleaners(cleanerIds) {
  const created = [];
  for (const id of cleanerIds) {
    const payrollId = await createPayrollForVerifiedCleaner(id);
    if (payrollId) {
      created.push(payrollId);
    }
  }
  return { created };
}
