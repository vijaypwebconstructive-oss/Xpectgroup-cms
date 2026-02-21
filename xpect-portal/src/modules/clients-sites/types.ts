// ── Client & Site Management — Type definitions ──────────────

export type Industry = 'Office' | 'School' | 'Healthcare' | 'Construction' | 'Retail' | 'Hospitality';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type ComplianceStatus = 'Compliant' | 'Expiring' | 'Non-Compliant';

export type ContractHealth = 'Valid' | 'Expiring' | 'Expired';

export type AssignmentStatus = 'Compliant' | 'Expiring' | 'Non-Compliant';

export interface Client {
  id: string;
  name: string;
  industry: Industry;
  contactPerson: string;
  email: string;
  phone: string;
  contractStart: string;   // ISO date
  contractEnd: string;     // ISO date
  insuranceExpiry: string; // ISO date
  address: string;
  notes?: string;
}

export interface Site {
  id: string;
  clientId: string;
  name: string;
  address: string;
  postcode: string;
  riskLevel: RiskLevel;
  requiredTrainings: string[];
  emergencyContact: string;
  emergencyPhone: string;
  accessInstructions: string;
  activeWorkers: number;
}

export interface WorkerAssignment {
  id: string;
  workerId: string;
  workerName: string;
  workerInitials: string;
  workerAvatarColor: string;
  siteId: string;
  siteName: string;
  clientId: string;
  completedTrainings: string[];
  complianceStatus: AssignmentStatus;
  assignedSince: string;
  role: string;
}

export interface TrainingRequirement {
  name: string;
  mandatory: boolean;
}
