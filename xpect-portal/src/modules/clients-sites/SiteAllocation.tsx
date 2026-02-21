import React, { useState } from 'react';
import { MOCK_SITES, MOCK_CLIENTS, getAssignmentsBySite } from './mockData';
import { Site, WorkerAssignment } from './types';

interface SiteAllocationProps {
  onBack: () => void;
}

// Personnel pool with richer data for the design
const PERSONNEL: (WorkerAssignment & { location: string; avatar: string })[] = [
  { id: 'ua-001', workerId: 'ua-w-001', workerName: 'Sophie Williams',  workerInitials: 'SW', workerAvatarColor: 'bg-violet-500',  location: 'Manchester Central', siteId: '', siteName: '', clientId: '', completedTrainings: ['Manual Handling', 'Fire Safety', 'COSHH Awareness', 'Enhanced DBS', 'Child Safeguarding', 'CSCS Card', 'Working at Height', 'PPE Awareness', 'Biohazard Handling', 'Clinical Waste', 'Infection Control', 'Food Hygiene L2'], complianceStatus: 'Compliant',     assignedSince: '', role: 'Senior Cleaner', avatar: '' },
  { id: 'ua-002', workerId: 'ua-w-002', workerName: 'Kevin Adeyemi',    workerInitials: 'KA', workerAvatarColor: 'bg-teal-600',     location: 'Salford North',      siteId: '', siteName: '', clientId: '', completedTrainings: ['Manual Handling'],                                     complianceStatus: 'Non-Compliant', assignedSince: '', role: 'Cleaner',        avatar: '' },
  { id: 'ua-003', workerId: 'ua-w-003', workerName: 'Laura McKenna',    workerInitials: 'LM', workerAvatarColor: 'bg-pink-600',     location: 'Manchester South',   siteId: '', siteName: '', clientId: '', completedTrainings: ['Manual Handling', 'COSHH Awareness'],                    complianceStatus: 'Expiring',      assignedSince: '', role: 'Senior Cleaner', avatar: '' },
  { id: 'ua-004', workerId: 'ua-w-004', workerName: 'Daniel Chukwu',    workerInitials: 'DC', workerAvatarColor: 'bg-sky-600',      location: 'Trafford',           siteId: '', siteName: '', clientId: '', completedTrainings: ['Manual Handling', 'Fire Safety', 'COSHH Awareness', 'Enhanced DBS', 'Child Safeguarding'], complianceStatus: 'Compliant', assignedSince: '', role: 'Cleaner', avatar: '' },
  { id: 'ua-005', workerId: 'ua-w-005', workerName: 'Ola Adegoke',      workerInitials: 'OA', workerAvatarColor: 'bg-lime-600',     location: 'Eccles',             siteId: '', siteName: '', clientId: '', completedTrainings: ['Manual Handling', 'COSHH Awareness'],                    complianceStatus: 'Compliant',     assignedSince: '', role: 'Cleaner',        avatar: '' },
  { id: 'ua-006', workerId: 'ua-w-006', workerName: 'Mei Zhao',         workerInitials: 'MZ', workerAvatarColor: 'bg-orange-500',   location: 'Stretford',          siteId: '', siteName: '', clientId: '', completedTrainings: [],                                                         complianceStatus: 'Non-Compliant', assignedSince: '', role: 'New Starter',    avatar: '' },
];

type ComplianceLevel = 'Fully Compliant' | 'Partial Compliance' | 'Non-Compliant';

const evaluateCompliance = (worker: typeof PERSONNEL[0], site: Site): ComplianceLevel => {
  const missing = site.requiredTrainings.filter(t => !worker.completedTrainings.includes(t));
  if (missing.length === 0) return 'Fully Compliant';
  if (missing.length < site.requiredTrainings.length) return 'Partial Compliance';
  return 'Non-Compliant';
};

const COMPLIANCE_BADGE: Record<ComplianceLevel, string> = {
  'Fully Compliant':   'bg-green-100 text-green-700 border border-green-200',
  'Partial Compliance':'bg-amber-100 text-amber-700 border border-amber-200',
  'Non-Compliant':     'bg-red-100 text-red-700 border border-red-200',
};

const COMPLIANCE_ICON: Record<ComplianceLevel, string> = {
  'Fully Compliant':   'check_circle',
  'Partial Compliance':'warning',
  'Non-Compliant':     'cancel',
};

const COMPLIANCE_ICON_COLOR: Record<ComplianceLevel, string> = {
  'Fully Compliant':   'text-green-500',
  'Partial Compliance':'text-amber-500',
  'Non-Compliant':     'text-red-500',
};

