import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const RAMSSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `rams-${randomUUID().slice(0, 8)}`,
  },
  siteName: { type: String, required: true },
  clientName: { type: String, required: true },
  description: { type: String, required: true },
  workingHours: { type: String, required: true },
  status: {
    type: String,
    enum: ['approved', 'draft', 'review_required'],
    default: 'draft',
  },
  lastUpdated: { type: String, required: true },
  supervisor: { type: String, required: true },
  workMethod: { type: [String], default: [] },
  emergencyProcedures: { type: [String], default: [] },
  linkedRiskAssessmentIds: { type: [String], default: [] },
  signedCopyAvailable: { type: Boolean, default: false },
  signedDocumentFileName: { type: String },
  documentAvailable: { type: Boolean, default: false },
  documentData: { type: String }, // base64 data URL for uploaded PDF
}, {
  timestamps: true,
});

const RAMS = mongoose.model('RAMS', RAMSSchema);
export default RAMS;
