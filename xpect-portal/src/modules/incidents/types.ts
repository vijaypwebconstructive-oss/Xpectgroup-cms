// ── Incident & Corrective Action Module — Type Definitions ────────────────────

export type IncidentType =
  | 'Accident'
  | 'Near Miss'
  | 'Property Damage'
  | 'Client Complaint'
  | 'Environmental Incident';

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export type IncidentStatus =
  | 'Open'
  | 'Investigating'
  | 'Corrective Action'
  | 'Closed';

export type ActionStatus = 'Open' | 'In Progress' | 'Completed';

export type RootCause =
  | 'Human error'
  | 'Lack of training'
  | 'Unsafe condition'
  | 'Equipment failure'
  | 'Procedure not followed'
  | 'Unknown';

export interface CorrectiveAction {
  id: string;
  incidentId: string;
  description: string;
  assignedTo: string;
  dueDate: string;        // ISO date
  status: ActionStatus;
  completedDate?: string; // ISO date
}

export interface Incident {
  id: string;
  date: string;           // ISO date-time
  site: string;
  worker: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  investigator?: string;
  description: string;

  // Injury/damage
  injuryOccurred: boolean;
  injuryDescription?: string;
  medicalTreatmentRequired?: boolean;
  propertyDamage?: string;

  // Immediate action
  immediateActionTaken?: string;
  supervisorNotified: boolean;

  // Investigation
  investigationNotes?: string;
  rootCause?: RootCause;

  // Evidence
  witnessNotes?: string;
  hasPhotos: boolean;

  // Closure
  closedDate?: string;
  closedBy?: string;
}
