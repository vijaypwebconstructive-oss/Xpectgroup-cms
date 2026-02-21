import { PolicyDocument } from './types';

// Helper — offset ISO date from today
const daysFromNow = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// Mutable array — DocumentCreate and approval actions mutate this at runtime
export const MOCK_DOCUMENTS: PolicyDocument[] = [
  {
    id: 'doc-001',
    title: 'Health & Safety Policy',
    category: 'Health & Safety',
    owner: 'Patricia Nwachukwu',
    department: 'Operations',
    version: '3.2',
    status: 'approved',
    effectiveDate: '2024-01-01',
    lastReviewDate: '2024-01-01',
    nextReviewDate: daysFromNow(185),
    reviewFrequencyMonths: 12,
    description: 'Company-wide Health & Safety policy outlining responsibilities, procedures and risk controls in compliance with the Health and Safety at Work Act 1974.',
    fileName: 'HS-Policy-v3.2.pdf',
    fileSize: '1.4 MB',
    submittedBy: 'Richard Hammond',
    submittedDate: '2023-12-15',
    versionHistory: [
      { version: '3.2', date: '2024-01-01', uploadedBy: 'Patricia Nwachukwu', notes: 'Updated lone working procedures and PPE section.', approvalStatus: 'approved' },
      { version: '3.1', date: '2023-06-01', uploadedBy: 'Tom Briggs',          notes: 'Added COSHH appendix.',                              approvalStatus: 'approved' },
      { version: '3.0', date: '2023-01-15', uploadedBy: 'Richard Hammond',     notes: 'Major revision — new risk assessment template.',     approvalStatus: 'approved' },
    ],
  },
  {
    id: 'doc-002',
    title: 'Environmental Policy',
    category: 'Environmental',
    owner: 'Amanda Foster',
    department: 'Compliance',
    version: '2.0',
    status: 'approved',
    effectiveDate: '2024-03-01',
    lastReviewDate: '2024-03-01',
    nextReviewDate: daysFromNow(22),
    reviewFrequencyMonths: 12,
    description: 'Outlines the organisation\'s commitment to environmental sustainability, waste reduction, and compliance with ISO 14001 principles.',
    fileName: 'Environmental-Policy-v2.0.pdf',
    fileSize: '0.9 MB',
    submittedBy: 'Amanda Foster',
    submittedDate: '2024-02-20',
    versionHistory: [
      { version: '2.0', date: '2024-03-01', uploadedBy: 'Amanda Foster', notes: 'Aligned with ISO 14001:2015 requirements.', approvalStatus: 'approved' },
      { version: '1.0', date: '2023-03-01', uploadedBy: 'Amanda Foster', notes: 'Initial release.',                           approvalStatus: 'approved' },
    ],
  },
  {
    id: 'doc-003',
    title: 'Quality Management Procedure',
    category: 'Quality',
    owner: 'Richard Hammond',
    department: 'Quality Assurance',
    version: '1.1',
    status: 'pending',
    effectiveDate: '2024-06-01',
    lastReviewDate: '2024-05-15',
    nextReviewDate: daysFromNow(350),
    reviewFrequencyMonths: 12,
    description: 'Defines the quality management processes in line with ISO 9001:2015, including nonconformity control, internal audits, and management review.',
    fileName: 'QMP-v1.1-draft.pdf',
    fileSize: '2.1 MB',
    submittedBy: 'Richard Hammond',
    submittedDate: daysFromNow(-2),
    versionHistory: [
      { version: '1.1', date: '2024-05-15', uploadedBy: 'Richard Hammond', notes: 'Added clause 8.7 nonconformity procedures.', approvalStatus: 'pending'  },
      { version: '1.0', date: '2024-01-10', uploadedBy: 'Richard Hammond', notes: 'Initial draft.',                              approvalStatus: 'approved' },
    ],
  },
  {
    id: 'doc-004',
    title: 'Cleaning Work Instructions — Office Sites',
    category: 'Work Instructions',
    owner: 'Tom Briggs',
    department: 'Operations',
    version: '4.0',
    status: 'approved',
    effectiveDate: '2024-02-01',
    lastReviewDate: '2024-02-01',
    nextReviewDate: daysFromNow(12),
    reviewFrequencyMonths: 6,
    description: 'Step-by-step work instructions for cleaning operatives at office locations, covering daily, weekly and deep-clean schedules.',
    fileName: 'WI-Office-Cleaning-v4.0.pdf',
    fileSize: '3.2 MB',
    submittedBy: 'Tom Briggs',
    submittedDate: '2024-01-25',
    versionHistory: [
      { version: '4.0', date: '2024-02-01', uploadedBy: 'Tom Briggs',    notes: 'Added touchpoint sanitisation protocol.',        approvalStatus: 'approved' },
      { version: '3.5', date: '2023-08-01', uploadedBy: 'Tom Briggs',    notes: 'Updated chemical dilution ratios.',              approvalStatus: 'approved' },
      { version: '3.0', date: '2023-02-01', uploadedBy: 'Claire Ashton', notes: 'Restructured for new COSHH requirements.',      approvalStatus: 'approved' },
    ],
  },
  {
    id: 'doc-005',
    title: 'Public Liability Insurance Certificate',
    category: 'Insurance',
    owner: 'Claire Ashton',
    department: 'Finance',
    version: '1.0',
    status: 'expired',
    effectiveDate: '2023-04-01',
    lastReviewDate: '2023-04-01',
    nextReviewDate: daysFromNow(-30),
    reviewFrequencyMonths: 12,
    description: 'Annual public liability insurance certificate. Current cover: £5,000,000. Underwriter: Aviva Commercial.',
    fileName: 'PL-Insurance-2023.pdf',
    fileSize: '0.5 MB',
    submittedBy: 'Claire Ashton',
    submittedDate: '2023-03-28',
    versionHistory: [
      { version: '1.0', date: '2023-04-01', uploadedBy: 'Claire Ashton', notes: 'Annual renewal certificate.', approvalStatus: 'approved' },
    ],
  },
  {
    id: 'doc-006',
    title: 'Risk Assessment Form Template',
    category: 'Forms',
    owner: 'Patricia Nwachukwu',
    department: 'Operations',
    version: '2.3',
    status: 'approved',
    effectiveDate: '2024-04-01',
    lastReviewDate: '2024-04-01',
    nextReviewDate: daysFromNow(240),
    reviewFrequencyMonths: 12,
    description: 'Standard risk assessment form for all site types. Covers hazard identification, likelihood/severity matrix, and control measures.',
    fileName: 'RA-Form-Template-v2.3.docx',
    fileSize: '0.3 MB',
    submittedBy: 'Patricia Nwachukwu',
    submittedDate: '2024-03-25',
    versionHistory: [
      { version: '2.3', date: '2024-04-01', uploadedBy: 'Patricia Nwachukwu', notes: 'Updated control measures taxonomy.',  approvalStatus: 'approved' },
      { version: '2.2', date: '2023-10-01', uploadedBy: 'Tom Briggs',          notes: 'Added hierarchy of controls section.', approvalStatus: 'approved' },
    ],
  },
  {
    id: 'doc-007',
    title: 'COSHH Assessment Procedure',
    category: 'Health & Safety',
    owner: 'Tom Briggs',
    department: 'Operations',
    version: '1.0',
    status: 'draft',
    effectiveDate: '',
    lastReviewDate: daysFromNow(-3),
    nextReviewDate: '',
    reviewFrequencyMonths: 12,
    description: 'Draft procedure for carrying out COSHH assessments for all cleaning chemicals used across client sites. Pending director approval before release.',
    fileName: undefined,
    fileSize: undefined,
    submittedBy: undefined,
    submittedDate: undefined,
    versionHistory: [
      { version: '1.0', date: daysFromNow(-3), uploadedBy: 'Tom Briggs', notes: 'Initial draft — for internal review.', approvalStatus: 'pending' },
    ],
  },
  {
    id: 'doc-008',
    title: 'Employer\'s Liability Insurance Certificate',
    category: 'Insurance',
    owner: 'Claire Ashton',
    department: 'Finance',
    version: '1.0',
    status: 'pending',
    effectiveDate: '2025-04-01',
    lastReviewDate: daysFromNow(-5),
    nextReviewDate: daysFromNow(360),
    reviewFrequencyMonths: 12,
    description: 'New employer\'s liability insurance certificate for the 2025/2026 period. Cover: £10,000,000. Awaiting director sign-off.',
    fileName: 'EL-Insurance-2025.pdf',
    fileSize: '0.5 MB',
    submittedBy: 'Claire Ashton',
    submittedDate: daysFromNow(-5),
    versionHistory: [
      { version: '1.0', date: daysFromNow(-5), uploadedBy: 'Claire Ashton', notes: 'New certificate uploaded for approval.', approvalStatus: 'pending' },
    ],
  },
];

// Helper — find by id
export const getDocById = (id: string): PolicyDocument | undefined =>
  MOCK_DOCUMENTS.find(d => d.id === id);

// Helper — days until a date (negative = past)
export const daysUntilDate = (dateStr: string): number => {
  if (!dateStr) return Infinity;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
};

// Mutate approval status (used by approval panel + approvals page)
export const updateDocStatus = (id: string, status: PolicyDocument['status']): void => {
  const doc = MOCK_DOCUMENTS.find(d => d.id === id);
  if (doc) {
    doc.status = status;
    if (doc.versionHistory.length > 0) {
      doc.versionHistory[0].approvalStatus =
        status === 'approved' ? 'approved' :
        status === 'rejected' ? 'rejected' : 'pending';
    }
  }
};
