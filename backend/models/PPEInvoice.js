import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const PPEInvoiceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `ppe-inv-${randomUUID().slice(0, 8)}`,
  },
  clientId: { type: String, required: true },
  clientName: { type: String, required: true },
  issueDate: { type: String, required: true },
  invoiceFile: { type: String, default: '' },
  invoiceFileData: { type: String }, // base64 data URL
  emailStatus: {
    type: String,
    enum: ['PENDING', 'SENT'],
    default: 'PENDING',
    required: true,
  },
}, {
  timestamps: true,
});

const PPEInvoice = mongoose.model('PPEInvoice', PPEInvoiceSchema);
export default PPEInvoice;
