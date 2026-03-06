import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const HazardSchema = new mongoose.Schema({
  hazard: { type: String, required: true },
  harm: { type: String, required: true },
  control: { type: String, required: true },
  residualRisk: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
}, { _id: false });

const ComplianceRequirementSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  checked: { type: Boolean, default: false },
}, { _id: false });

const RiskAssessmentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `ra-${randomUUID().slice(0, 8)}`,
  },
  title: { type: String, required: true },
  taskType: { type: String, default: 'General' },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  createdBy: { type: String, default: '—' },
  lastReviewDate: { type: String, required: true },
  nextReviewDate: { type: String, required: true },
  approvalStatus: { type: String, enum: ['approved', 'pending', 'not_approved'], default: 'approved' },
  approvedBy: { type: String },
  approvalDate: { type: String },
  taskDescription: { type: String, default: '—' },
  equipmentUsed: { type: [String], default: [] },
  workArea: { type: String, default: '—' },
  hazards: { type: [HazardSchema], default: [] },
  requiredPPE: { type: [String], default: [] },
  complianceRequirements: { type: [ComplianceRequirementSchema], default: [] },
  siteId: { type: String },
  sector: { type: String },
}, {
  timestamps: true,
});

const RiskAssessment = mongoose.model('RiskAssessment', RiskAssessmentSchema);
export default RiskAssessment;
