import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },

    name: { type: String, required: true },
    type: { type: String, enum: ["PDF", "IMG", "DOC"], required: true },
    uploadDate: { type: String, required: true },
    status: {
      type: String,
      enum: ["Verified", "Pending", "Rejected"],
      default: "Pending",
      required: true,
    },
    fileUrl: { type: String },
    fileName: { type: String },
    // Set when the employee re-uploads this document after it was rejected
    reuploadedAt: { type: Date },
    // Files this document replaced (kept for audit; files live on disk)
    previousVersions: [
      {
        _id: false,
        fileUrl: { type: String },
        fileName: { type: String },
        uploadDate: { type: String },
        status: { type: String },
        replacedAt: { type: Date },
      },
    ],
  },
  { _id: false },
);

const DeclarationsSchema = new mongoose.Schema(
  {
    accuracy: { type: Boolean, default: false },
    rtw: { type: Boolean, default: false },
    approval: { type: Boolean, default: false },
    gdpr: { type: Boolean, default: false },
  },
  { _id: false },
);

const ContractSchema = new mongoose.Schema(
  {
    read: {
      type: Boolean,
      default: false,
    },
    accepted: {
      type: Boolean,
      default: false,
    },
    acceptedAt: {
      type: Date,
    },
    signedAt: {
      type: Date,
    },
    version: {
      type: String,
      default: "1.0",
    },
    pdfUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
  },
  { _id: false },
);

const CleanerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    applicationRef: {
      type: String,
      unique: true,
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    dob: { type: String, required: true },
    address: { type: String, required: true },
    gender: { type: String, default: "Not specified" },
    startDate: { type: String, required: true },
    employmentType: {
      type: String,
      enum: ["Contractor", "Permanent", "Temporary", "Sub-contractor"],
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ["Verified", "Pending", "Docs Required", "Rejected"],
      default: "Pending",
      required: true,
    },
    avatar: { type: String },
    dbsStatus: {
      type: String,
      enum: ["Cleared", "Awaiting Docs", "Not Started", "Expired"],
      default: "Not Started",
      required: true,
    },
    // Applicant without a DBS certificate agreed a DBS check may be required
    dbsCheckConsent: { type: Boolean },
    location: { type: String, default: "TBD" },
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
    workPreference: { type: String, enum: ["Full-Time", "Part-Time"] },
    declarations: { type: DeclarationsSchema, required: true },

    contract: {
      type: ContractSchema,
    },

    documents: [DocumentSchema],

    accountDetails: {
      username: {
        type: String,
      },
      password: {
        type: String,
      },
      confirmPassword: {
        type: String,
      },
    },
    // Employment Allocation Details
    hourlyPayRate: { type: Number },
    monthlySalary: { type: Number },
    payType: { type: String, enum: ["Hourly", "Weekly", "Monthly"] },
    shiftType: { type: String, enum: ["Morning", "Evening", "Night", "Any"] },
    contractStatus: { type: String, enum: ["Active", "Paused", "Ended"] },
    endDate: { type: String },
    preferredShiftPattern: { type: String },
    auditorNotes: { type: String, default: "" },

    // National Insurance number, stored as "QQ123456C"
    niNumber: {
      type: String,
      uppercase: true,
      trim: true,
      match: /^[A-Z]{2}\d{6}[A-D]$/,
    },
    // True when the employee said they don't have an NI number yet
    noNiNumber: { type: Boolean, default: false },

    // UK bank details for salary payments (collected during onboarding)
    bankDetails: {
      accountHolderName: { type: String, trim: true },
      bankName: { type: String, trim: true },
      sortCode: { type: String, match: /^\d{2}-\d{2}-\d{2}$/ },
      accountNumber: { type: String, match: /^\d{8}$/ },
      rollNumber: { type: String, trim: true },
    },

    // Set when the employee re-submits documents after "Docs Required"
    resubmittedAt: { type: Date },
    resubmissionCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
// email and id indexes are already created by unique:true on the field definition
CleanerSchema.index({ verificationStatus: 1 });

const Cleaner = mongoose.model("Cleaner", CleanerSchema);

export default Cleaner;
