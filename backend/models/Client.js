import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const ClientDocumentSchema = new mongoose.Schema({
  key: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: Number, default: 0 },
  type: { type: String, default: '' },
  uploadedAt: { type: String, default: '' },
  dataUrl: { type: String, default: '' },
}, { _id: false });

const ClientSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `cli-${randomUUID().slice(0, 8)}`,
  },
  name: { type: String, required: true },
  industry: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  contractStart: { type: String, required: true },
  contractEnd: { type: String, required: true },
  insuranceExpiry: { type: String, required: true },
  address: { type: String, default: '' },
  notes: { type: String, default: '' },
  documents: { type: [ClientDocumentSchema], default: [] },
}, {
  timestamps: true,
});

const Client = mongoose.model('Client', ClientSchema);
export default Client;
