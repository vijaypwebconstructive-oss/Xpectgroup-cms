import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const DocumentVersionSchema = new mongoose.Schema({
  version: String,
  date: String,
  uploadedBy: String,
  notes: String,
  approvalStatus: { type: String, enum: ['approved', 'pending', 'rejected', 'not_required'] },
}, { _id: false });

const PolicyDocumentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `doc-${randomUUID().slice(0, 8)}`,
  },
  title: { type: String, required: true },
  category: { type: String, required: true },
  owner: { type: String, required: true },
  department: { type: String, default: '' },
  version: { type: String, default: '1.0' },
  status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected', 'expired'], default: 'draft' },
  effectiveDate: { type: String, required: true },
  lastReviewDate: { type: String, default: '' },
  nextReviewDate: { type: String, default: '' },
  reviewFrequencyMonths: { type: Number, default: 12 },
  description: { type: String, default: '' },
  fileName: { type: String, default: '' },
  fileSize: { type: String, default: '' },
  fileData: { type: String },
  submittedBy: { type: String, default: '' },
  submittedDate: { type: String, default: '' },
  versionHistory: { type: [DocumentVersionSchema], default: [] },
}, { timestamps: true });

const PolicyDocument = mongoose.model('PolicyDocument', PolicyDocumentSchema);
export default PolicyDocument;
