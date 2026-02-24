import React, { useState } from 'react';
import { getIncidentById, getActionsByIncident, MOCK_ACTIONS, daysUntil } from './mockData';
import { Incident, CorrectiveAction, RootCause, ActionStatus, Severity, IncidentStatus } from './types';

interface Props {
  incidentId: string;
  onBack: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDt = (d: string) => {
  const dt = new Date(d);
  return `${dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} ${dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
};

const severityBadge = (s: Severity) => ({
  Low:      'bg-green-100 text-green-700 border border-green-200',
  Medium:   'bg-amber-100 text-amber-700 border border-amber-200',
  High:     'bg-red-100 text-red-700 border border-red-200',
  Critical: 'bg-red-200 text-red-800 border border-red-400',
}[s]);

const statusBadge = (s: IncidentStatus) => ({
  Open:                 { cls: 'bg-red-100 text-red-700 border border-red-200',       icon: 'radio_button_unchecked' },
  Investigating:        { cls: 'bg-blue-100 text-blue-700 border border-blue-200',    icon: 'manage_search' },
  'Corrective Action':  { cls: 'bg-amber-100 text-amber-700 border border-amber-200', icon: 'build_circle' },
  Closed:               { cls: 'bg-green-100 text-green-700 border border-green-200', icon: 'check_circle' },
}[s]);

const actionStatusBadge = (s: ActionStatus) => ({
  Open:        { cls: 'bg-red-100 text-red-700 border border-red-200',       label: 'Open' },
  'In Progress': { cls: 'bg-amber-100 text-amber-700 border border-amber-200', label: 'In Progress' },
  Completed:   { cls: 'bg-green-100 text-green-700 border border-green-200', label: 'Completed' },
}[s]);

const ROOT_CAUSES: RootCause[] = [
  'Human error', 'Lack of training', 'Unsafe condition',
  'Equipment failure', 'Procedure not followed', 'Unknown',
];

const STATUS_FLOW: IncidentStatus[] = ['Open', 'Investigating', 'Corrective Action', 'Closed'];

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-0.5">{label}</p>
    <p className="text-sm font-medium text-[#0d121b]">{value || '—'}</p>
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

const IncidentDetail: React.FC<Props> = ({ incidentId, onBack }) => {
  const [, forceUpdate] = useState(0);
  const [newAction, setNewAction] = useState({ description: '', assignedTo: '', dueDate: '' });
  const [showAddAction, setShowAddAction] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'investigation' | 'actions' | 'closure'>('summary');

  const incident = getIncidentById(incidentId);
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

  const actions = getActionsByIncident(incidentId);
  const isClosed = incident.status === 'Closed';
  const allActionsComplete = actions.length > 0 && actions.every(a => a.status === 'Completed');
  const canClose = allActionsComplete && incident.status !== 'Closed';

  // Mutate helpers
  const updateIncident = (patch: Partial<Incident>) => {
    Object.assign(incident, patch);
    forceUpdate(n => n + 1);
  };

  const updateActionStatus = (actionId: string, status: ActionStatus) => {
    const a = MOCK_ACTIONS.find(x => x.id === actionId);
    if (a) {
      a.status = status;
      if (status === 'Completed') a.completedDate = new Date().toISOString().split('T')[0];
    }
    forceUpdate(n => n + 1);
  };

  const addCorrectiveAction = () => {
    if (!newAction.description.trim() || !newAction.assignedTo || !newAction.dueDate) return;
    const nextNum = MOCK_ACTIONS.length + 1;
    const ca: CorrectiveAction = {
      id: `CA-${String(nextNum).padStart(3, '0')}`,
      incidentId,
      description: newAction.description.trim(),
      assignedTo: newAction.assignedTo,
      dueDate: newAction.dueDate,
      status: 'Open',
    };
    MOCK_ACTIONS.push(ca);
    setNewAction({ description: '', assignedTo: '', dueDate: '' });
    setShowAddAction(false);
    forceUpdate(n => n + 1);
  };

  const closeIncident = () => {
    if (!canClose) return;
    updateIncident({
      status: 'Closed',
      closedDate: new Date().toISOString().split('T')[0],
      closedBy: 'Current User',
    });
  };

  const sb = statusBadge(incident.status);
  const TABS = [
    { id: 'summary',       label: 'Summary',       icon: 'info' },
    { id: 'investigation', label: 'Investigation',  icon: 'manage_search' },
    { id: 'actions',       label: `Actions (${actions.length})`, icon: 'build_circle' },
    { id: 'closure',       label: 'Closure',        icon: 'lock' },
  ] as const;

  return (
    <div className="min-h-full bg-[#f6f7fb]">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] sm:px-8 px-4 sm:py-5 py-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Incidents
        </button>
        <div className="flex items-start gap-4 flex-wrap">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            incident.severity === 'Critical' ? 'bg-red-700' : incident.severity === 'High' ? 'bg-red-500' : 'bg-[#2e4150]'
          }`}>
            <span className="material-symbols-outlined text-white text-[24px]">report_problem</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[#0d121b] font-mono">{incident.id}</h1>
              {incident.severity === 'Critical' && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-700 text-white uppercase tracking-wide">RIDDOR</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#f0f2f7] text-[#2e4150]">{incident.type}</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${severityBadge(incident.severity)}`}>
                {incident.severity} Severity
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sb.cls}`}>
                <span className="material-symbols-outlined text-[13px]">{sb.icon}</span>
                {incident.status}
              </span>
            </div>
          </div>
        </div>

        {/* Status stepper */}
        <div className="mt-5 flex items-center gap-0 max-w-lg">
          {STATUS_FLOW.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex-1 flex flex-col items-center gap-1`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  incident.status === s       ? 'bg-[#2e4150] text-white ring-2 ring-[#2e4150]/30' :
                  STATUS_FLOW.indexOf(incident.status) > i ? 'bg-green-500 text-white' :
                  'bg-[#f0f2f7] text-[#6b7a99]'
                }`}>
                  {STATUS_FLOW.indexOf(incident.status) > i
                    ? <span className="material-symbols-outlined text-[14px]">check</span>
                    : i + 1}
                </div>
                <p className={`text-[10px] font-semibold text-center leading-tight ${incident.status === s ? 'text-[#0d121b]' : 'text-[#6b7a99]'}`}>{s}</p>
              </div>
              {i < STATUS_FLOW.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 mx-1 ${STATUS_FLOW.indexOf(incident.status) > i ? 'bg-green-400' : 'bg-[#e7ebf3]'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Critical/High alert banner */}
      {(incident.severity === 'Critical' || incident.severity === 'High') && incident.status !== 'Closed' && (
        <div className={`mx-8 mt-5 flex items-start gap-3 rounded-xl px-5 py-4 border ${
          incident.severity === 'Critical' ? 'bg-red-50 border-red-300' : 'bg-red-50 border-red-200'
        }`}>
          <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0 mt-0.5">emergency</span>
          <div>
            <p className="text-sm font-bold text-red-700">
              {incident.severity === 'Critical'
                ? 'CRITICAL — Immediate management escalation required. Check RIDDOR obligations.'
                : 'HIGH SEVERITY — Ensure investigation is assigned and underway within 24 hours.'}
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {incident.type === 'Accident' && incident.medicalTreatmentRequired
                ? 'Medical treatment was required. Ensure welfare of worker is confirmed.'
                : 'Ensure all immediate control measures remain in place.'}
            </p>
          </div>
        </div>
      )}

      <div className="sm:px-8 px-4 sm:py-6 py-3">
        {/* Tabs */}
        <div className="flex gap-1 sm:flex-row flex-col mb-6 bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-1 w-fit w-full">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === t.id ? 'bg-[#2e4150] text-white' : 'text-[#6b7a99] hover:text-[#0d121b] hover:bg-[#f6f7fb]'
              }`}>
              <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: Summary ─────────────────────────────────────────────────────── */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* Basic info card */}
              <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
                <h3 className="text-sm font-bold text-[#0d121b] mb-4">Incident Details</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <InfoRow label="Date & Time"     value={fmtDt(incident.date)} />
                  <InfoRow label="Site"            value={incident.site} />
                  <InfoRow label="Worker"          value={incident.worker} />
                  <InfoRow label="Investigator"    value={incident.investigator} />
                  <InfoRow label="Supervisor Notified" value={incident.supervisorNotified ? 'Yes' : 'No'} />
                </div>
                <div className="mt-4 pt-4 border-t border-[#e7ebf3]">
                  <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Description</p>
                  <p className="text-sm text-[#0d121b] leading-relaxed">{incident.description}</p>
                </div>
              </div>

              {/* Injury / damage */}
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

              {/* Immediate action */}
              {incident.immediateActionTaken && (
                <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
                  <h3 className="text-sm font-bold text-[#0d121b] mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">bolt</span>
                    Immediate Actions Taken
                  </h3>
                  <p className="text-sm text-[#0d121b] leading-relaxed">{incident.immediateActionTaken}</p>
                </div>
              )}
            </div>

            {/* Right — witness notes, photos */}
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
                    {!isClosed && <button className="mt-2 text-xs font-semibold text-[#2e4150] hover:underline">Upload Photos</button>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Investigation ────────────────────────────────────────────────── */}
        {activeTab === 'investigation' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6 space-y-5">
                <h3 className="text-sm font-bold text-[#0d121b] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">manage_search</span>
                  Investigation Details
                </h3>

                {/* Assign investigator */}
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Assigned Investigator</label>
                  {isClosed ? (
                    <p className="text-sm text-[#0d121b]">{incident.investigator ?? '—'}</p>
                  ) : (
                    <select value={incident.investigator ?? ''}
                      onChange={e => updateIncident({ investigator: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[#f6f7fb] border border-[#e7ebf3] rounded-xl text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20">
                      <option value="">Select investigator…</option>
                      {['Patricia Nwachukwu','Tom Briggs','Richard Hammond','Amanda Foster','Claire Ashton'].map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Root cause */}
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Root Cause</label>
                  {isClosed ? (
                    <p className="text-sm text-[#0d121b]">{incident.rootCause ?? '—'}</p>
                  ) : (
                    <select value={incident.rootCause ?? ''}
                      onChange={e => updateIncident({ rootCause: e.target.value as RootCause })}
                      className="w-full px-3 py-2.5 bg-[#f6f7fb] border border-[#e7ebf3] rounded-xl text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20">
                      <option value="">Select root cause…</option>
                      {ROOT_CAUSES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  )}
                </div>

                {/* Investigation notes */}
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Investigation Notes</label>
                  {isClosed ? (
                    <p className="text-sm text-[#0d121b] leading-relaxed">{incident.investigationNotes ?? '—'}</p>
                  ) : (
                    <textarea rows={5} placeholder="Document investigation findings, evidence reviewed, interviews conducted…"
                      value={incident.investigationNotes ?? ''}
                      onChange={e => updateIncident({ investigationNotes: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[#f6f7fb] border border-[#e7ebf3] rounded-xl text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 resize-none" />
                  )}
                </div>

                {!isClosed && (
                  <button onClick={() => updateIncident({ status: 'Investigating' })}
                    disabled={incident.status === 'Investigating' || incident.status === 'Corrective Action' || incident.status === 'Closed'}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <span className="material-symbols-outlined text-[18px]">manage_search</span>
                    Mark as Investigating
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5 h-fit">
              <h3 className="text-sm font-bold text-[#0d121b] mb-3">ISO 45001 Guidance</h3>
              <div className="space-y-3 text-xs text-[#6b7a99]">
                <p><span className="font-bold text-[#0d121b]">Clause 10.2:</span> Incidents must be investigated to determine root causes and identify corrective actions to prevent recurrence.</p>
                <p><span className="font-bold text-[#0d121b]">Timeliness:</span> Initial investigation within 24–48 hours. Full report within 30 days for High/Critical.</p>
                <p><span className="font-bold text-[#0d121b]">Documentation:</span> All investigation notes form part of the incident audit trail and must not be deleted.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Actions ─────────────────────────────────────────────────────── */}
        {activeTab === 'actions' && (
          <div className="space-y-5 max-w-[350px] sm:max-w-full">
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
              <div className="sm:px-6 px-4 sm:py-4 py-3 border-b border-[#e7ebf3] flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-[#0d121b] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">build_circle</span>
                  Corrective Actions
                </h3>
                {!isClosed && (
                  <button onClick={() => setShowAddAction(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2e4150] text-white text-xs font-semibold hover:bg-[#3a5268] transition-colors">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add Action
                  </button>
                )}
              </div>

              {/* Add action form */}
              {showAddAction && !isClosed && (
                <div className="px-6 py-4 border-b border-[#e7ebf3] bg-[#f6f7fb] space-y-3">
                  <textarea rows={2} placeholder="Describe the corrective action required…"
                    value={newAction.description} onChange={e => setNewAction(n => ({ ...n, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#e7ebf3] rounded-xl text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 resize-none" />
                  <div className="flex gap-3">
                    <select value={newAction.assignedTo} onChange={e => setNewAction(n => ({ ...n, assignedTo: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-white border border-[#e7ebf3] rounded-xl text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20">
                      <option value="">Assign to…</option>
                      {['Patricia Nwachukwu','Tom Briggs','Richard Hammond','Amanda Foster','Claire Ashton'].map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                    <input type="date" value={newAction.dueDate} onChange={e => setNewAction(n => ({ ...n, dueDate: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-white border border-[#e7ebf3] rounded-xl text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20" />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={addCorrectiveAction}
                      disabled={!newAction.description.trim() || !newAction.assignedTo || !newAction.dueDate}
                      className="px-4 py-2 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      Save Action
                    </button>
                    <button type="button" onClick={() => setShowAddAction(false)}
                      className="px-4 py-2 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#6b7a99] bg-white hover:bg-[#f6f7fb] transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {actions.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <span className="material-symbols-outlined text-[36px] text-[#e7ebf3] block mb-2">build_circle</span>
                  <p className="text-sm text-[#6b7a99]">No corrective actions yet</p>
                  {!isClosed && <button onClick={() => setShowAddAction(true)} className="mt-2 text-sm font-semibold text-[#2e4150] hover:underline">Add the first action</button>}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#e7ebf3] bg-[#f6f7fb]">
                        {['ID', 'Description', 'Assigned To', 'Due Date', 'Status', isClosed ? '' : 'Update'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e7ebf3]">
                      {actions.map(a => {
                        const ab = actionStatusBadge(a.status);
                        const overdue = a.status !== 'Completed' && daysUntil(a.dueDate) < 0;
                        return (
                          <tr key={a.id} className={overdue ? 'bg-red-50/40' : ''}>
                            <td className="px-4 py-3 text-xs font-mono font-bold text-[#6b7a99]">{a.id}</td>
                            <td className="px-4 py-3 text-[#0d121b] max-w-[240px]">
                              <p>{a.description}</p>
                              {overdue && <span className="text-[10px] text-red-500 font-bold mt-0.5 block">OVERDUE</span>}
                            </td>
                            <td className="px-4 py-3 text-[#0d121b] whitespace-nowrap">{a.assignedTo}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`text-sm font-medium ${overdue ? 'text-red-600' : 'text-[#6b7a99]'}`}>{fmt(a.dueDate)}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${ab.cls}`}>{ab.label}</span>
                            </td>
                            {!isClosed && (
                              <td className="px-4 py-3">
                                <select value={a.status} onChange={e => updateActionStatus(a.id, e.target.value as ActionStatus)}
                                  className="px-2 py-1 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-xs text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20">
                                  <option value="Open">Open</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Progress summary */}
            {actions.length > 0 && (
              <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-[#0d121b]">Action Progress</p>
                  <p className="text-sm text-[#6b7a99]">{actions.filter(a => a.status === 'Completed').length} / {actions.length} completed</p>
                </div>
                <div className="w-full bg-[#e7ebf3] rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${(actions.filter(a => a.status === 'Completed').length / actions.length) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Closure ──────────────────────────────────────────────────────── */}
        {activeTab === 'closure' && (
          <div className="max-w-xl">
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6 space-y-5">
              <h3 className="text-sm font-bold text-[#0d121b] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">lock</span>
                Closure Panel
              </h3>

              {isClosed ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <span className="material-symbols-outlined text-green-500 text-[24px]">check_circle</span>
                    <div>
                      <p className="text-sm font-bold text-green-700">Incident Closed</p>
                      <p className="text-xs text-green-600 mt-0.5">Closed on {fmt(incident.closedDate ?? '')} by {incident.closedBy}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <InfoRow label="Closed Date" value={fmt(incident.closedDate ?? '')} />
                    <InfoRow label="Closed By"   value={incident.closedBy ?? ''} />
                    <InfoRow label="Root Cause"  value={incident.rootCause ?? '—'} />
                    <InfoRow label="Total Actions" value={`${actions.length} (all completed)`} />
                  </div>
                </div>
              ) : (
                <>
                  {/* Checklist */}
                  <div className="space-y-2">
                    {[
                      { label: 'Investigation completed',      done: !!incident.investigationNotes },
                      { label: 'Root cause identified',        done: !!incident.rootCause },
                      { label: 'Investigator assigned',        done: !!incident.investigator },
                      { label: 'All corrective actions complete', done: allActionsComplete },
                    ].map(({ label, done }) => (
                      <div key={label} className={`flex items-center gap-3 p-3 rounded-xl border ${done ? 'bg-green-50 border-green-200' : 'bg-[#f6f7fb] border-[#e7ebf3]'}`}>
                        <span className={`material-symbols-outlined text-[18px] ${done ? 'text-green-500' : 'text-[#6b7a99]'}`}>
                          {done ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className={`text-sm font-medium ${done ? 'text-green-800' : 'text-[#6b7a99]'}`}>{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Warning if cannot close */}
                  {!canClose && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      <span className="material-symbols-outlined text-amber-500 text-[18px] shrink-0 mt-0.5">warning</span>
                      <p className="text-sm font-semibold text-amber-700">
                        All corrective actions must be completed before closing this incident.
                        {actions.length === 0 && ' Add at least one corrective action.'}
                      </p>
                    </div>
                  )}

                  <button onClick={closeIncident} disabled={!canClose}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-40 bg-[#2e4150] text-white hover:bg-[#3a5268]">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    Close Incident
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentDetail;
