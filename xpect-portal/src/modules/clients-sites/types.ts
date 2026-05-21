// ── Client & Site Management — Type definitions ──────────────

export type Industry =
  | "Office"
  | "School"
  | "Healthcare"
  | "Construction"
  | "Retail"
  | "Hospitality";

export type RiskLevel = "Low" | "Medium" | "High";

export type ComplianceStatus = "Compliant" | "Expiring" | "Non-Compliant";

export type ContractHealth = "Valid" | "Expiring" | "Expired";

export type AssignmentStatus = "Compliant" | "Expiring" | "Non-Compliant";

export interface ClientDocument {
  key: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  dataUrl: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string; // Business type, e.g. Healthcare, Office, Retail
  contactPerson: string;
  email: string;
  phone: string;
  relation: "Recurring" | "Onetime";
  contractStart: string; // ISO date
  contractEnd: string; // ISO date
  insuranceExpiry: string; // ISO date
  address: string;
  notes?: string;
  documents?: ClientDocument[];
}

export interface SiteComplianceDocument {
  key: string;
  name: string;
  dataUrl: string;
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
  inspectionAlertDays?: number;
  accessInstructions: string;
  activeWorkers: number;
  inspectionFrequency?: "Weekly" | "Monthly" | "";
  complianceDocuments?: SiteComplianceDocument[];
  allocationPeriod?: "Weekly" | "Monthly";
  allocatedHours?: number;
  totalWorkedHours?: number;

  geoFence?: {
    enabled: boolean;

    type: "Circle" | "Polygon";

    coordinates?: {
      latitude: number;

      longitude: number;
    };

    radius: number;

    polygon?: {
      lat: number;

      lng: number;
    }[];
  };
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

// types.ts

export interface ChecklistItem {
  label: string;
  rating: number;
}

export interface Issue {
  title: string;
  severity: "Low" | "Medium" | "High";
}

export interface Photo {
  file: File;
  preview: string;
}

export interface Inspection {
  id: string;
  site: string;
  siteName: string;
  inspector: string;
  date: string;
  checklist: ChecklistItem[];
  issues: Issue[];
  comments: string;
  photos: Photo[];
  score: number;
  createdAt: string;
}
