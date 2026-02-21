import React, { useState } from 'react';
import { getClientById, getSitesByClient, getAssignmentsByClient, contractHealth, daysUntil } from './mockData';

interface ClientDetailProps {
  clientId: string;
  onBack: () => void;
  onSelectSite: (siteId: string) => void;
}

const STATUS_STYLES = {
  Valid:    { badge: 'bg-green-100 text-green-700 border border-green-200',  label: 'Active' },
  Expiring: { badge: 'bg-amber-100 text-amber-700 border border-amber-200',  label: 'Expiring Soon' },
  Expired:  { badge: 'bg-red-100 text-red-700 border border-red-200',        label: 'Expired' },
};

const COMPLIANCE_STYLES = {
  Compliant:        { badge: 'bg-green-100 text-green-700 border border-green-200',  dot: 'bg-green-500' },
  Expiring:         { badge: 'bg-amber-100 text-amber-700 border border-amber-200',  dot: 'bg-amber-400' },
  'Non-Compliant':  { badge: 'bg-red-100 text-red-700 border border-red-200',        dot: 'bg-red-500' },
};

const RISK_STYLES = {
  Low:    'bg-green-100 text-green-700 border border-green-200',
  Medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  High:   'bg-red-100 text-red-700 border border-red-200',
};

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }); }
  catch { return d; }
};

type Tab = 'overview' | 'sites' | 'workers' | 'documents';

