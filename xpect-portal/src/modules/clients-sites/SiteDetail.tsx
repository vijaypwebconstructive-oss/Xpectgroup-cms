import React, { useState } from 'react';
import { useClientsSites } from '../../context/ClientsSitesContext';

interface SiteDetailProps {
  siteId: string;
  onBack: () => void;
}

const RISK_STYLES = {
  Low:    { badge: 'bg-green-100 text-green-700 border border-green-200' },
  Medium: { badge: 'bg-amber-100 text-amber-700 border border-amber-200' },
  High:   { badge: 'bg-red-100 text-red-700 border border-red-200' },
};

const COMPLIANCE_STYLES = {
  Compliant:        { badge: 'bg-green-100 text-green-700 border border-green-200',  dot: 'bg-green-500',  label: 'Compliant' },
  Expiring:         { badge: 'bg-amber-100 text-amber-700 border border-amber-200',  dot: 'bg-amber-400',  label: 'Expiring' },
  'Non-Compliant':  { badge: 'bg-red-100 text-red-700 border border-red-200',        dot: 'bg-red-500',    label: 'Not Eligible for Site' },
};

const SiteDetail: React.FC<SiteDetailProps> = ({ siteId, onBack }) => {
  const { getSiteById, getClientById, getAssignmentsBySite, deleteSite } = useClientsSites();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const site        = getSiteById(siteId);
  const client      = site ? getClientById(site.clientId) : undefined;
  const assignments = site ? getAssignmentsBySite(siteId) : [];

  const handleDelete = async () => {
    try {
      await deleteSite(siteId);
      setShowDeleteConfirm(false);
      onBack();
    } catch {
      // Could show error toast
    }
  };

  if (!site) return (
    <div className="flex-1 flex items-center justify-center p-10">
      <p className="text-[#6b7a99]">Site not found.</p>
    </div>
  );

  const rs           = RISK_STYLES[site.riskLevel];
  const nonCompliant = assignments.filter(a => a.complianceStatus === 'Non-Compliant');

  return (
    <div className="flex-1 flex flex-col bg-[#f6f7fb] min-h-screen">

      {/* Page header */}
      <div className=" p-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[#6b7a99] text-sm font-semibold hover:text-[#0d121b] transition-colors cursor-pointer mb-3">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Sites
        </button>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[#0d121b] text-xl  sm:text-[30px] font-bold   font-black">{site.name}</h1>
            <p className="text-[#6b7a99] text-sm mt-0.5">{client?.name ?? '—'} · {site.postcode}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1.5 rounded text-sm font-bold uppercase tracking-wide ${rs.badge}`}>
              {site.riskLevel} Risk
            </span>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-semibold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Delete
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDeleteConfirm(false)} role="dialog" aria-modal="true" aria-labelledby="delete-site-title">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 id="delete-site-title" className="text-lg font-bold text-[#0d121b] mb-2">Delete Site</h3>
            <p className="text-sm text-[#6b7a99] mb-6">Are you sure you want to delete &quot;{site.name}&quot;? This will also remove all worker assignments to this site. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 cursor-pointer">Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-[#e7ebf3] text-[#2e4150] text-sm font-semibold hover:bg-[#f6f7fb] cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 px-0 py-5 space-y-5">

        {/* Non-compliant alert */}
        {nonCompliant.length > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-red-500 text-[20px]">warning</span>
            <p className="text-red-800 text-sm font-semibold">
              {nonCompliant.length} worker{nonCompliant.length > 1 ? 's are' : ' is'} not eligible for this site due to missing required training.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left col */}
          <div className="space-y-5">
            {/* Site Information */}
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
              <h3 className="text-[#0d121b] font-black text-sm uppercase tracking-wide mb-4">Site Information</h3>
              <div className="space-y-3">
                {[
                  { label: 'Full Address',      value: site.address },
                  { label: 'Postcode',          value: site.postcode },
                  { label: 'Emergency Contact', value: site.emergencyContact },
                  { label: 'Emergency Phone',   value: site.emergencyPhone },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs font-semibold text-[#6b7a99] mb-0.5">{item.label}</p>
                    <p className="text-sm font-semibold text-[#0d121b]">{item.value}</p>
                  </div>
                ))}
                <div>
                  <p className="text-xs font-semibold text-[#6b7a99] mb-0.5">Access Instructions</p>
                  <p className="text-sm text-[#0d121b] leading-relaxed">{site.accessInstructions}</p>
                </div>
              </div>
            </div>

            {/* Compliance Documents */}
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
              <h3 className="text-[#0d121b] font-black text-sm uppercase tracking-wide mb-4">Compliance Documents</h3>
              <div className="space-y-2">
                {[
                  { label: 'RAMS Document',        icon: 'health_and_safety' },
                  { label: 'Emergency Procedures', icon: 'emergency' },
                  { label: 'Site Instructions',    icon: 'list_alt' },
                ].map(doc => (
                  <div key={doc.label} className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-lg border border-[#e7ebf3]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#6b7a99] text-[17px]">{doc.icon}</span>
                      <p className="text-sm font-medium text-[#0d121b]">{doc.label}</p>
                    </div>
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">upload</span>
                      Upload
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right col */}
          <div className="lg:col-span-2 space-y-5">
            {/* Required Trainings */}
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
              <h3 className="text-[#0d121b] font-black text-sm uppercase tracking-wide mb-4">Required Trainings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {site.requiredTrainings.map(training => (
                  <div key={training} className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg border border-[#e7ebf3]">
                    <span className="material-symbols-outlined text-blue-600 text-[18px]">check_circle</span>
                    <p className="text-sm font-medium text-[#0d121b]">{training}</p>
                    <span className="ml-auto text-xs font-bold text-red-600 uppercase">Required</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned Workers */}
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e7ebf3] flex items-center gap-3">
                <h3 className="text-[#0d121b] font-black text-sm uppercase tracking-wide">Assigned Workers</h3>
                <span className="text-xs font-bold bg-[#f0f2f7] text-[#6b7a99] px-2.5 py-1 rounded-full">{assignments.length}</span>
              </div>

              {assignments.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined text-[#c7c7c7] text-4xl block mb-2">person_off</span>
                  <p className="text-[#6b7a99] text-sm font-semibold">No workers assigned to this site</p>
                </div>
              ) : (
                <div className="divide-y divide-[#f0f2f7]">
                  {assignments.map(a => {
                    const cs = COMPLIANCE_STYLES[a.complianceStatus];
                    const missingTrainings = site.requiredTrainings.filter(t => !a.completedTrainings.includes(t));
                    return (
                      <div key={a.id} className="px-5 py-4 flex items-start gap-4">
                        <div className={`w-9 h-9 rounded-full ${a.workerAvatarColor} flex items-center justify-center shrink-0`}>
                          <span className="text-white text-xs font-black">{a.workerInitials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-sm font-bold text-[#0d121b]">{a.workerName}</p>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${cs.badge}`}>
                              {cs.label}
                            </span>
                          </div>
                          <p className="text-xs text-[#6b7a99] mt-0.5">{a.role}</p>
                          {missingTrainings.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {missingTrainings.map(t => (
                                <span key={t} className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded font-medium">
                                  Missing: {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteDetail;
