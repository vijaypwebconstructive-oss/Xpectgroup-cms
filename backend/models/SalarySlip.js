import mongoose from 'mongoose';
import { randomUUID } from 'crypto';


const salarySlipSchema = new mongoose.Schema({

  payrollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PayrollRecord",
    required: true
  },

  type: {
    type: String,
    enum: ["generated", "uploaded"],
    default: "uploaded"
  },

  // 🔥 For uploaded slips
  fileUrl: {
    type: String
  },

  // 🔥 For generated slips (make optional)
  cleanerId: { type: String, required: false },
  workerName: { type: String, required: false },
  month: { type: Number, required: false },
  year: { type: Number, required: false },
  salaryAmount: { type: Number, required: false },
  payPeriod: { type: String, required: false },
  slipNumber: { type: String, unique: true, sparse: true },
  pdfPath: { type: String, required: false },

}, { timestamps: true });


const SalarySlip = mongoose.model('SalarySlip', salarySlipSchema);
export default SalarySlip;
