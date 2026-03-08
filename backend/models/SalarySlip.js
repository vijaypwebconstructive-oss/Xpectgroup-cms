import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const SalarySlipSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `ss-${randomUUID().slice(0, 8)}`,
  },
  payrollId: { type: String, required: true, index: true },
  cleanerId: { type: String, required: true, index: true },
  workerName: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  payPeriod: { type: String, required: true }, // e.g. "Jan 2026"
  salaryAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Paid'], default: 'Paid' },
  slipNumber: { type: String, required: true, unique: true },
  pdfPath: { type: String, required: true },
}, {
  timestamps: true,
});

const SalarySlip = mongoose.model('SalarySlip', SalarySlipSchema);
export default SalarySlip;
