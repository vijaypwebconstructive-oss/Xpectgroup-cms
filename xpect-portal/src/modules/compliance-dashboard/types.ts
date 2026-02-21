export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface ComplianceAlert {
  id: string;
  message: string;
  severity: AlertSeverity;
  module: string;
  timestamp: string;
}

export interface TrainingExpiry {
  id: string;
  employee: string;
  training: string;
  expiryDate: string;
  daysRemaining: number;
}

export type IssueSeverity = 'low' | 'medium' | 'high';

export interface SiteIssue {
  id: string;
  site: string;
  client: string;
  issue: string;
  severity: IssueSeverity;
}

export interface IncidentSummary {
  open: number;
  investigating: number;
  overdueActions: number;
  total: number;
}

export interface DocumentSummary {
  approved: number;
  pending: number;
  expired: number;
  total: number;
}

export interface StaffSummary {
  total: number;
  compliant: number;
  nonCompliant: number;
  expiringSoon: number;
}
