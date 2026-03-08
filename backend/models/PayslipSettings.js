import mongoose from 'mongoose';

const EarningsRowSchema = new mongoose.Schema({
  description: { type: String, default: '' },
  hours: { type: String, default: '0' },
  rate: { type: String, default: '0.00' },
  amount: { type: String, default: '0.00' },
}, { _id: false });

const DeductionsRowSchema = new mongoose.Schema({
  description: { type: String, default: '' },
  amount: { type: String, default: '0.00' },
}, { _id: false });

const LeaveRowSchema = new mongoose.Schema({
  leaveType: { type: String, default: '' },
  entitled: { type: String, default: '' },
  used: { type: String, default: '' },
  balance: { type: String, default: '' },
}, { _id: false });

const CompanySchema = new mongoose.Schema({
  companyLogoBase64: { type: String, default: '' },
  companyName: { type: String, default: '' },
  companyAddress: { type: String, default: '' },
  payeReference: { type: String, default: '' },
  payPeriod: { type: String, default: '' },
  payDate: { type: String, default: '' },
  payslipNumber: { type: String, default: '' },
  month: { type: Number, default: 1 },
  year: { type: Number, default: new Date().getFullYear() },
}, { _id: false });

const YTDSummarySchema = new mongoose.Schema({
  grossPayYTD: { type: String, default: '' },
  taxPaidYTD: { type: String, default: '' },
  niPaidYTD: { type: String, default: '' },
  pensionYTD: { type: String, default: '' },
}, { _id: false });

const PayslipSettingsSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, default: 'default' },
  payType: { type: String, enum: ['Hourly', 'Monthly'], default: 'Hourly' },
  company: { type: CompanySchema, default: () => ({}) },
  earningsRows: { type: [EarningsRowSchema], default: [] },
  deductionsRows: { type: [DeductionsRowSchema], default: [] },
  leaveRows: { type: [LeaveRowSchema], default: [] },
  ytdSummary: { type: YTDSummarySchema, default: () => ({}) },
  notes: { type: String, default: '' },
}, { timestamps: true });

const PayslipSettings = mongoose.model('PayslipSettings', PayslipSettingsSchema);
export default PayslipSettings;
