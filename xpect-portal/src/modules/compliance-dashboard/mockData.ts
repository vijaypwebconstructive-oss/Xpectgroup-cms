import {
  ComplianceAlert,
  TrainingExpiry,
  SiteIssue,
  DocumentSummary,
  StaffSummary,
} from './types';

import { MOCK_DOCUMENTS } from '../document-control/mockData';
import { addedDocuments } from '../document-control/DocumentsLibrary';
import { MOCK_RISK_ASSESSMENTS, MOCK_RAMS, MOCK_CHEMICALS, MOCK_SDS } from '../risk-coshh/mockData';
import { MOCK_CLIENTS, MOCK_ASSIGNMENTS, daysUntil as csDaysUntil, contractHealth } from '../clients-sites/mockData';
import { MOCK_PPE_RECORDS, MOCK_PPE_INVENTORY } from '../../views/ppeData';

const daysFromNow = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const now = () => new Date().toISOString();

const daysUntilDate = (dateStr: string): number => {
  if (!dateStr) return Infinity;
  const n = new Date(); n.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr).getTime() - n.getTime()) / 86_400_000);
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

// ── Dynamically computed alerts from real project data ───────────────────────

export const buildComplianceAlerts = (): ComplianceAlert[] => {
  const alerts: ComplianceAlert[] = [];
  let idx = 0;
  const id = () => `alert-${String(++idx).padStart(3, '0')}`;

  const allDocuments = [...addedDocuments, ...MOCK_DOCUMENTS];

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
  const overdueRAs = MOCK_RISK_ASSESSMENTS.filter(r => r.nextReviewDate && daysUntilDate(r.nextReviewDate) < 0);
  if (overdueRAs.length) {
    alerts.push({
      id: id(),
      message: `${overdueRAs.length} risk assessment${overdueRAs.length > 1 ? 's are' : ' is'} overdue for review — ${overdueRAs.map(r => `"${r.title}" (${r.riskLevel} risk)`).join(', ')}.`,
      severity: 'critical',
      module: 'Risk & COSHH',
      timestamp: now(),
    });
  }

  const unapprovedRAMS = MOCK_RAMS.filter(r => r.status === 'review_required' || r.status === 'draft');
  if (unapprovedRAMS.length) {
    alerts.push({
      id: id(),
      message: `${unapprovedRAMS.length} RAMS document${unapprovedRAMS.length > 1 ? 's require' : ' requires'} review or approval — ${unapprovedRAMS.map(r => `"${r.siteName}" (${r.status.replace('_', ' ')})`).join(', ')}.`,
      severity: 'warning',
      module: 'Risk & COSHH',
      timestamp: now(),
    });
  }

  // --- COSHH ---
  const noSDSChemicals = MOCK_CHEMICALS.filter(c => !c.sdsAvailable);
  if (noSDSChemicals.length) {
    alerts.push({
      id: id(),
      message: `${noSDSChemicals.length} chemical${noSDSChemicals.length > 1 ? 's have' : ' has'} no Safety Data Sheet on file — ${noSDSChemicals.map(c => c.name).join(', ')}.`,
      severity: 'warning',
      module: 'Risk & COSHH',
      timestamp: now(),
    });
  }

  const expiredSDS = MOCK_SDS.filter(s => s.status === 'expired');
  if (expiredSDS.length) {
    alerts.push({
      id: id(),
      message: `${expiredSDS.length} Safety Data Sheet${expiredSDS.length > 1 ? 's have' : ' has'} expired — ${expiredSDS.map(s => s.chemicalName).join(', ')}.`,
      severity: 'warning',
      module: 'Risk & COSHH',
      timestamp: now(),
    });
  }

  // --- PPE ---
  const overduePPE = MOCK_PPE_RECORDS.filter(p => p.status === 'Overdue');
  if (overduePPE.length) {
    alerts.push({
      id: id(),
      message: `${overduePPE.length} PPE item${overduePPE.length > 1 ? 's are' : ' is'} overdue for replacement — ${overduePPE.map(p => `${p.workerName} (${p.ppeType})`).join(', ')}.`,
      severity: 'critical',
      module: 'PPE',
      timestamp: now(),
    });
  }

  const outOfStock = MOCK_PPE_INVENTORY.filter(i => i.stockStatus === 'Out of Stock');
  if (outOfStock.length) {
    alerts.push({
      id: id(),
      message: `PPE stock depleted for ${outOfStock.map(i => i.ppeType).join(', ')} — workers cannot be issued replacements.`,
      severity: 'critical',
      module: 'PPE',
      timestamp: now(),
    });
  }

  const lowStock = MOCK_PPE_INVENTORY.filter(i => i.stockStatus === 'Low Stock');
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
  const expiredClients = MOCK_CLIENTS.filter(c => contractHealth(c) === 'Expired');
  if (expiredClients.length) {
    alerts.push({
      id: id(),
      message: `${expiredClients.length} client${expiredClients.length > 1 ? 's have' : ' has'} expired insurance or contracts — ${expiredClients.map(c => {
        const insDays = csDaysUntil(c.insuranceExpiry);
        const conDays = csDaysUntil(c.contractEnd);
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

  const expiringClients = MOCK_CLIENTS.filter(c => contractHealth(c) === 'Expiring');
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
  const nonCompliant = MOCK_ASSIGNMENTS.filter(a => a.complianceStatus === 'Non-Compliant');
  if (nonCompliant.length) {
    alerts.push({
      id: id(),
      message: `${nonCompliant.length} worker${nonCompliant.length > 1 ? 's are' : ' is'} non-compliant with site training requirements — ${nonCompliant.map(a => `${a.workerName} at ${a.siteName}`).join(', ')}.`,
      severity: 'critical',
      module: 'Clients & Sites',
      timestamp: now(),
    });
  }

  // --- TRAINING ---
  const urgentTraining = MOCK_TRAINING_EXPIRY.filter(t => t.daysRemaining <= 7);
  if (urgentTraining.length) {
    alerts.push({
      id: id(),
      message: `${urgentTraining.length} training certificate${urgentTraining.length > 1 ? 's expire' : ' expires'} within 7 days — ${urgentTraining.map(t => `${t.employee} (${t.training})`).join(', ')}.`,
      severity: 'critical',
      module: 'Training',
      timestamp: now(),
    });
  }

  return alerts;
};

export const MOCK_COMPLIANCE_ALERTS: ComplianceAlert[] = buildComplianceAlerts();

// ── Site Compliance Issues — derived from real assignment + site data ─────────

export const buildSiteIssues = (): SiteIssue[] => {
  const issues: SiteIssue[] = [];
  let idx = 0;
  const id = () => `si-${String(++idx).padStart(3, '0')}`;

  const nonCompliant = MOCK_ASSIGNMENTS.filter(a => a.complianceStatus === 'Non-Compliant');
  const siteGroups = new Map<string, typeof nonCompliant>();
  nonCompliant.forEach(a => {
    const key = a.siteId;
    if (!siteGroups.has(key)) siteGroups.set(key, []);
    siteGroups.get(key)!.push(a);
  });

  siteGroups.forEach((workers, _siteId) => {
    const first = workers[0];
    const clientName = MOCK_CLIENTS.find(c => c.id === first.clientId)?.name ?? 'Unknown';
    issues.push({
      id: id(),
      site: first.siteName,
      client: clientName,
      issue: `${workers.length} worker${workers.length > 1 ? 's' : ''} assigned without required training — ${workers.map(w => w.workerName).join(', ')}`,
      severity: 'high',
    });
  });

  const unapprovedRAMS = MOCK_RAMS.filter(r => r.status !== 'approved');
  unapprovedRAMS.forEach(r => {
    issues.push({
      id: id(),
      site: r.siteName,
      client: r.clientName,
      issue: `RAMS document is "${r.status.replace('_', ' ')}" — must be approved before work continues`,
      severity: r.status === 'review_required' ? 'high' : 'medium',
    });
  });

  const noSDSChemicals = MOCK_CHEMICALS.filter(c => !c.sdsAvailable);
  if (noSDSChemicals.length) {
    issues.push({
      id: id(),
      site: 'All sites using these chemicals',
      client: '—',
      issue: `${noSDSChemicals.length} chemical${noSDSChemicals.length > 1 ? 's' : ''} in use without Safety Data Sheet — ${noSDSChemicals.map(c => c.name).join(', ')}`,
      severity: 'high',
    });
  }

  return issues;
};

export const MOCK_SITE_ISSUES: SiteIssue[] = buildSiteIssues();

// ── Document Summary — derived from real document data ───────────────────────

export const buildDocumentSummary = (): DocumentSummary => {
  const allDocs = [...addedDocuments, ...MOCK_DOCUMENTS];
  return {
    approved: allDocs.filter(d => d.status === 'approved').length,
    pending: allDocs.filter(d => d.status === 'pending').length,
    expired: allDocs.filter(d => d.status === 'expired').length,
    total: allDocs.length,
  };
};

export const MOCK_DOCUMENT_SUMMARY: DocumentSummary = buildDocumentSummary();

// ── Staff Summary — derived from real assignment data ────────────────────────

export const buildStaffSummary = (): StaffSummary => {
  const total = MOCK_ASSIGNMENTS.length;
  const compliant = MOCK_ASSIGNMENTS.filter(a => a.complianceStatus === 'Compliant').length;
  const nonCompliant = MOCK_ASSIGNMENTS.filter(a => a.complianceStatus === 'Non-Compliant').length;
  const expiringSoon = MOCK_ASSIGNMENTS.filter(a => a.complianceStatus === 'Expiring').length;
  return { total, compliant, nonCompliant, expiringSoon };
};

export const MOCK_STAFF_SUMMARY: StaffSummary = buildStaffSummary();