const ClientDetail: React.FC<ClientDetailProps> = ({ clientId, onBack, onSelectSite }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const client = getClientById(clientId);
  if (!client) return (
    <div className="flex-1 flex items-center justify-center p-10">
      <p className="text-[#6b7a99]">Client not found.</p>
    </div>
  );

  const sites       = getSitesByClient(clientId);
  const assignments = getAssignmentsByClient(clientId);
  const health      = contractHealth(client);
  const ss          = STATUS_STYLES[health];

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview',  label: `Overview` },
    { key: 'sites',     label: `Sites (${sites.length})` },
    { key: 'workers',   label: `Workers (${assignments.length})` },
    { key: 'documents', label: 'Documents' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f6f7fb] min-h-screen">

      {/* Page header */}
      <div className="bg-white border-b border-[#e7ebf3] px-8 py-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[#6b7a99] text-sm font-semibold hover:text-[#0d121b] transition-colors cursor-pointer mb-3">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Clients
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[#0d121b] text-2xl font-black">{client.name}</h1>
            <p className="text-[#6b7a99] text-sm mt-0.5">{client.industry} · {client.contactPerson}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1.5 rounded text-sm font-bold uppercase tracking-wide ${ss.badge}`}>
            {ss.label}
          </span>
        </div>
      </div>

      <div className="flex-1 px-8 py-6 space-y-5">

        {/* Meta strip */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Email',            value: client.email },
              { label: 'Phone',            value: client.phone },
              { label: 'Contract Start',   value: formatDate(client.contractStart) },
              { label: 'Contract End',     value: formatDate(client.contractEnd),     warn: daysUntil(client.contractEnd) < 30 },
              { label: 'Insurance Expiry', value: formatDate(client.insuranceExpiry), warn: daysUntil(client.insuranceExpiry) < 30 },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs font-semibold text-[#6b7a99] mb-0.5">{item.label}</p>
                <p className={`text-sm font-bold ${item.warn ? 'text-amber-600' : 'text-[#0d121b]'}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 bg-white border border-[#e7ebf3] rounded-xl p-1 w-fit shadow-sm">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === t.key
                  ? 'bg-[#2e4150] text-white shadow-sm'
                  : 'text-[#6b7a99] hover:bg-[#f6f7fb]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5 space-y-3">
              <h3 className="text-[#0d121b] font-black text-sm uppercase tracking-wide">Contract Summary</h3>
              {[
                { label: 'Total Sites',    value: String(sites.length) },
                { label: 'Total Workers',  value: String(assignments.length) },
                { label: 'Non-Compliant',  value: String(assignments.filter(a => a.complianceStatus === 'Non-Compliant').length) },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#f0f2f7] last:border-0">
                  <p className="text-sm text-[#6b7a99] font-medium">{item.label}</p>
                  <p className="text-sm font-bold text-[#0d121b]">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5 space-y-3">
              <h3 className="text-[#0d121b] font-black text-sm uppercase tracking-wide">Notes</h3>
              <p className="text-sm text-[#0d121b] leading-relaxed">{client.notes ?? 'No notes on file.'}</p>
            </div>
          </div>
        )}

        {/* Tab: Sites */}
        {activeTab === 'sites' && (
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
            {sites.length === 0 ? (
              <div className="py-14 text-center">
                <span className="material-symbols-outlined text-[#c7c7c7] text-4xl block mb-2">location_off</span>
                <p className="text-[#6b7a99] text-sm font-semibold">No sites for this client</p>
              </div>
            ) : (
              <table className="w-full min-w-[550px]">
                <thead>
                  <tr className="border-b border-[#e7ebf3] bg-[#f8fafc]">
                    <th className="text-left px-6 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Site Name</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Address</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Risk</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Workers</th>
                    <th className="text-right px-6 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f2f7]">
                  {sites.map(site => (
                    <tr key={site.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-[#0d121b]">{site.name}</td>
                      <td className="px-4 py-4 text-sm text-[#6b7a99]">{site.postcode}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold uppercase ${RISK_STYLES[site.riskLevel]}`}>
                          {site.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-[#0d121b]">{site.activeWorkers}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onSelectSite(site.id)}
                          className="text-blue-600 text-xs font-bold hover:text-blue-800 transition-colors uppercase tracking-wide cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Workers */}
        {activeTab === 'workers' && (
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
            {assignments.length === 0 ? (
              <div className="py-14 text-center">
                <span className="material-symbols-outlined text-[#c7c7c7] text-4xl block mb-2">person_off</span>
                <p className="text-[#6b7a99] text-sm font-semibold">No workers assigned</p>
              </div>
            ) : (
              <table className="w-full min-w-[550px]">
                <thead>
                  <tr className="border-b border-[#e7ebf3] bg-[#f8fafc]">
                    <th className="text-left px-6 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Worker</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Assigned Site</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f2f7]">
                  {assignments.map(a => {
                    const cs = COMPLIANCE_STYLES[a.complianceStatus];
                    return (
                      <tr key={a.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${a.workerAvatarColor} flex items-center justify-center shrink-0`}>
                              <span className="text-white text-xs font-black">{a.workerInitials}</span>
                            </div>
                            <p className="text-sm font-bold text-[#0d121b]">{a.workerName}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-[#6b7a99] font-medium">{a.siteName}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-[#0d121b]">{a.role}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${cs.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cs.dot}`} />
                            {a.complianceStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Documents */}
        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Service Level Agreement (SLA)', icon: 'description',      desc: 'Upload the signed SLA document.' },
              { label: 'Public Liability Insurance',    icon: 'shield',            desc: 'Current insurance certificate.' },
              { label: 'Risk Assessment',               icon: 'health_and_safety', desc: 'Site risk assessment document.' },
              { label: 'Contract Agreement',            icon: 'gavel',             desc: 'Signed contract PDF.' },
            ].map(doc => (
              <div key={doc.label} className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#f0f2f7] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#6b7a99] text-[20px]">{doc.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#0d121b]">{doc.label}</p>
                  <p className="text-xs text-[#6b7a99] mt-0.5">{doc.desc}</p>
                  <button className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[14px]">upload</span>
                    Upload Document
                  </button>
                </div>
                <span className="text-xs text-[#9aa5be] bg-[#f8fafc] border border-[#e7ebf3] px-2 py-1 rounded font-medium">Not uploaded</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-[#9aa5be] pb-4">
          © 2024 Xpect Group. All worker records are encrypted and stored in compliance with GDPR regulations.
        </p>
      </div>
    </div>
  );
};

export default ClientDetail;
