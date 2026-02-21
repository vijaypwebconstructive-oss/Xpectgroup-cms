import { Client, Site, WorkerAssignment } from './types';

// ── Helper — days from today ──────────────────────────────────
const daysFromNow = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// ── Clients ───────────────────────────────────────────────────
export const MOCK_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    name: 'Pinnacle Office Solutions',
    industry: 'Office',
    contactPerson: 'Richard Hammond',
    email: 'r.hammond@pinnacle-office.co.uk',
    phone: '+44 161 400 1234',
    contractStart: '2024-01-01',
    contractEnd: daysFromNow(180),
    insuranceExpiry: daysFromNow(200),
    address: 'Pinnacle House, 88 King Street, Manchester, M2 4WQ',
    notes: 'Preferred morning cleans. Key collection from reception.',
  },
  {
    id: 'cli-002',
    name: 'Greenfield Academy Trust',
    industry: 'School',
    contactPerson: 'Amanda Foster',
    email: 'a.foster@greenfield-academy.sch.uk',
    phone: '+44 161 550 9900',
    contractStart: '2023-09-01',
    contractEnd: daysFromNow(22),
    insuranceExpiry: daysFromNow(90),
    address: '15 School Lane, Salford, M6 8PQ',
    notes: 'DBS enhanced checks required for all workers. No lone working permitted.',
  },
  {
    id: 'cli-003',
    name: 'NorthWest Healthcare NHS',
    industry: 'Healthcare',
    contactPerson: 'Dr. Patricia Nwachukwu',
    email: 'p.nwachukwu@nwhealthcare.nhs.uk',
    phone: '+44 161 276 5500',
    contractStart: '2023-04-01',
    contractEnd: daysFromNow(365),
    insuranceExpiry: daysFromNow(-5),
    address: 'NW Healthcare Hub, Oxford Road, Manchester, M13 9WL',
    notes: 'Biohazard training mandatory. Clinical waste handling required.',
  },
  {
    id: 'cli-004',
    name: 'Bridgewater Construction Group',
    industry: 'Construction',
    contactPerson: 'Tom Briggs',
    email: 't.briggs@bridgewater-construction.co.uk',
    phone: '+44 161 834 7711',
    contractStart: '2024-03-15',
    contractEnd: daysFromNow(290),
    insuranceExpiry: daysFromNow(310),
    address: 'Unit 7, Trafford Park, Manchester, M17 1HH',
    notes: 'PPE mandatory on site at all times. Site induction required.',
  },
  {
    id: 'cli-005',
    name: 'Cityscape Retail Partners',
    industry: 'Retail',
    contactPerson: 'Claire Ashton',
    email: 'c.ashton@cityscape-retail.co.uk',
    phone: '+44 161 922 3300',
    contractStart: '2024-06-01',
    contractEnd: daysFromNow(15),
    insuranceExpiry: daysFromNow(8),
    address: 'Cityscape Mall, 200 Deansgate, Manchester, M3 4LQ',
    notes: 'Evening and overnight cleans only. CCTV on premises.',
  },
];

