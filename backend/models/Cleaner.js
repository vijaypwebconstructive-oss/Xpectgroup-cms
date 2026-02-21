import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['PDF', 'IMG', 'DOC'], required: true },
  uploadDate: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Verified', 'Pending', 'Rejected'], 
    default: 'Pending',
    required: true 
  },
  fileUrl: { type: String },
  fileName: { type: String }
}, { _id: false });

const DeclarationsSchema = new mongoose.Schema({
  accuracy: { type: Boolean, default: false },
  rtw: { type: Boolean, default: false },
  approval: { type: Boolean, default: false },
  gdpr: { type: Boolean, default: false }
}, { _id: false });

const CleanerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  dob: { type: String, required: true },
  address: { type: String, required: true },
  gender: { type: String, default: 'Not specified' },
  startDate: { type: String, required: true },
  employmentType: { 
    type: String, 
    enum: ['Contractor', 'Permanent', 'Temporary', 'Sub-contractor'],
    required: true 
  },
  verificationStatus: { 
    type: String, 
    enum: ['Verified', 'Pending', 'Docs Required', 'Rejected'],
    default: 'Pending',
    required: true 
  },
  avatar: { type: String },
  dbsStatus: { 
    type: String, 
    enum: ['Cleared', 'Awaiting Docs', 'Not Started', 'Expired'],
    default: 'Not Started',
    required: true 
  },
  location: { type: String, default: 'TBD' },
  onboardingProgress: { type: Number, default: 0 },
  
  // Onboarding Fields
  citizenshipStatus: { type: String, required: true },
  visaType: { type: String },
  visaOther: { type: String },
  shareCode: { type: String },
  uniName: { type: String },
  courseName: { type: String },
  termStart: { type: String },
  termEnd: { type: String },
  workPreference: { type: String, enum: ['Full-Time', 'Part-Time'] },
  declarations: { type: DeclarationsSchema, required: true },
  documents: [DocumentSchema],
  
  // Employment Allocation Details
  hourlyPayRate: { type: Number },
  payType: { type: String, enum: ['Hourly', 'Weekly', 'Monthly'] },
  shiftType: { type: String, enum: ['Morning', 'Evening', 'Night', 'Any'] },
  contractStatus: { type: String, enum: ['Active', 'Paused', 'Ended'] },
  endDate: { type: String },
  preferredShiftPattern: { type: String }
}, {
  timestamps: true
});

// Indexes for better query performance
CleanerSchema.index({ email: 1 });
CleanerSchema.index({ id: 1 });
CleanerSchema.index({ verificationStatus: 1 });

const Cleaner = mongoose.model('Cleaner', CleanerSchema);

export default Cleaner;
