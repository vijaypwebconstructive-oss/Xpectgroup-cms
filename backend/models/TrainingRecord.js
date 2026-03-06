import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const TrainingRecordSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `tr-${randomUUID().slice(0, 8)}`,
  },
  cleanerId: { type: String, default: '' },
  name: { type: String, required: true },
  location: { type: String, default: '' },
  initials: { type: String, default: '' },
  avatarColor: { type: String, default: 'bg-blue-500' },
  avatar: { type: String, default: '' },
  course: { type: String, required: true },
  courseIcon: { type: String, default: 'school' },
  certName: { type: String, default: '' },
  trainingStartDate: { type: String, required: true },
  trainingEndDate: { type: String, required: true },
  expiryDate: { type: String, required: true },
  status: { type: String, enum: ['Trained', 'Not Trained'], default: 'Not Trained' },
  certDocument: { type: String, default: '' },
  certDocumentData: { type: String },
}, { timestamps: true });

const TrainingRecord = mongoose.model('TrainingRecord', TrainingRecordSchema);
export default TrainingRecord;
