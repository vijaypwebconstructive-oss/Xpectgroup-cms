import React, { useState, useMemo, useEffect } from 'react';
import { useClientsSites } from '../../context/ClientsSitesContext';
import { useCleaners } from '../../context/CleanersContext';
import { useTraining } from '../../context/TrainingContext';
import { Site, WorkerAssignment } from './types';
import { getInitials } from '../../views/trainingMockData';

interface SiteAllocationProps {
  onBack: () => void;
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-pink-500', 'bg-emerald-500', 'bg-violet-500',
  'bg-orange-500', 'bg-rose-500', 'bg-sky-500', 'bg-teal-500',
  'bg-indigo-500', 'bg-amber-500', 'bg-cyan-500', 'bg-lime-500',
];

/** Map training course names to site-required training names */
const mapCourseToRequired = (course: string): string | null => {
  const c = course.toLowerCase();
  if (c.includes('manual handling')) return 'Manual Handling';
  if (c.includes('coshh')) return 'COSHH Awareness';
  if (c.includes('fire safety')) return 'Fire Safety';
  if (c.includes('dbs') || c.includes('enhanced dbs')) return 'Enhanced DBS';
  if (c.includes('child safeguarding') || c.includes('safeguarding')) return 'Child Safeguarding';
  if (c.includes('biohazard')) return 'Biohazard Handling';
  if (c.includes('clinical waste')) return 'Clinical Waste';
  if (c.includes('infection control')) return 'Infection Control';
  if (c.includes('working at height') || c.includes('height')) return 'Working at Height';
  if (c.includes('ppe')) return 'PPE Awareness';
  if (c.includes('cscs')) return 'CSCS Card';
  if (c.includes('first aid')) return 'First Aid';
  if (c.includes('food hygiene')) return 'Food Hygiene L2';
  return null;
};

export type PersonnelItem = WorkerAssignment & { location: string; avatar: string };

type ComplianceLevel = 'Fully Compliant' | 'Partial Compliance' | 'Non-Compliant';

