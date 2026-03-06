import {
  ComplianceAlert,
  TrainingExpiry,
  SiteIssue,
  DocumentSummary,
  StaffSummary,
} from './types';

import type { RiskAssessment, RAMS } from '../risk-coshh/types';
import type { Client, WorkerAssignment } from '../clients-sites/types';
import { getAllRiskAssessments, getAllRAMS } from '../risk-coshh/mockData';
import type { PolicyDocument } from '../document-control/types';
import type { PPEIssueRecord, PPEInventoryRecord } from '../../types';
import type { TrainingRecord } from '../../views/trainingMockData';

const now = () => new Date().toISOString();

export const daysUntilDate = (dateStr: string): number => {
  if (!dateStr) return Infinity;
  const n = new Date(); n.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr).getTime() - n.getTime()) / 86_400_000);
};

/** Build TrainingExpiry list from training records (API-backed) */
export const buildTrainingExpiry = (records: TrainingRecord[]): TrainingExpiry[] => {
  return records
    .filter(r => r.expiryDate)
    .map(r => {
      const days = daysUntilDate(r.expiryDate);
      return {
        id: r.id,
        employee: r.name,
        training: r.course,
        expiryDate: r.expiryDate,
        daysRemaining: days,
      };
    })
    .filter(t => t.daysRemaining <= 90)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
};

// ── Dynamically computed alerts from real project data ───────────────────────

export interface RiskCoshhData {
  riskAssessments: RiskAssessment[];
  ramsList: RAMS[];
}

export interface ClientsSitesData {
  clients: Client[];
  assignments: WorkerAssignment[];
}

export interface PolicyDocumentsData {
  documents: PolicyDocument[];
}

export interface PPERecordsData {
  records: PPEIssueRecord[];
  inventory: PPEInventoryRecord[];
}

export interface TrainingData {
  trainingRecords: TrainingRecord[];
}

const daysUntilDateOnly = (dateStr: string): number => {
  if (!dateStr) return Infinity;
  const n = new Date(); n.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr).getTime() - n.getTime()) / 86_400_000);
};

const contractHealth = (client: Client): 'Valid' | 'Expiring' | 'Expired' => {
  const contractDays = daysUntilDateOnly(client.contractEnd);
  const insuranceDays = daysUntilDateOnly(client.insuranceExpiry);
  if (contractDays < 0 || insuranceDays < 0) return 'Expired';
  if (contractDays <= 30 || insuranceDays <= 30) return 'Expiring';
  return 'Valid';
};