// ── Sites ─────────────────────────────────────────────────────
export const MOCK_SITES: Site[] = [
  {
    id: 'site-001',
    clientId: 'cli-001',
    name: 'Pinnacle HQ — Level 1–3',
    address: '88 King Street, Manchester',
    postcode: 'M2 4WQ',
    riskLevel: 'Low',
    requiredTrainings: ['Manual Handling', 'COSHH Awareness', 'Fire Safety'],
    emergencyContact: 'Richard Hammond',
    emergencyPhone: '+44 7700 100001',
    accessInstructions: 'Key fob from reception. Code: 4412.',
    activeWorkers: 4,
  },
  {
    id: 'site-002',
    clientId: 'cli-001',
    name: 'Pinnacle Annex Building',
    address: '90 King Street, Manchester',
    postcode: 'M2 4WR',
    riskLevel: 'Low',
    requiredTrainings: ['Manual Handling', 'Fire Safety'],
    emergencyContact: 'Richard Hammond',
    emergencyPhone: '+44 7700 100001',
    accessInstructions: 'Ask security desk for access pass.',
    activeWorkers: 2,
  },
  {
    id: 'site-003',
    clientId: 'cli-002',
    name: 'Greenfield Primary Campus',
    address: '15 School Lane, Salford',
    postcode: 'M6 8PQ',
    riskLevel: 'Medium',
    requiredTrainings: ['Enhanced DBS', 'Child Safeguarding', 'Manual Handling', 'COSHH Awareness'],
    emergencyContact: 'Amanda Foster',
    emergencyPhone: '+44 7700 100002',
    accessInstructions: 'Sign in at main office. Visitor badge required at all times.',
    activeWorkers: 3,
  },
  {
    id: 'site-004',
    clientId: 'cli-002',
    name: 'Greenfield Secondary Block',
    address: '17 School Lane, Salford',
    postcode: 'M6 8PQ',
    riskLevel: 'Medium',
    requiredTrainings: ['Enhanced DBS', 'Child Safeguarding', 'Fire Safety'],
    emergencyContact: 'Amanda Foster',
    emergencyPhone: '+44 7700 100002',
    accessInstructions: 'Key from main site office. Return before 18:00.',
    activeWorkers: 2,
  },
  {
    id: 'site-005',
    clientId: 'cli-003',
    name: 'NW Healthcare — A&E Wing',
    address: 'Oxford Road, Manchester',
    postcode: 'M13 9WL',
    riskLevel: 'High',
    requiredTrainings: ['Biohazard Handling', 'Clinical Waste', 'Infection Control', 'COSHH Awareness', 'Manual Handling'],
    emergencyContact: 'Dr. Patricia Nwachukwu',
    emergencyPhone: '+44 7700 100003',
    accessInstructions: 'Swipe card from facilities manager. Full PPE required.',
    activeWorkers: 5,
  },
  {
    id: 'site-006',
    clientId: 'cli-003',
    name: 'NW Healthcare — Outpatients',
    address: 'Oxford Road, Manchester',
    postcode: 'M13 9WM',
    riskLevel: 'High',
    requiredTrainings: ['Biohazard Handling', 'Infection Control', 'Manual Handling'],
    emergencyContact: 'Dr. Patricia Nwachukwu',
    emergencyPhone: '+44 7700 100003',
    accessInstructions: 'Check in with ward sister before starting work.',
    activeWorkers: 3,
  },
  {
    id: 'site-007',
    clientId: 'cli-004',
    name: 'Bridgewater — Site Alpha',
    address: 'Unit 7, Trafford Park, Manchester',
    postcode: 'M17 1HH',
    riskLevel: 'High',
    requiredTrainings: ['CSCS Card', 'Working at Height', 'Manual Handling', 'PPE Awareness', 'Fire Safety'],
    emergencyContact: 'Tom Briggs',
    emergencyPhone: '+44 7700 100004',
    accessInstructions: 'Hard hat and hi-vis mandatory. Site induction on first visit.',
    activeWorkers: 4,
  },
  {
    id: 'site-008',
    clientId: 'cli-004',
    name: 'Bridgewater — Welfare Block',
    address: 'Unit 7a, Trafford Park, Manchester',
    postcode: 'M17 1HJ',
    riskLevel: 'Medium',
    requiredTrainings: ['Manual Handling', 'COSHH Awareness', 'PPE Awareness'],
    emergencyContact: 'Tom Briggs',
    emergencyPhone: '+44 7700 100004',
    accessInstructions: 'Open access during working hours. Sign welfare log.',
    activeWorkers: 2,
  },
  {
    id: 'site-009',
    clientId: 'cli-005',
    name: 'Cityscape Mall — Ground Floor',
    address: '200 Deansgate, Manchester',
    postcode: 'M3 4LQ',
    riskLevel: 'Low',
    requiredTrainings: ['Manual Handling', 'Fire Safety', 'COSHH Awareness'],
    emergencyContact: 'Claire Ashton',
    emergencyPhone: '+44 7700 100005',
    accessInstructions: 'Night-entry via service entrance. Code: 9981.',
    activeWorkers: 3,
  },
  {
    id: 'site-010',
    clientId: 'cli-005',
    name: 'Cityscape Mall — Food Court',
    address: '200 Deansgate, Manchester (Level 2)',
    postcode: 'M3 4LR',
    riskLevel: 'Medium',
    requiredTrainings: ['Food Hygiene L2', 'Manual Handling', 'COSHH Awareness'],
    emergencyContact: 'Claire Ashton',
    emergencyPhone: '+44 7700 100005',
    accessInstructions: 'Report to food court supervisor on arrival.',
    activeWorkers: 2,
  },
];

