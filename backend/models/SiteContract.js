import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const PaymentDocumentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['Invoice', 'Payment Receipt', 'Contract', 'Bank Confirmation'] },
  fileName: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  uploadDate: { type: String, default: '' },
}, { _id: false });

const SiteContractSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `sc-${randomUUID().slice(0, 8)}`,
  },
  siteId: { type: String, required: true },
  clientId: { type: String, required: true },
  siteName: { type: String, required: true },
  clientName: { type: String, required: true },
  contractValue: { type: Number, required: true },
  billingPeriod: { type: String, enum: ['Monthly', 'Quarterly', 'Yearly'], default: 'Monthly' },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
  lastBillingDate: { type: String, default: null },
  paymentDate: { type: String, default: null },
  paymentDocuments: { type: [PaymentDocumentSchema], default: [] },
}, {
  timestamps: true,
});

const SiteContract = mongoose.model('SiteContract', SiteContractSchema);
export default SiteContract;
