
export enum VerificationStatus {
    VERIFIED = 'Verified',
    PENDING = 'Pending',
    DOCS_REQUIRED = 'Docs Required',
    REJECTED = 'Rejected'
  }
  
  export enum EmploymentType {
    CONTRACTOR = 'Contractor',
    PERMANENT = 'Permanent',
    TEMPORARY = 'Temporary',
    SUB_CONTRACTOR = 'Sub-contractor'
  }
  
  export enum DBSStatus {
    CLEARED = 'Cleared',
    AWAITING_DOCS = 'Awaiting Docs',
    NOT_STARTED = 'Not Started',
    EXPIRED = 'Expired'
  }
  
  export enum DocumentStatus {
    VERIFIED = 'Verified',
    PENDING = 'Pending',
    REJECTED = 'Rejected'
  }
  
  export interface Document {
    id: string;
    name: string;
    type: 'PDF' | 'IMG' | 'DOC';
    uploadDate: string;
    status: DocumentStatus;
    fileUrl?: string; // Base64 or URL
    fileName?: string;
  }
  
  export interface Cleaner {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    dob: string;
    address: string;
    gender: string;
    startDate: string;
    employmentType: EmploymentType;
    verificationStatus: VerificationStatus;
    avatar?: string;
    dbsStatus: DBSStatus;
    location: string;
    onboardingProgress: number;
    
    // New Onboarding Fields
    citizenshipStatus: string;
    visaType?: string;
    visaOther?: string;
    shareCode?: string;
    uniName?: string;
    courseName?: string;
    termStart?: string;
    termEnd?: string;
    workPreference?: 'Full-Time' | 'Part-Time';
    declarations: {
      accuracy: boolean;
      rtw: boolean;
      approval: boolean;
      gdpr: boolean;
    };
    documents?: Document[];
    
    // Employment Allocation Details
    hourlyPayRate?: number;
    payType?: 'Hourly' | 'Weekly' | 'Monthly';
    shiftType?: 'Morning' | 'Evening' | 'Night' | 'Any';
    contractStatus?: 'Active' | 'Paused' | 'Ended';
    endDate?: string;
    preferredShiftPattern?: string;
  }
  
  export enum InvitationStatus {
    SENT = 'SENT',
    VERIFIED = 'VERIFIED',
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    EXPIRED = 'EXPIRED'
  }

  export interface StaffInvitation {
    id: string;
    employeeName: string;
    email: string;
    inviteToken: string;
    status: InvitationStatus;
    onboardingProgress: number; // 0-100
    createdAt: string;
    verifiedAt?: string;
  }

  export interface ActivityLog {
    _id: string;
    actorId: string;
    actorRole: 'admin' | 'employee' | 'system';
    actorName: string;
    actionType: string;
    entityType: 'Cleaner' | 'Document' | 'Invitation' | 'System';
    entityId: string;
    message: string;
    metadata?: any;
    createdAt: string;
    updatedAt?: string;
  }
  
  export type AppView = 'DASHBOARD' | 'CLEANERS_LIST' | 'CLEANER_DETAIL' | 'ONBOARDING' | 'ONBOARDING_AUTH' | 'REPORT' | 'THANK_YOU' | 'STAFF_INVITES' | 'EMPLOYEE_COMPLIANCE' | 'TRAINING_CERTIFICATION' | 'TRAINING_DETAIL' | 'PPE_LIST' | 'CLIENTS_SITES' | 'DOCUMENT_CONTROL' | 'RISK_COSHH' | 'INCIDENTS' | 'USER_ACCESS';

  // ── PPE Module ──────────────────────────────────────────────
  export type PPEItemType =
    | 'Safety Gloves'
    | 'Safety Shoes'
    | 'High-Visibility Vest'
    | 'Face Mask / Respirator'
    | 'Eye Protection'
    | 'Apron / Protective Clothing';

  export type PPECondition = 'New' | 'Good' | 'Used';
  export type PPEStatus = 'Valid' | 'Due Soon' | 'Overdue';
  export type PPEAcknowledgementStatus = 'Acknowledged' | 'Pending';
  export type PPEStockStatus = 'Normal' | 'Low Stock' | 'Out of Stock';

  export interface PPEIssueRecord {
    id: string;
    workerName: string;
    workerLocation: string;
    workerInitials: string;
    workerAvatarColor: string;
    ppeType: PPEItemType;
    size: string;
    issueDate: string;
    conditionAtIssue: PPECondition;
    replacementPeriodMonths: 3 | 6 | 12;
    nextReplacementDue: string;
    issuedBy: string;
    notes?: string;
    acknowledgement: {
      status: PPEAcknowledgementStatus;
      acknowledgedAt?: string;
    };
    status: PPEStatus;
    replacementHistory: Array<{
      date: string;
      reason: string;
      issuedBy: string;
      ppeType: PPEItemType;
    }>;
  }

  export interface PPEInventoryRecord {
    id: string;
    ppeType: PPEItemType;
    availableQuantity: number;
    minimumStockLevel: number;
    lastRestocked: string;
    stockStatus: PPEStockStatus;
    unit: string;
  }

  // ── PPE Invoice Module (invoices to clients) ─────────────────
  export type PPEInvoiceEmailStatus = 'PENDING' | 'SENT';

  export interface PPEInvoiceRecord {
    id: string;
    clientId: string;
    clientName: string;
    issueDate: string;
    invoiceFile: string;
    invoiceFileData?: string;
    emailStatus: PPEInvoiceEmailStatus;
    createdAt: string;
  }
