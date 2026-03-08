import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const PayrollRecordSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `pr-${randomUUID().slice(0, 8)}`,
  },
  workerId: { type: String, required: true },
  workerName: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  payType: { type: String, enum: ['Hourly', 'Monthly'], default: 'Hourly' },
  hoursWorked: { type: Number, default: 0 },
  hourlyRate: { type: Number, default: 0 },
  monthlySalary: { type: Number, default: null },
  totalSalary: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  paymentDate: { type: String, default: null },
  siteId: { type: String, default: '' },
  siteName: { type: String, default: '' },
  role: { type: String, default: 'Cleaner' },
  salarySlipSentAt: { type: Date, default: null },
}, {
  timestamps: true,
});

const PayrollRecord = mongoose.model('PayrollRecord', PayrollRecordSchema);
export default PayrollRecord;
