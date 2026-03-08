import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const ProspectSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `prs-${randomUUID().slice(0, 8)}`,
  },
  clientName: { type: String, required: true, default: '' },
  company: { type: String, default: '' },
  industryType: { type: String, default: '' },
  email: { type: String, default: '' },
  contactNumber: { type: String, default: '' },
  address: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Quotation Sent', 'Converted', 'Lost'],
    default: 'New',
    index: true,
  },
}, {
  timestamps: true,
});

ProspectSchema.index({ status: 1 });
ProspectSchema.index({ createdAt: -1 });

const Prospect = mongoose.model('Prospect', ProspectSchema);
export default Prospect;