export const buildComplianceAlerts = (
  riskCoshh?: RiskCoshhData,
  clientsSites?: ClientsSitesData,
  policyDocs?: PolicyDocumentsData,
  ppeData?: PPERecordsData,
  trainingData?: TrainingData
): ComplianceAlert[] => {
  const alerts: ComplianceAlert[] = [];
  let idx = 0;
  const id = () => `alert-${String(++idx).padStart(3, '0')}`;

  const allDocuments = policyDocs?.documents ?? [];
  const allRiskAssessments = riskCoshh?.riskAssessments ?? getAllRiskAssessments();
  const allRAMS = riskCoshh?.ramsList ?? getAllRAMS();
  const allClients = clientsSites?.clients ?? [];
  const allAssignments = clientsSites?.assignments ?? [];
  const ppeRecords = ppeData?.records ?? [];
  const ppeInventory = ppeData?.inventory ?? [];
  const trainingExpiry = trainingData?.trainingRecords ? buildTrainingExpiry(trainingData.trainingRecords) : [];

  // --- DOCUMENTS ---
  const expiredDocs = allDocuments.filter(d => d.status === 'expired');
  if (expiredDocs.length) {
    alerts.push({
      id: id(),
      message: `${expiredDocs.length} document${expiredDocs.length > 1 ? 's have' : ' has'} expired — ${expiredDocs.map(d => `"${d.title}"`).join(', ')}. Immediate renewal required.`,
      severity: 'critical',
      module: 'Document Control',
      timestamp: now(),
    });
  }

  const pendingDocs = allDocuments.filter(d => d.status === 'pending');
  if (pendingDocs.length) {
    alerts.push({
      id: id(),
      message: `${pendingDocs.length} document${pendingDocs.length > 1 ? 's' : ''} awaiting approval — ${pendingDocs.map(d => `"${d.title}"`).join(', ')}.`,
      severity: 'warning',
      module: 'Document Control',
      timestamp: now(),
    });
  }

  const docsReviewSoon = allDocuments.filter(d => d.status === 'approved' && d.nextReviewDate && daysUntilDate(d.nextReviewDate) > 0 && daysUntilDate(d.nextReviewDate) <= 30);
  if (docsReviewSoon.length) {
    alerts.push({
      id: id(),
      message: `${docsReviewSoon.length} approved document${docsReviewSoon.length > 1 ? 's' : ''} due for review within 30 days — ${docsReviewSoon.map(d => `"${d.title}" (${daysUntilDate(d.nextReviewDate!)} days)`).join(', ')}.`,
      severity: 'info',
      module: 'Document Control',
      timestamp: now(),
    });
  }

  // --- RISK ASSESSMENTS ---
  const overdueRAs = allRiskAssessments.filter(r => r.nextReviewDate && daysUntilDate(r.nextReviewDate) < 0);
  if (overdueRAs.length) {
    alerts.push({
      id: id(),
      message: `${overdueRAs.length} risk assessment${overdueRAs.length > 1 ? 's are' : ' is'} overdue for review — ${overdueRAs.map(r => `"${r.title}" (${r.riskLevel} risk)`).join(', ')}.`,
      severity: 'critical',
      module: 'Risk & COSHH',
      timestamp: now(),
    });
  }

  const unapprovedRAMS = allRAMS.filter(r => r.status === 'review_required' || r.status === 'draft');
  if (unapprovedRAMS.length) {
    alerts.push({
      id: id(),
      message: `${unapprovedRAMS.length} RAMS document${unapprovedRAMS.length > 1 ? 's require' : ' requires'} review or approval — ${unapprovedRAMS.map(r => `"${r.siteName}" (${r.status.replace('_', ' ')})`).join(', ')}.`,
      severity: 'warning',
      module: 'Risk & COSHH',
      timestamp: now(),
    });
  }

  // --- PPE ---
  const overduePPE = ppeRecords.filter(p => p.status === 'Overdue');
  if (overduePPE.length) {
    alerts.push({
      id: id(),
      message: `${overduePPE.length} PPE item${overduePPE.length > 1 ? 's are' : ' is'} overdue for replacement — ${overduePPE.map(p => `${p.workerName} (${p.ppeType})`).join(', ')}.`,
      severity: 'critical',
      module: 'PPE',
      timestamp: now(),
    });
  }

  const outOfStock = ppeInventory.filter(i => i.stockStatus === 'Out of Stock');
  if (outOfStock.length) {
    alerts.push({
      id: id(),
      message: `PPE stock depleted for ${outOfStock.map(i => i.ppeType).join(', ')} — workers cannot be issued replacements.`,
      severity: 'critical',
      module: 'PPE',
      timestamp: now(),
    });
  }

  const lowStock = ppeInventory.filter(i => i.stockStatus === 'Low Stock');
  if (lowStock.length) {
    alerts.push({
      id: id(),
      message: `PPE running low for ${lowStock.map(i => `${i.ppeType} (${i.availableQuantity} ${i.unit} remaining)`).join(', ')}.`,
      severity: 'warning',
      module: 'PPE',
      timestamp: now(),
    });
  }

  // --- CLIENTS ---
  const expiredClients = allClients.filter(c => contractHealth(c) === 'Expired');
  if (expiredClients.length) {
    alerts.push({
      id: id(),
      message: `${expiredClients.length} client${expiredClients.length > 1 ? 's have' : ' has'} expired insurance or contracts — ${expiredClients.map(c => {
        const insDays = daysUntilDateOnly(c.insuranceExpiry);
        const conDays = daysUntilDateOnly(c.contractEnd);
        const reasons = [];
        if (insDays < 0) reasons.push(`insurance expired ${Math.abs(insDays)} days ago`);
        if (conDays < 0) reasons.push(`contract expired ${Math.abs(conDays)} days ago`);
        return `${c.name} (${reasons.join(', ')})`;
      }).join('; ')}.`,
      severity: 'critical',
      module: 'Clients & Sites',
      timestamp: now(),
    });
  }

  const expiringClients = allClients.filter(c => contractHealth(c) === 'Expiring');
  if (expiringClients.length) {
    alerts.push({
      id: id(),
      message: `${expiringClients.length} client${expiringClients.length > 1 ? 's have' : ' has'} contracts or insurance expiring within 30 days — ${expiringClients.map(c => c.name).join(', ')}.`,
      severity: 'warning',
      module: 'Clients & Sites',
      timestamp: now(),
    });
  }

  // --- WORKER COMPLIANCE ---
  const nonCompliant = allAssignments.filter(a => a.complianceStatus === 'Non-Compliant');
  if (nonCompliant.length) {
    alerts.push({
      id: id(),
      message: `${nonCompliant.length} worker${nonCompliant.length > 1 ? 's are' : ' is'} non-compliant with site training requirements — ${nonCompliant.map(a => `${a.workerName} at ${a.siteName}`).join(', ')}.`,
      severity: 'critical',
      module: 'Clients & Sites',
      timestamp: now(),
    });
  }

  // --- TRAINING (expiring within 90 days) ---
  const expiringTraining = trainingExpiry;
  if (expiringTraining.length) {
    alerts.push({
      id: id(),
      message: `${expiringTraining.length} training certificate${expiringTraining.length > 1 ? 's expire' : ' expires'} within 90 days — ${expiringTraining.map(t => `${t.employee} (${t.training})`).join(', ')}.`,
      severity: 'critical',
      module: 'Training',
      timestamp: now(),
    });
  }

  return alerts;
};

