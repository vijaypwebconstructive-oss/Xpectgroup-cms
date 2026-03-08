import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const IncidentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `INC-${randomUUID().slice(0, 6).toUpperCase()}`,
  },
  date: { type: String, required: true },
  site: { type: String, required: true },
  worker: { type: String, required: true },
  type: { type: String, required: true },
  severity: { type: String, required: true },
  status: { type: String, default: 'Open' },
  investigator: { type: String, default: '' },
  description: { type: String, required: true },
  injuryOccurred: { type: Boolean, default: false },
  injuryDescription: { type: String, default: '' },
  medicalTreatmentRequired: { type: Boolean, default: false },
  propertyDamage: { type: String, default: '' },
  immediateActionTaken: { type: String, default: '' },
  supervisorNotified: { type: Boolean, default: false },
  investigationNotes: { type: String, default: '' },
  rootCause: { type: String, default: '' },
  witnessNotes: { type: String, default: '' },
  hasPhotos: { type: Boolean, default: false },
  photoEvidenceName: { type: String, default: '' },
  photoEvidenceData: { type: String, default: '' },
  closedDate: { type: String, default: '' },
  closedBy: { type: String, default: '' },
}, { timestamps: true });

const Incident = mongoose.model('Incident', IncidentSchema);
export default Incident;
