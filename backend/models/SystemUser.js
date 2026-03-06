import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const SystemUserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `usr-${randomUUID().slice(0, 8)}`,
  },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['Admin', 'Supervisor', 'CMS Operator'], required: true },
  status: { type: String, enum: ['active', 'disabled', 'pending'], default: 'active' },
  lastLogin: { type: String, default: '' },
  passwordHash: { type: String },
}, { timestamps: true });

const SystemUser = mongoose.model('SystemUser', SystemUserSchema);
export default SystemUser;
