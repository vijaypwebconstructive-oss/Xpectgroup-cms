// ── Risk Assessment & COSHH Module — Type Definitions ────────────────────────

export type RiskLevel = 'Low' | 'Medium' | 'High';
export type ApprovalStatus = 'approved' | 'pending' | 'not_approved';
export type RAMSStatus = 'approved' | 'draft' | 'review_required';
export type SDSStatus = 'valid' | 'expired' | 'review_soon';

export interface Hazard {
  hazard: string;
  harm: string;
  control: string;
  residualRisk: RiskLevel;
}

export interface RiskAssessment {
  id: string;
  title: string;
  taskType: string;
  riskLevel: RiskLevel;
  createdBy: string;
  lastReviewDate: string;       // ISO date
  nextReviewDate: string;       // ISO date
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvalDate?: string;
  taskDescription: string;
  equipmentUsed: string[];
  workArea: string;
  hazards: Hazard[];
  requiredPPE: string[];
  siteId?: string;
}

export interface RAMS {
  id: string;
  siteName: string;
  clientName: string;
  description: string;
  workingHours: string;
  status: RAMSStatus;
  lastUpdated: string;          // ISO date
  supervisor: string;
  workMethod: string[];         // step-by-step
  emergencyProcedures: string[];
  linkedRiskAssessmentIds: string[];
  signedCopyAvailable: boolean;
}

export interface Chemical {
  id: string;
  name: string;
  manufacturer: string;
  hazardType: string;           // e.g. "Irritant", "Corrosive", "Flammable"
  hazardSymbols: string[];      // e.g. ["GHS07", "GHS05"]
  storageLocation: string;
  ppeRequired: string[];
  sdsAvailable: boolean;
  sdsId?: string;
  firstAidMeasures: string;
  spillResponse: string;
  disposalMethod: string;
  handlingInstructions: string;
  maxExposureLimit?: string;
}

export interface SDS {
  id: string;
  chemicalId: string;
  chemicalName: string;
  issueDate: string;            // ISO date
  reviewDate: string;           // ISO date
  status: SDSStatus;
  manufacturer: string;
  fileName?: string;
  fileSize?: string;
  revision: string;
}