const SiteAllocation: React.FC<SiteAllocationProps> = ({ onBack }) => {
  const [selectedSiteId, setSelectedSiteId] = useState(MOCK_SITES[0]?.id ?? '');
  const [workerSearch, setWorkerSearch]     = useState('');
  const [assigned, setAssigned]             = useState<Set<string>>(new Set());
  const [confirmWorker, setConfirmWorker]   = useState<typeof PERSONNEL[0] | null>(null);

  const selectedSite = MOCK_SITES.find(s => s.id === selectedSiteId);
  const siteClient   = selectedSite ? MOCK_CLIENTS.find(c => c.id === selectedSite.clientId) : undefined;
  const existingWorkers = selectedSite ? getAssignmentsBySite(selectedSiteId) : [];

  const filteredPersonnel = PERSONNEL.filter(p =>
    !workerSearch || p.workerName.toLowerCase().includes(workerSearch.toLowerCase())
  );

  const handleAssign = (person: typeof PERSONNEL[0]) => {
    if (!selectedSite) return;
    const level = evaluateCompliance(person, selectedSite);
    if (level === 'Non-Compliant') return;
    if (level === 'Partial Compliance') { setConfirmWorker(person); return; }
    setAssigned(prev => new Set(prev).add(person.id));
  };

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen">

      {/* ── Header ── */}
      <div className="px-8 pt-8 pb-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[#6b7a99] text-sm font-semibold hover:text-[#0d121b] transition-colors cursor-pointer mb-3">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Sites
        </button>
        <h1 className="text-[#0d121b] text-2xl font-black">Site Allocation</h1>
        <p className="text-[#6b7a99] text-sm mt-1">Assign qualified personnel to work locations based on compliance matrix.</p>
      </div>

      {/* ── Two-panel layout ── */}
      <div className="flex flex-col lg:flex-row gap-5 px-8 mt-6 mb-8">

        {/* LEFT — Site selector */}
        <div className="lg:w-[380px] shrink-0 space-y-3">
          <p className="text-xs font-bold text-[#6b7a99] uppercase tracking-wider px-1">Select Work Site</p>

          <div className="rounded-xl border border-[#e7ebf3] overflow-hidden bg-white shadow-sm divide-y divide-[#f0f2f7]">
            {MOCK_SITES.slice(0, 6).map(site => {
              const cl = MOCK_CLIENTS.find(c => c.id === site.clientId);
              const isSelected = site.id === selectedSiteId;
              const RISK_DOT: Record<string, string> = { Low: 'bg-green-500', Medium: 'bg-amber-400', High: 'bg-red-500' };

              return (
                <button
                  key={site.id}
                  onClick={() => setSelectedSiteId(site.id)}
                  className={`w-full text-left px-4 py-4 transition-all cursor-pointer ${isSelected ? 'bg-[#2e4150]/5 border-l-2 border-[#2e4150]' : 'hover:bg-[#fafbfc]'}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${RISK_DOT[site.riskLevel]}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${isSelected ? 'text-[#2e4150]' : 'text-[#0d121b]'}`}>{site.name}</p>
                      <p className="text-xs text-[#6b7a99] mt-0.5">{cl?.address ?? site.address}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {site.requiredTrainings.slice(0, 3).map(t => (
                          <span key={t} className="text-[10px] font-bold uppercase tracking-wide bg-[#e7ebf3] text-[#4c669a] px-1.5 py-0.5 rounded">
                            {t.length > 10 ? t.slice(0, 8) + '…' : t}
                          </span>
                        ))}
                        {site.requiredTrainings.length > 3 && (
                          <span className="text-[10px] font-bold uppercase tracking-wide bg-[#e7ebf3] text-[#4c669a] px-1.5 py-0.5 rounded">
                            +{site.requiredTrainings.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Compliance Rule box */}
          <div className="rounded-xl bg-[#2e4150] text-white p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-[22px] text-white/80 mt-0.5 shrink-0">verified_user</span>
            <div>
              <p className="text-sm font-black mb-1">Compliance Rule</p>
              <p className="text-xs text-white/70 leading-relaxed">
                Assignment is strictly restricted to workers who hold all mandatory certifications required for the selected site.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT — Available Personnel */}
        <div className="flex-1 min-w-0">
          <div className="rounded-xl border border-[#e7ebf3] shadow-sm bg-white overflow-hidden h-full">

            {/* Panel header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#e7ebf3]">
              <p className="text-base font-black text-[#0d121b]">Available Personnel</p>
              <label className="flex items-center h-9 bg-[#f6f7fb] rounded-lg px-3 border border-[#e7ebf3] focus-within:border-[#2e4150]/40 transition-all w-52">
                <span className="material-symbols-outlined text-[#9aa5be] text-[16px] mr-1.5">search</span>
                <input
                  className="bg-transparent border-none text-[#0d121b] placeholder:text-[#9aa5be] text-sm outline-none w-full"
                  placeholder="Search workers..."
                  value={workerSearch}
                  onChange={e => setWorkerSearch(e.target.value)}
                />
              </label>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-2 bg-[#f8fafc] border-b border-[#e7ebf3]">
              <p className="text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Worker</p>
              <p className="text-xs font-bold text-[#6b7a99] uppercase tracking-wider w-44 text-center">Compliance Indicator</p>
              <p className="text-xs font-bold text-[#6b7a99] uppercase tracking-wider w-32 text-right">Action</p>
            </div>

            {/* Personnel rows */}
            <div className="divide-y divide-[#f0f2f7]">
              {filteredPersonnel.length === 0 ? (
                <div className="py-14 text-center">
                  <span className="material-symbols-outlined text-[#d1d5db] text-4xl block mb-2">search_off</span>
                  <p className="text-[#6b7a99] text-sm font-semibold">No workers match your search</p>
                </div>
              ) : filteredPersonnel.map(person => {
                const compliance = selectedSite ? evaluateCompliance(person, selectedSite) : 'Non-Compliant';
                const isAssigned = assigned.has(person.id);
                const canAssign  = compliance === 'Fully Compliant' || compliance === 'Partial Compliance';
                const missingTrainings = selectedSite
                  ? selectedSite.requiredTrainings.filter(t => !person.completedTrainings.includes(t))
                  : [];

                return (
                  <div key={person.id} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-4">
                    {/* Worker info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-full ${person.workerAvatarColor} flex items-center justify-center shrink-0 text-white text-sm font-black`}>
                        {person.workerInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#0d121b]">{person.workerName}</p>
                        <p className="text-xs text-[#6b7a99]">{person.location}</p>
                        {missingTrainings.length > 0 && (
                          <p className="text-xs text-red-500 font-medium mt-0.5 truncate">
                            Missing: {missingTrainings.slice(0, 2).join(', ')}{missingTrainings.length > 2 ? ` +${missingTrainings.length - 2}` : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Compliance badge */}
                    <div className="w-44 flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${COMPLIANCE_BADGE[compliance]}`}>
                        <span className={`material-symbols-outlined text-[14px] ${COMPLIANCE_ICON_COLOR[compliance]}`}>
                          {COMPLIANCE_ICON[compliance]}
                        </span>
                        {compliance.toUpperCase()}
                      </span>
                    </div>

                    {/* Action */}
                    <div className="w-32 flex justify-end">
                      {isAssigned ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 font-bold bg-green-100 border border-green-200 px-3 py-2 rounded-lg">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Assigned
                        </span>
                      ) : canAssign ? (
                        <button
                          onClick={() => handleAssign(person)}
                          className="h-9 px-4 rounded-lg bg-[#2e4150] text-white text-xs font-bold hover:bg-[#253545] transition-all cursor-pointer uppercase tracking-wide shadow-sm"
                        >
                          Assign to Site
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-[#9aa5be] uppercase tracking-wide">Ineligible</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Currently assigned */}
            {existingWorkers.length > 0 && (
              <div className="border-t border-[#e7ebf3] px-5 py-3 bg-[#f8fafc]">
                <p className="text-xs font-bold text-[#6b7a99] uppercase tracking-wide mb-2">
                  Already assigned to this site ({existingWorkers.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {existingWorkers.map(w => (
                    <div key={w.id} className="flex items-center gap-1.5 bg-white border border-[#e7ebf3] rounded-full px-2.5 py-1">
                      <div className={`w-5 h-5 rounded-full ${w.workerAvatarColor} flex items-center justify-center text-white text-[9px] font-black`}>
                        {w.workerInitials}
                      </div>
                      <span className="text-xs font-medium text-[#0d121b]">{w.workerName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Confirmation dialog ── */}
      {confirmWorker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-amber-600 text-[24px]">warning</span>
            </div>
            <h3 className="text-[#0d121b] font-black text-lg text-center mb-2">Partial Compliance</h3>
            <p className="text-[#6b7a99] text-sm text-center mb-6">
              <strong className="text-[#0d121b]">{confirmWorker.workerName}</strong> does not hold all required certifications for this site.
              Assigning them may breach compliance rules. Do you wish to proceed?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmWorker(null)}
                className="flex-1 h-10 rounded-xl border border-[#e7ebf3] text-sm font-bold text-[#0d121b] hover:bg-[#f8fafc] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => { setAssigned(prev => new Set(prev).add(confirmWorker.id)); setConfirmWorker(null); }}
                className="flex-1 h-10 rounded-xl bg-[#2e4150] text-white text-sm font-bold hover:bg-[#253545] transition-all cursor-pointer"
              >
                Assign Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteAllocation;
