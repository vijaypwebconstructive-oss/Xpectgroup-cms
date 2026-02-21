import React, { useState, useEffect } from 'react';
import { AppView } from '../../types';
import AlertsPanel from './AlertsPanel';
import TrainingExpiryWidget from './TrainingExpiryWidget';
import DocumentStatusWidget from './DocumentStatusWidget';
import SiteComplianceWidget from './SiteComplianceWidget';
import IncidentSummaryWidget from './IncidentSummaryWidget';
import {
  MOCK_COMPLIANCE_ALERTS,
  MOCK_TRAINING_EXPIRY,
  MOCK_SITE_ISSUES,
  MOCK_INCIDENT_SUMMARY,
  MOCK_DOCUMENT_SUMMARY,
  MOCK_STAFF_SUMMARY,
} from './mockData';

interface ComplianceDashboardProps {
  onNavigate: (view: AppView) => void;
}

const KPICard: React.FC<{
  label: string;
  value: number | string;
  icon: string;
  iconBg: string;
  iconColor: string;
  sub?: string;
  alert?: boolean;
}> = ({ label, value, icon, iconBg, iconColor, sub, alert }) => (
  <div className={`bg-white rounded-xl border p-5 flex items-start gap-4 ${alert ? 'border-red-200 bg-red-50' : 'border-[#e7ebf3]'}`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      <span className={`material-symbols-outlined text-[24px] ${iconColor}`}>{icon}</span>
    </div>
    <div>
      <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold mt-0.5 ${alert ? 'text-red-600' : 'text-[#0d121b]'}`}>{value}</p>
      {sub && <p className="text-xs text-[#6b7a99] mt-1">{sub}</p>}
    </div>
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-28 bg-[#e7ebf3] rounded-xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="h-64 bg-[#e7ebf3] rounded-xl" />
      <div className="h-64 bg-[#e7ebf3] rounded-xl" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="h-64 bg-[#e7ebf3] rounded-xl" />
      <div className="h-64 bg-[#e7ebf3] rounded-xl" />
    </div>
  </div>
);

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const criticalAlerts = MOCK_COMPLIANCE_ALERTS.filter(a => a.severity === 'critical').length;
  const lastUpdated = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto bg-[#f5f7fa]">
      {/* Page Header */}
      <div className="flex-shrink-0 bg-white border-b border-[#e7ebf3] px-6 py-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#2e4150] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-white">verified_user</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0d121b]">Audit & Compliance Dashboard</h1>
                <p className="text-xs text-[#6b7a99]">Company-wide compliance monitoring — ISO 45001 / ISO 9001</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {criticalAlerts > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200">
                <span className="material-symbols-outlined text-[16px] text-red-600">error</span>
                <span className="text-sm font-bold text-red-700">{criticalAlerts} critical alerts require action</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f5f7fa] border border-[#e7ebf3]">
              <span className="material-symbols-outlined text-[16px] text-[#6b7a99]">schedule</span>
              <span className="text-xs text-[#6b7a99]">Updated {lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="flex gap-6 h-full">
            {/* Main content column */}
            <div className="flex-1 min-w-0 space-y-5">
              {/* KPI Row */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <KPICard
                  label="Total Staff"
                  value={MOCK_STAFF_SUMMARY.total}
                  icon="group"
                  iconBg="bg-[#2e4150]/10"
                  iconColor="text-[#2e4150]"
                  sub="Active employees"
                />
                <KPICard
                  label="Compliant Staff"
                  value={MOCK_STAFF_SUMMARY.compliant}
                  icon="how_to_reg"
                  iconBg="bg-green-100"
                  iconColor="text-green-600"
                  sub={`${Math.round((MOCK_STAFF_SUMMARY.compliant / MOCK_STAFF_SUMMARY.total) * 100)}% compliance rate`}
                />
                <KPICard
                  label="Non-Compliant"
                  value={MOCK_STAFF_SUMMARY.nonCompliant}
                  icon="person_off"
                  iconBg="bg-red-100"
                  iconColor="text-red-600"
                  sub="Cannot be allocated"
                  alert={MOCK_STAFF_SUMMARY.nonCompliant > 0}
                />
                <KPICard
                  label="Open Incidents"
                  value={MOCK_INCIDENT_SUMMARY.open}
                  icon="report_problem"
                  iconBg="bg-amber-100"
                  iconColor="text-amber-600"
                  sub={`${MOCK_INCIDENT_SUMMARY.overdueActions} overdue actions`}
                  alert={MOCK_INCIDENT_SUMMARY.overdueActions > 0}
                />
              </div>

              {/* Row 2: Training + Documents */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <TrainingExpiryWidget records={MOCK_TRAINING_EXPIRY} />
                <DocumentStatusWidget
                  summary={MOCK_DOCUMENT_SUMMARY}
                  onNavigateToDocControl={() => onNavigate('DOCUMENT_CONTROL' as AppView)}
                />
              </div>

              {/* Row 3: Sites + Incidents */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <SiteComplianceWidget issues={MOCK_SITE_ISSUES} />
                <IncidentSummaryWidget summary={MOCK_INCIDENT_SUMMARY} />
              </div>

              {/* Compliance score footer */}
              <div className="bg-white rounded-xl border border-[#e7ebf3] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#2e4150]">analytics</span>
                    <h3 className="text-sm font-bold text-[#0d121b]">Overall Compliance Score</h3>
                  </div>
                  <span className="text-xs text-[#6b7a99] bg-[#f5f7fa] px-3 py-1 rounded-full">ISO 45001 / ISO 9001</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Staff Compliance', pct: Math.round((MOCK_STAFF_SUMMARY.compliant / MOCK_STAFF_SUMMARY.total) * 100), stroke: '#22c55e' },
                    { label: 'Document Control', pct: Math.round((MOCK_DOCUMENT_SUMMARY.approved / MOCK_DOCUMENT_SUMMARY.total) * 100), stroke: '#3b82f6' },
                    { label: 'Training Coverage', pct: 72, stroke: '#f59e0b' },
                    { label: 'Site Safety', pct: 60, stroke: '#ef4444' },
                  ].map(item => (
                    <div key={item.label} className="text-center">
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e7ebf3" strokeWidth="3" />
                          <circle
                            cx="18" cy="18" r="15.9"
                            fill="none"
                            stroke={item.stroke}
                            strokeWidth="3"
                            strokeDasharray={`${item.pct} ${100 - item.pct}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#0d121b]">
                          {item.pct}%
                        </span>
                      </div>
                      <p className="text-xs text-[#6b7a99] font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts panel — fixed right side */}
            <div className="w-80 flex-shrink-0 hidden xl:flex flex-col" style={{ minHeight: '600px' }}>
              <AlertsPanel alerts={MOCK_COMPLIANCE_ALERTS} />
            </div>
          </div>
        )}

        {/* Mobile alerts panel */}
        {!loading && (
          <div className="xl:hidden mt-5">
            <AlertsPanel alerts={MOCK_COMPLIANCE_ALERTS} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceDashboard;
