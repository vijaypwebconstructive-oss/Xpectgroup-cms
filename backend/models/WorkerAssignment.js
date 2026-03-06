import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const WorkerAssignmentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `wa-${randomUUID().slice(0, 8)}`,
  },
  workerId: { type: String, required: true },
  workerName: { type: String, required: true },
  workerInitials: { type: String, default: '' },
  workerAvatarColor: { type: String, default: 'bg-blue-500' },
  siteId: { type: String, required: true },
  siteName: { type: String, required: true },
  clientId: { type: String, required: true },
  completedTrainings: { type: [String], default: [] },
  complianceStatus: { type: String, enum: ['Compliant', 'Expiring', 'Non-Compliant'], default: 'Compliant' },
  assignedSince: { type: String, required: true },
  role: { type: String, default: 'Cleaner' },
}, {
  timestamps: true,
});

const WorkerAssignment = mongoose.model('WorkerAssignment', WorkerAssignmentSchema);
export default WorkerAssignment;
