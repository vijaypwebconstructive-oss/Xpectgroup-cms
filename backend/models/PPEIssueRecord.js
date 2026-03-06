import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const ReplacementHistorySchema = new mongoose.Schema({
  date: String,
  reason: String,
  issuedBy: String,
  ppeType: String,
}, { _id: false });

const PPEIssueRecordSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `ppe-${randomUUID().slice(0, 8)}`,
  },
  workerId: { type: String, default: '' },
  workerName: { type: String, required: true },
  workerLocation: { type: String, default: '' },
  workerInitials: { type: String, default: '' },
  workerAvatarColor: { type: String, default: 'bg-blue-500' },
  ppeType: { type: String, required: true },
  size: { type: String, default: '' },
  issueDate: { type: String, required: true },
  conditionAtIssue: { type: String, default: 'New' },
  replacementPeriodMonths: { type: Number, default: 6 },
  nextReplacementDue: { type: String, required: true },
  issuedBy: { type: String, default: '' },
  notes: { type: String, default: '' },
  acknowledgement: {
    status: { type: String, enum: ['Acknowledged', 'Pending'], default: 'Pending' },
    acknowledgedAt: { type: String, default: '' },
  },
  status: { type: String, enum: ['Valid', 'Due Soon', 'Overdue'], default: 'Valid' },
  replacementHistory: { type: [ReplacementHistorySchema], default: [] },
}, { timestamps: true });

const PPEIssueRecord = mongoose.model('PPEIssueRecord', PPEIssueRecordSchema);
export default PPEIssueRecord;
