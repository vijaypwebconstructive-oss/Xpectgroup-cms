import React, { useState } from 'react';
import { useIncidents } from '../../context/IncidentsContext';

interface Props {
  incidentId: string;
  onBack: () => void;
}

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDt = (d: string) => {
  const dt = new Date(d);
  return `${dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} ${dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
};

const typeBadge = (t: string) => ({
  'Accident':               'bg-red-50 text-red-700',
  'Near Miss':              'bg-amber-50 text-amber-700',
  'Property Damage':        'bg-orange-50 text-orange-700',
  'Client Complaint':       'bg-purple-50 text-purple-700',
  'Environmental Incident': 'bg-teal-50 text-teal-700',
}[t] ?? 'bg-gray-50 text-gray-700');

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-0.5">{label}</p>
    <p className="text-sm font-medium text-[#0d121b]">{value || '—'}</p>
  </div>
);

const IncidentDetail: React.FC<Props> = ({ incidentId, onBack }) => {
  const { getIncidentById, deleteIncident } = useIncidents();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const incident = getIncidentById(incidentId);

  const handleDelete = async () => {
    try {
      await deleteIncident(incidentId);
      setShowDeleteConfirm(false);
      onBack();
    } catch {
      // Could show error toast
    }
  };

  if (!incident) {
    return (
      <div className="min-h-full bg-[#f6f7fb] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">report_problem</span>
          <p className="text-[#6b7a99]">Incident not found</p>
          <button onClick={onBack} className="mt-4 text-sm text-[#2e4150] font-semibold hover:underline">← Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f6f7fb]">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] sm:px-8 px-4 sm:py-5 py-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Incidents
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[24px]">report_problem</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-[#0d121b] font-mono">{incident.id}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${typeBadge(incident.type)}`}>{incident.type}</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  incident.injuryOccurred
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${incident.injuryOccurred ? 'bg-red-500' : 'bg-green-500'}`} />
                  Injury: {incident.injuryOccurred ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Delete
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDeleteConfirm(false)} role="dialog" aria-modal="true" aria-labelledby="delete-incident-title">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 id="delete-incident-title" className="text-lg font-bold text-[#0d121b] mb-2">Delete Incident</h3>
            <p className="text-sm text-[#6b7a99] mb-6">
              Are you sure you want to delete incident &quot;{incident.id}&quot;? This will also remove all associated corrective actions. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 cursor-pointer">Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-[#e7ebf3] text-[#2e4150] text-sm font-semibold hover:bg-[#f6f7fb] cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="sm:px-8 px-4 sm:py-6 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">

            {/* Incident Details card */}
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
              <h3 className="text-sm font-bold text-[#0d121b] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">info</span>
                Incident Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <InfoRow label="Date & Time"         value={fmtDt(incident.date)} />
                <InfoRow label="Site"                value={incident.site} />
                <InfoRow label="Reported By"         value={incident.worker} />
                <InfoRow label="Incident Type"       value={incident.type} />
                <InfoRow label="Supervisor Notified" value={incident.supervisorNotified ? 'Yes' : 'No'} />
              </div>
              <div className="mt-4 pt-4 border-t border-[#e7ebf3]">
                <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Description</p>
                <p className="text-sm text-[#0d121b] leading-relaxed">{incident.description}</p>
              </div>
            </div>

            {/* People Involved / Immediate Actions */}
            {incident.immediateActionTaken && (
              <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
                <h3 className="text-sm font-bold text-[#0d121b] mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">bolt</span>
                  Immediate Actions Taken
                </h3>
                <p className="text-sm text-[#0d121b] leading-relaxed">{incident.immediateActionTaken}</p>
              </div>
            )}

            {/* Injury & Damage */}
            {(incident.injuryOccurred || incident.propertyDamage) && (
              <div className="bg-red-50 rounded-xl border border-red-200 shadow-sm p-6">
                <h3 className="text-sm font-bold text-red-700 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">medical_services</span>
                  Injury & Damage
                </h3>
                <div className="space-y-3">
                  {incident.injuryOccurred && (
                    <div>
                      <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-0.5">Injury</p>
                      <p className="text-sm text-[#0d121b]">{incident.injuryDescription}</p>
                      {incident.medicalTreatmentRequired && (
                        <span className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white">
                          Medical treatment required
                        </span>
                      )}
                    </div>
                  )}
                  {incident.propertyDamage && (
                    <div>
                      <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-0.5">Property Damage</p>
                      <p className="text-sm text-[#0d121b]">{incident.propertyDamage}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {incident.witnessNotes && (
              <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
                <h3 className="text-sm font-bold text-[#0d121b] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">record_voice_over</span>
                  Witness Statement
                </h3>
                <p className="text-sm text-[#0d121b] italic leading-relaxed">"{incident.witnessNotes}"</p>
              </div>
            )}

            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
              <h3 className="text-sm font-bold text-[#0d121b] mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">photo_camera</span>
                Photo Evidence
              </h3>
              {incident.hasPhotos ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                  <p className="text-sm font-semibold text-[#0d121b]">Photos attached</p>
                </div>
              ) : (
                <div className="p-6 border-2 border-dashed border-[#e7ebf3] rounded-xl text-center">
                  <span className="material-symbols-outlined text-[28px] text-[#e7ebf3] block mb-1">photo_camera</span>
                  <p className="text-xs text-[#6b7a99]">No photos attached</p>
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
              <h3 className="text-sm font-bold text-[#0d121b] mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">summarize</span>
                Quick Summary
              </h3>
              <div className="space-y-3">
                <InfoRow label="Incident Date" value={fmt(incident.date)} />
                <InfoRow label="Reported By"   value={incident.worker} />
                <InfoRow label="Site"          value={incident.site} />
                <InfoRow label="Injury"        value={incident.injuryOccurred ? 'Yes' : 'No'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetail;
