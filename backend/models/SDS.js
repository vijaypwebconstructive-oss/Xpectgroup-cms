import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const SDSSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `sds-${randomUUID().slice(0, 8)}`,
  },
  chemicalId: { type: String, required: true },
  chemicalName: { type: String, required: true },
  issueDate: { type: String, required: true },
  reviewDate: { type: String, required: true },
  status: {
    type: String,
    enum: ['valid', 'expired', 'review_soon'],
    default: 'valid',
  },
  manufacturer: { type: String, required: true },
  fileName: { type: String },
  fileSize: { type: String },
  revision: { type: String, default: '' },
  hazardClassification: { type: String },
  ghsSignalWord: { type: String },
  casNumber: { type: String },
  emergencyContact: { type: String },
  storageRequirements: { type: String },
  language: { type: String },
  documentData: { type: String }, // base64 for uploaded SDS PDF
}, {
  timestamps: true,
});

const SDS = mongoose.model('SDS', SDSSchema);
export default SDS;
