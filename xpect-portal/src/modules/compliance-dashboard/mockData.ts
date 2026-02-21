import {
  ComplianceAlert,
  TrainingExpiry,
  SiteIssue,
  IncidentSummary,
  DocumentSummary,
  StaffSummary,
} from './types';

const daysFromNow = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const daysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

// ── Training Expiry Records ──────────────────────────────────────────────────
export const MOCK_TRAINING_EXPIRY: TrainingExpiry[] = [
  { id: 'te-001', employee: 'Marcus Thompson', training: 'Working at Height', expiryDate: daysFromNow(3), daysRemaining: 3 },
  { id: 'te-002', employee: 'Sarah Okafor', training: 'Manual Handling', expiryDate: daysFromNow(5), daysRemaining: 5 },
  { id: 'te-003', employee: 'Liam Patel', training: 'COSHH Awareness', expiryDate: daysFromNow(6), daysRemaining: 6 },
  { id: 'te-004', employee: 'Amara Diallo', training: 'First Aid at Work', expiryDate: daysFromNow(9), daysRemaining: 9 },
  { id: 'te-005', employee: 'Jordan Wells', training: 'Fire Safety Awareness', expiryDate: daysFromNow(12), daysRemaining: 12 },
  { id: 'te-006', employee: 'Priya Nair', training: 'Lone Working Policy', expiryDate: daysFromNow(15), daysRemaining: 15 },
  { id: 'te-007', employee: 'Ethan Brooks', training: 'Slips, Trips & Falls', expiryDate: daysFromNow(18), daysRemaining: 18 },
  { id: 'te-008', employee: 'Fatima Hassan', training: 'PPE Awareness', expiryDate: daysFromNow(22), daysRemaining: 22 },
  { id: 'te-009', employee: 'Carlos Reyes', training: 'Infection Control', expiryDate: daysFromNow(26), daysRemaining: 26 },
  { id: 'te-010', employee: 'Ngozi Eze', training: 'Hazardous Waste Handling', expiryDate: daysFromNow(29), daysRemaining: 29 },
];

// ── Compliance Alerts ────────────────────────────────────────────────────────
export const MOCK_COMPLIANCE_ALERTS: ComplianceAlert[] = [
  {
    id: 'alert-001',
    message: '3 employees have expired right-to-work documents and cannot be allocated to sites.',
    severity: 'critical',
    module: 'Staff',
    timestamp: daysAgo(0),
  },
  {
    id: 'alert-002',
    message: '2 high-risk assessments are overdue for review — work must not proceed until updated.',
    severity: 'critical',
    module: 'Risk & COSHH',
    timestamp: daysAgo(1),
  },
  {
    id: 'alert-003',
    message: '5 training certificates expire within the next 7 days across 4 employees.',
    severity: 'critical',
    module: 'Training',
    timestamp: daysAgo(0),
  },
  {
    id: 'alert-004',
    message: 'Client insurance for Greenway Facilities Ltd expires in 14 days. Upload renewed certificate.',
    severity: 'warning',
    module: 'Clients & Sites',
    timestamp: daysAgo(2),
  },
  {
    id: 'alert-005',
    message: '1 corrective action from incident INC-003 is overdue by 5 days with no update.',
    severity: 'warning',
    module: 'Incidents',
    timestamp: daysAgo(3),
  },
  {
    id: 'alert-006',
    message: 'COSHH register has 2 chemicals with no Safety Data Sheet on file.',
    severity: 'warning',
    module: 'Risk & COSHH',
    timestamp: daysAgo(1),
  },
  {
    id: 'alert-007',
    message: 'Health & Safety Policy is pending approval and has not been reviewed in 13 months.',
    severity: 'info',
    module: 'Document Control',
    timestamp: daysAgo(4),
  },
];

// ── Site Compliance Issues ───────────────────────────────────────────────────
export const MOCK_SITE_ISSUES: SiteIssue[] = [
  {
    id: 'si-001',
    site: 'Westfield Shopping Centre',
    client: 'Westfield Group',
    issue: 'Worker assigned without required Working at Height certification',
    severity: 'high',
  },
  {
    id: 'si-002',
    site: 'St. Mary\'s Hospital',
    client: 'NHS South East',
    issue: 'Missing RAMS document — no method statement uploaded for site',
    severity: 'high',
  },
  {
    id: 'si-003',
    site: 'Greenway Business Park',
    client: 'Greenway Facilities Ltd',
    issue: 'COSHH assessment not linked to site — chemical cleaning products in use',
    severity: 'medium',
  },
  {
    id: 'si-004',
    site: 'Riverside Primary School',
    client: 'Riverside Academy Trust',
    issue: 'Site induction records missing for 2 assigned workers',
    severity: 'medium',
  },
];

// ── Incident Summary ─────────────────────────────────────────────────────────
export const MOCK_INCIDENT_SUMMARY: IncidentSummary = {
  open: 3,
  investigating: 2,
  overdueActions: 2,
  total: 8,
};

// ── Document Summary ─────────────────────────────────────────────────────────
export const MOCK_DOCUMENT_SUMMARY: DocumentSummary = {
  approved: 4,
  pending: 2,
  expired: 3,
  total: 9,
};

// ── Staff Summary ────────────────────────────────────────────────────────────
export const MOCK_STAFF_SUMMARY: StaffSummary = {
  total: 24,
  compliant: 18,
  nonCompliant: 3,
  expiringSoon: 3,
};
