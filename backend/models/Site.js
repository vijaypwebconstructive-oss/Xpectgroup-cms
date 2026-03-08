import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const SiteSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `site-${randomUUID().slice(0, 8)}`,
  },
  clientId: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, default: '' },
  postcode: { type: String, default: '' },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  requiredTrainings: { type: [String], default: [] },
  emergencyContact: { type: String, default: '' },
  emergencyPhone: { type: String, default: '' },
  accessInstructions: { type: String, default: '' },
  activeWorkers: { type: Number, default: 0 },
  complianceDocuments: {
    type: [{
      key: { type: String, required: true },
      name: { type: String, default: '' },
      dataUrl: { type: String, default: '' },
    }],
    default: [],
  },
}, {
  timestamps: true,
});

const Site = mongoose.model('Site', SiteSchema);
export default Site;