// ── Site Compliance Issues — derived from real assignment + site data ─────────

export const buildSiteIssues = (riskCoshh?: RiskCoshhData, clientsSites?: ClientsSitesData): SiteIssue[] => {
  const issues: SiteIssue[] = [];
  let idx = 0;
  const id = () => `si-${String(++idx).padStart(3, '0')}`;

  const nonCompliantAssignments = (clientsSites?.assignments ?? []).filter(a => a.complianceStatus === 'Non-Compliant');
  const allClientsList = clientsSites?.clients ?? [];
  const allRAMS = riskCoshh?.ramsList ?? [];
  const siteGroups = new Map<string, typeof nonCompliantAssignments>();
  nonCompliantAssignments.forEach(a => {
    const key = a.siteId;
    if (!siteGroups.has(key)) siteGroups.set(key, []);
    siteGroups.get(key)!.push(a);
  });

  siteGroups.forEach((workers, _siteId) => {
    const first = workers[0];
    const clientName = allClientsList.find(c => c.id === first.clientId)?.name ?? 'Unknown';
    issues.push({
      id: id(),
      site: first.siteName,
      client: clientName,
      issue: `${workers.length} worker${workers.length > 1 ? 's' : ''} assigned without required training — ${workers.map(w => w.workerName).join(', ')}`,
      severity: 'high',
    });
  });

  const unapprovedRAMS = allRAMS.filter(r => r.status !== 'approved');
  unapprovedRAMS.forEach(r => {
    issues.push({
      id: id(),
      site: r.siteName,
      client: r.clientName,
      issue: `RAMS document is "${r.status.replace('_', ' ')}" — must be approved before work continues`,
      severity: r.status === 'review_required' ? 'high' : 'medium',
    });
  });

  return issues;
};

export const MOCK_SITE_ISSUES: SiteIssue[] = buildSiteIssues();

// ── Document Summary — derived from real document data ───────────────────────

export const buildDocumentSummary = (documents: PolicyDocument[]): DocumentSummary => {
  const allDocs = documents ?? [];
  return {
    approved: allDocs.filter(d => d.status === 'approved').length,
    pending: allDocs.filter(d => d.status === 'pending').length,
    expired: allDocs.filter(d => d.status === 'expired').length,
    total: allDocs.length,
  };
};


// ── Staff Summary — derived from real assignment data ────────────────────────

export const buildStaffSummary = (assignments: WorkerAssignment[] = []): StaffSummary => {
  const allAssignments = assignments;
  const total = allAssignments.length;
  const compliant = allAssignments.filter(a => a.complianceStatus === 'Compliant').length;
  const nonCompliant = allAssignments.filter(a => a.complianceStatus === 'Non-Compliant').length;
  const expiringSoon = allAssignments.filter(a => a.complianceStatus === 'Expiring').length;
  return { total, compliant, nonCompliant, expiringSoon };
};