const evaluateCompliance = (worker: PersonnelItem, site: Site): ComplianceLevel => {
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
  const { sites: allSites, clients: allClients, getAssignmentsBySite, assignments: allAssignments, addAssignment, removeAssignment, getSiteCountByWorker } = useClientsSites();
  const { cleaners, loading: cleanersLoading, error: cleanersError } = useCleaners();
  const { trainingRecords } = useTraining();

  const [selectedSiteId, setSelectedSiteId] = useState(allSites[0]?.id ?? '');
  const [workerSearch, setWorkerSearch]     = useState('');
  const [, setAssignmentsVersion]           = useState(0);
  const [confirmWorker, setConfirmWorker]   = useState<PersonnelItem | null>(null);

  const personnel: PersonnelItem[] = useMemo(() => {
    const nameLower = (s: string) => s.trim().toLowerCase();
    return cleaners.map((c, i) => {
      const trained = trainingRecords.filter(
        tr => nameLower(tr.name) === nameLower(c.name) && tr.status === 'Trained'
      );
      const completedTrainings: string[] = [];
      trained.forEach(tr => {
        const mapped = mapCourseToRequired(tr.course);
        if (mapped && !completedTrainings.includes(mapped)) completedTrainings.push(mapped);
      });
      let complianceStatus: 'Compliant' | 'Expiring' | 'Non-Compliant' = 'Non-Compliant';
      if (completedTrainings.length > 0) {
        complianceStatus = completedTrainings.length >= 3 ? 'Compliant' : 'Expiring';
      }
      return {
        id: `personnel-${c.id}`,
        workerId: c.id,
        workerName: c.name,
        workerInitials: getInitials(c.name),
        workerAvatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
        location: c.location || '—',
        siteId: '',
        siteName: '',
        clientId: '',
        completedTrainings,
        complianceStatus,
        assignedSince: '',
        role: 'Cleaner',
        avatar: c.avatar || '',
      };
    });
  }, [cleaners, trainingRecords]);

  useEffect(() => {
    if (allSites.length > 0 && (!selectedSiteId || !allSites.some(s => s.id === selectedSiteId))) {
      setSelectedSiteId(allSites[0].id);
    }
  }, [allSites, selectedSiteId]);

  const selectedSite = allSites.find(s => s.id === selectedSiteId);
  const existingWorkers = selectedSite ? getAssignmentsBySite(selectedSiteId) : [];

  const filteredPersonnel = personnel.filter(p =>
    !workerSearch || p.workerName.toLowerCase().includes(workerSearch.toLowerCase())
  );

  const isAssignedToSelectedSite = (workerId: string) =>
    selectedSiteId && allAssignments.some(a => a.workerId === workerId && a.siteId === selectedSiteId);

  const doAssign = async (person: PersonnelItem) => {
    if (!selectedSite) return;
    if (isAssignedToSelectedSite(person.workerId)) return;
    const level = evaluateCompliance(person, selectedSite);
    if (level === 'Non-Compliant') return;
    const newAssignment: Omit<WorkerAssignment, 'id'> = {
      workerId: person.workerId,
      workerName: person.workerName,
      workerInitials: person.workerInitials,
      workerAvatarColor: person.workerAvatarColor,
      siteId: selectedSite.id,
      siteName: selectedSite.name,
      clientId: selectedSite.clientId,
      completedTrainings: person.completedTrainings,
      complianceStatus: person.complianceStatus,
      assignedSince: new Date().toISOString().split('T')[0],
      role: person.role,
    };
    await addAssignment(newAssignment);
    setAssignmentsVersion(v => v + 1);
  };

  const handleAssign = (person: PersonnelItem) => {
    if (!selectedSite) return;
    const level = evaluateCompliance(person, selectedSite);
    if (level === 'Non-Compliant') return;
    if (level === 'Partial Compliance') { setConfirmWorker(person); return; }
    doAssign(person);
  };

  const handleUnassign = async (workerId: string) => {
    if (!selectedSiteId) return;
    await removeAssignment(workerId, selectedSiteId);
    setAssignmentsVersion(v => v + 1);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f2f6f9] min-h-screen max-w-screen sm:w-full sm:max-w-full ">

      {/* ── Header ── */}
      <div className=" sm:px-8 px-4 sm:pt-8 pt-3 pb-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[#6b7a99] text-sm font-semibold hover:text-[#0d121b] transition-colors cursor-pointer mb-3">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Sites
        </button>
        <h1 className="text-[#0d121b] text-2xl font-black font-semibold sm:text-[28px]">Site Allocation</h1>
        <p className="text-[#4c669a] text-base mt-1">Assign qualified personnel to work locations based on compliance matrix.</p>
        <p className="text-ms font-bold text-[#333] capitalize  tracking-wider px-1 pt-3">Select Work Site</p>
      </div>

      {/* ── Two-panel layout ── */}
      <div className="flex flex-col lg:flex-row gap-5 sm:px-8 px-4 sm:mt-6 mt-3 mb-8">

        {/* LEFT — Site selector */}
        <div className="lg:w-[380px] shrink-0 space-y-3">
          {/* <p className="text-xs font-bold text-[#6b7a99] uppercase tracking-wider px-1">Select Work Site</p> */}

          <div className="rounded-xl border border-[#e7ebf3] overflow-y-scroll h-[560px] bg-white shadow-sm divide-y divide-[#f0f2f7]">
            {allSites.map(site => {
              const cl = allClients.find(c => c.id === site.clientId);
              const isSelected = site.id === selectedSiteId;
              const RISK_DOT: Record<string, string> = { Low: 'bg-green-500', Medium: 'bg-amber-400', High: 'bg-red-500' };

              return (
                <button
                  key={site.id}
                  onClick={() => setSelectedSiteId(site.id)}
                  className={`w-full text-left px-4 py-4 transition-all cursor-pointer ${isSelected ? 'bg-[#2e4150]/5 border-l-2 border-[#2e4150]/50' : 'hover:bg-[#fafbfc]'}`}
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
        <div className="flex-1  overflow-x-scroll sm:min-w-0  max-w-[350px] sm:max-w-full ">
          <div className="rounded-xl border border-[#e7ebf3] shadow-sm bg-white h-full min-w-[500px]">

            {/* Panel header */}
            <div className="flex items-center justify-between gap-3 sm:px-5 px-3 sm:py-4 py-3 border-b border-[#e7ebf3]">
              <p className="text-base font-black font-semibold text-[#0d121b]">Available Personnel</p>
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
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2 bg-[#f8fafc] border-b border-[#e7ebf3] ">
              <p className="text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Worker</p>
              <p className="text-xs font-bold text-[#6b7a99] uppercase tracking-wider w-24 text-center">Assigned</p>
              <p className="text-xs font-bold text-[#6b7a99] uppercase tracking-wider w-44 text-center">Compliance Indicator</p>
              <p className="text-xs font-bold text-[#6b7a99] uppercase tracking-wider w-32 text-right">Action</p>
            </div>

            {/* Personnel rows */}
            <div className="divide-y divide-[#f0f2f7]">
              {cleanersLoading ? (
                <div className="py-14 text-center">
                  <span className="material-symbols-outlined text-[#4c669a] text-4xl animate-spin block mb-2">progress_activity</span>
                  <p className="text-[#4c669a] text-sm font-semibold">Loading personnel…</p>
                </div>
              ) : cleanersError ? (
                <div className="py-14 text-center">
                  <span className="material-symbols-outlined text-red-500 text-[48px] block mb-2">error</span>
                  <p className="text-red-600 text-sm font-semibold">{cleanersError}</p>
                </div>
              ) : filteredPersonnel.length === 0 ? (
                <div className="py-14 text-center">
                  <span className="material-symbols-outlined text-[#d1d5db] text-4xl block mb-2">search_off</span>
                  <p className="text-[#6b7a99] text-sm font-semibold">
                    {personnel.length === 0 ? 'No employees in the system' : 'No workers match your search'}
                  </p>
                </div>
              ) : filteredPersonnel.map(person => {
                const compliance = selectedSite ? evaluateCompliance(person, selectedSite) : 'Non-Compliant';
                const isAssigned = isAssignedToSelectedSite(person.workerId);
                const siteCount = getSiteCountByWorker(person.workerId);
                const sitesLabel = siteCount === 1 ? '1 site' : `${siteCount} sites`;
                const canAssign  = compliance === 'Fully Compliant' || compliance === 'Partial Compliance';
                const missingTrainings = selectedSite
                  ? selectedSite.requiredTrainings.filter(t => !person.completedTrainings.includes(t))
                  : [];

                return (
                  <div key={person.id} className="grid grid-cols-[1fr_auto_auto_auto] min-w-full gap-4 items-center px-5 py-4">
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

                    {/* Sites assigned */}
                    <div className="w-24 flex justify-center">
                      <span className="text-xs font-semibold text-[#4c669a]">{sitesLabel}</span>
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
                        <button
                          onClick={() => handleUnassign(person.workerId)}
                          className="h-9 px-4 rounded-lg border border-red-200 text-red-600 bg-red-50 text-xs font-bold hover:bg-red-100 transition-all cursor-pointer uppercase tracking-wide"
                        >
                          Unassign
                        </button>
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
                onClick={async () => { await doAssign(confirmWorker); setConfirmWorker(null); }}
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
