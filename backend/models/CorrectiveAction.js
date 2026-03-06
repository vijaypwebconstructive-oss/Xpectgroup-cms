import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const CorrectiveActionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `CA-${randomUUID().slice(0, 8)}`,
  },
  incidentId: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: String, required: true },
  dueDate: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Completed'], default: 'Open' },
  completedDate: { type: String, default: '' },
}, { timestamps: true });

const CorrectiveAction = mongoose.model('CorrectiveAction', CorrectiveActionSchema);
export default CorrectiveAction;
