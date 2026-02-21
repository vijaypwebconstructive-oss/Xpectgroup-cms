// ── Document Control Module — Type Definitions ────────────────────────────────

export type DocCategory =
  | 'Health & Safety'
  | 'Environmental'
  | 'Quality'
  | 'Work Instructions'
  | 'Forms'
  | 'Insurance';

export type DocStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'expired';

export type ReviewFrequency = 6 | 12 | 24;

export type ApprovalStatus = 'approved' | 'pending' | 'rejected' | 'not_required';

export interface DocumentVersion {
  version: string;        // e.g. "1.0", "1.1", "2.0"
  date: string;           // ISO date
  uploadedBy: string;
  notes: string;
  approvalStatus: ApprovalStatus;
}

export interface PolicyDocument {
  id: string;
  title: string;
  category: DocCategory;
  owner: string;
  department: string;
  version: string;
  status: DocStatus;
  effectiveDate: string;        // ISO date
  lastReviewDate: string;       // ISO date
  nextReviewDate: string;       // ISO date
  reviewFrequencyMonths: ReviewFrequency;
  description: string;
  fileName?: string;
  fileSize?: string;
  submittedBy?: string;
  submittedDate?: string;       // ISO date — for pending approval
  versionHistory: DocumentVersion[];
}