// ── Worker Assignments ────────────────────────────────────────
export const MOCK_ASSIGNMENTS: WorkerAssignment[] = [
  { id: 'wa-001', workerId: 'mock-s-001', workerName: 'James Thornton',  workerInitials: 'JT', workerAvatarColor: 'bg-blue-500',    siteId: 'site-001', siteName: 'Pinnacle HQ — Level 1–3',         clientId: 'cli-001', completedTrainings: ['Manual Handling', 'COSHH Awareness', 'Fire Safety'],          complianceStatus: 'Compliant',     assignedSince: '2024-02-01', role: 'Senior Cleaner' },
  { id: 'wa-002', workerId: 'mock-s-002', workerName: 'Sarah Mitchell',  workerInitials: 'SM', workerAvatarColor: 'bg-pink-500',     siteId: 'site-001', siteName: 'Pinnacle HQ — Level 1–3',         clientId: 'cli-001', completedTrainings: ['Manual Handling', 'Fire Safety'],                              complianceStatus: 'Expiring',      assignedSince: '2024-03-15', role: 'Cleaner' },
  { id: 'wa-003', workerId: 'mock-s-003', workerName: 'David Okafor',   workerInitials: 'DO', workerAvatarColor: 'bg-emerald-500',  siteId: 'site-002', siteName: 'Pinnacle Annex Building',           clientId: 'cli-001', completedTrainings: ['Manual Handling'],                                              complianceStatus: 'Expiring',      assignedSince: '2024-04-01', role: 'Cleaner' },
  { id: 'wa-004', workerId: 'mock-s-004', workerName: 'Emma Clarke',    workerInitials: 'EC', workerAvatarColor: 'bg-violet-500',   siteId: 'site-002', siteName: 'Pinnacle Annex Building',           clientId: 'cli-001', completedTrainings: ['Manual Handling', 'Fire Safety'],                              complianceStatus: 'Compliant',     assignedSince: '2023-12-01', role: 'Supervisor' },
  { id: 'wa-005', workerId: 'mock-s-005', workerName: 'Ryan Patel',     workerInitials: 'RP', workerAvatarColor: 'bg-orange-500',   siteId: 'site-003', siteName: 'Greenfield Primary Campus',         clientId: 'cli-002', completedTrainings: ['Enhanced DBS', 'Child Safeguarding', 'Manual Handling'],      complianceStatus: 'Compliant',     assignedSince: '2024-01-10', role: 'Cleaner' },
  { id: 'wa-006', workerId: 'mock-s-006', workerName: 'Priya Singh',    workerInitials: 'PS', workerAvatarColor: 'bg-rose-500',     siteId: 'site-003', siteName: 'Greenfield Primary Campus',         clientId: 'cli-002', completedTrainings: ['Manual Handling'],                                              complianceStatus: 'Non-Compliant', assignedSince: '2024-05-01', role: 'Cleaner' },
  { id: 'wa-007', workerId: 'w-007',      workerName: 'Luke Henderson',  workerInitials: 'LH', workerAvatarColor: 'bg-sky-500',     siteId: 'site-004', siteName: 'Greenfield Secondary Block',         clientId: 'cli-002', completedTrainings: ['Enhanced DBS', 'Child Safeguarding', 'Fire Safety'],          complianceStatus: 'Compliant',     assignedSince: '2024-02-20', role: 'Cleaner' },
  { id: 'wa-008', workerId: 'w-008',      workerName: 'Amara Osei',     workerInitials: 'AO', workerAvatarColor: 'bg-teal-500',     siteId: 'site-005', siteName: 'NW Healthcare — A&E Wing',         clientId: 'cli-003', completedTrainings: ['Biohazard Handling', 'Clinical Waste', 'Infection Control', 'COSHH Awareness', 'Manual Handling'], complianceStatus: 'Compliant', assignedSince: '2023-11-01', role: 'Senior Cleaner' },
  { id: 'wa-009', workerId: 'w-009',      workerName: 'Chris Evans',    workerInitials: 'CE', workerAvatarColor: 'bg-indigo-500',   siteId: 'site-005', siteName: 'NW Healthcare — A&E Wing',         clientId: 'cli-003', completedTrainings: ['Biohazard Handling', 'Infection Control'],                     complianceStatus: 'Non-Compliant', assignedSince: '2024-06-01', role: 'Cleaner' },
  { id: 'wa-010', workerId: 'w-010',      workerName: 'Fatima Hassan',  workerInitials: 'FH', workerAvatarColor: 'bg-amber-500',    siteId: 'site-006', siteName: 'NW Healthcare — Outpatients',      clientId: 'cli-003', completedTrainings: ['Biohazard Handling', 'Infection Control', 'Manual Handling'],  complianceStatus: 'Compliant',     assignedSince: '2024-03-10', role: 'Cleaner' },
  { id: 'wa-011', workerId: 'w-011',      workerName: 'Michael Brown',  workerInitials: 'MB', workerAvatarColor: 'bg-lime-600',     siteId: 'site-007', siteName: 'Bridgewater — Site Alpha',         clientId: 'cli-004', completedTrainings: ['CSCS Card', 'Working at Height', 'Manual Handling', 'PPE Awareness', 'Fire Safety'], complianceStatus: 'Compliant', assignedSince: '2024-04-01', role: 'Cleaner' },
  { id: 'wa-012', workerId: 'w-012',      workerName: 'Grace Obi',      workerInitials: 'GO', workerAvatarColor: 'bg-purple-500',   siteId: 'site-007', siteName: 'Bridgewater — Site Alpha',         clientId: 'cli-004', completedTrainings: ['Manual Handling', 'Fire Safety'],                              complianceStatus: 'Non-Compliant', assignedSince: '2024-05-15', role: 'Cleaner' },
  { id: 'wa-013', workerId: 'w-013',      workerName: 'Ali Hassan',     workerInitials: 'AH', workerAvatarColor: 'bg-cyan-500',     siteId: 'site-008', siteName: 'Bridgewater — Welfare Block',      clientId: 'cli-004', completedTrainings: ['Manual Handling', 'COSHH Awareness', 'PPE Awareness'],          complianceStatus: 'Compliant',     assignedSince: '2024-03-20', role: 'Cleaner' },
  { id: 'wa-014', workerId: 'w-014',      workerName: 'Nadia Kowalski', workerInitials: 'NK', workerAvatarColor: 'bg-fuchsia-500',  siteId: 'site-009', siteName: 'Cityscape Mall — Ground Floor',    clientId: 'cli-005', completedTrainings: ['Manual Handling', 'Fire Safety', 'COSHH Awareness'],          complianceStatus: 'Compliant',     assignedSince: '2024-07-01', role: 'Cleaner' },
  { id: 'wa-015', workerId: 'w-015',      workerName: 'Tom Clarke',     workerInitials: 'TC', workerAvatarColor: 'bg-orange-400',   siteId: 'site-010', siteName: 'Cityscape Mall — Food Court',      clientId: 'cli-005', completedTrainings: ['Manual Handling', 'COSHH Awareness'],                          complianceStatus: 'Non-Compliant', assignedSince: '2024-08-01', role: 'Cleaner' },
];

// ── Derived helpers ───────────────────────────────────────────
export const getSitesByClient = (clientId: string) =>
  MOCK_SITES.filter(s => s.clientId === clientId);

export const getAssignmentsBySite = (siteId: string) =>
  MOCK_ASSIGNMENTS.filter(a => a.siteId === siteId);

export const getAssignmentsByClient = (clientId: string) =>
  MOCK_ASSIGNMENTS.filter(a => a.clientId === clientId);

export const getClientById = (id: string) =>
  MOCK_CLIENTS.find(c => c.id === id);

export const getSiteById = (id: string) =>
  MOCK_SITES.find(s => s.id === id);

// Days until a date
export const daysUntil = (dateStr: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const contractHealth = (client: Client): 'Valid' | 'Expiring' | 'Expired' => {
  const contractDays  = daysUntil(client.contractEnd);
  const insuranceDays = daysUntil(client.insuranceExpiry);
  if (contractDays < 0 || insuranceDays < 0)  return 'Expired';
  if (contractDays <= 30 || insuranceDays <= 30) return 'Expiring';
  return 'Valid';
};
