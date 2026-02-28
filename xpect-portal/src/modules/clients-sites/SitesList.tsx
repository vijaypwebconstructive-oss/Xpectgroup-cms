import React, { useState } from 'react';
import { Site, RiskLevel } from './types';
import { MOCK_SITES, MOCK_CLIENTS, MOCK_ASSIGNMENTS } from './mockData';
import { addedClients } from './ClientsList';

interface SitesListProps {
  onSelectSite:         (siteId: string) => void;
  onNavigateAllocation: () => void;
}

const RISK_BADGE = {
  Low:    'bg-green-100 text-green-700 border border-green-200',
  Medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  High:   'bg-red-100 text-red-700 border border-red-200',
};

const COMPLIANCE_BADGE = {
  Compliant:       'bg-green-100 text-green-700 border border-green-200',
  Expiring:        'bg-amber-100 text-amber-700 border border-amber-200',
  'Non-Compliant': 'bg-red-100 text-red-700 border border-red-200',
};

type ComplianceKey = 'Compliant' | 'Expiring' | 'Non-Compliant';

const TRAINING_OPTIONS = [
  'Manual Handling', 'COSHH Awareness', 'Fire Safety', 'Enhanced DBS',
  'Child Safeguarding', 'Biohazard Handling', 'Clinical Waste',
  'Infection Control', 'CSCS Card', 'Working at Height', 'PPE Awareness',
  'Food Hygiene L2', 'First Aid',
];

interface SiteForm {
  name: string;
  clientId: string;
  address: string;
  postcode: string;
  riskLevel: string;
  emergencyContact: string;
  emergencyPhone: string;
  accessInstructions: string;
  requiredTrainings: string[];
  riskAssessmentDoc: string;
  floorPlanDoc: string;
  accessPermitDoc: string;
  fireSafetyDoc: string;
  coshhAssessmentDoc: string;
  siteInductionDoc: string;
}

const emptyForm: SiteForm = {
  name: '', clientId: '', address: '', postcode: '', riskLevel: '',
  emergencyContact: '', emergencyPhone: '', accessInstructions: '',
  requiredTrainings: [],
  riskAssessmentDoc: '', floorPlanDoc: '', accessPermitDoc: '',
  fireSafetyDoc: '', coshhAssessmentDoc: '', siteInductionDoc: '',
};

export const addedSites: Site[] = [];

const SitesList: React.FC<SitesListProps> = ({ onSelectSite, onNavigateAllocation }) => {
  const [search, setSearch]             = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [riskFilter, setRiskFilter]     = useState('');
  const [sites, setSites]               = useState<Site[]>([...MOCK_SITES, ...addedSites]);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [form, setForm]                 = useState<SiteForm>(emptyForm);
  const [formErrors, setFormErrors]     = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg]     = useState('');

  const setField = (k: keyof SiteForm, v: string | string[]) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (formErrors[k]) setFormErrors(prev => { const n = { ...prev }; delete n[k]; return n; });
  };

  const toggleTraining = (t: string) => {
    setForm(prev => ({
      ...prev,
      requiredTrainings: prev.requiredTrainings.includes(t)
        ? prev.requiredTrainings.filter(x => x !== t)
        : [...prev.requiredTrainings, t],
    }));
  };

  const flash = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Site name is required.';
    if (!form.clientId) e.clientId = 'Please select a client.';
    if (!form.address.trim()) e.address = 'Address is required.';
    if (!form.postcode.trim()) e.postcode = 'Postcode is required.';
    if (!form.riskLevel) e.riskLevel = 'Risk level is required.';
    if (!form.emergencyContact.trim()) e.emergencyContact = 'Emergency contact name is required.';
    if (!form.emergencyPhone.trim()) e.emergencyPhone = 'Emergency phone is required.';
    return e;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    const newSite: Site = {
      id: `site-${Date.now()}`,
      name: form.name.trim(),
      clientId: form.clientId,
      address: form.address.trim(),
      postcode: form.postcode.trim().toUpperCase(),
      riskLevel: form.riskLevel as RiskLevel,
      requiredTrainings: form.requiredTrainings,
      emergencyContact: form.emergencyContact.trim(),
      emergencyPhone: form.emergencyPhone.trim(),
      accessInstructions: form.accessInstructions.trim(),
      activeWorkers: 0,
    };
    addedSites.unshift(newSite);
    setSites(prev => [newSite, ...prev]);
    setForm(emptyForm);
    setIsModalOpen(false);
    flash(`Site "${newSite.name}" added successfully.`);
  };

  const openModal = () => { setForm(emptyForm); setFormErrors({}); setIsModalOpen(true); };

  const docField = (label: string, key: keyof SiteForm, icon: string) => (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-[#c7d2e0] bg-[#fafbfd] hover:border-[#2e4150]/40 transition-colors">
      <span className="material-symbols-outlined text-[22px] text-[#4c669a]">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0d121b]">{label}</p>
        {form[key] ? (
          <p className="text-xs text-green-600 font-semibold truncate">{form[key] as string}</p>
        ) : (
          <p className="text-xs text-[#4c669a]">No file selected</p>
        )}
      </div>
      <label className="px-3 py-1.5 rounded-lg bg-[#f2f6f9] text-[#4c669a] text-xs font-bold hover:bg-[#e7ebf3] transition-colors cursor-pointer">
        Browse
        <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={e => { const f = e.target.files?.[0]; if (f) setField(key, f.name); e.target.value = ''; }} />
      </label>
      {form[key] && (
        <button type="button" onClick={() => setField(key, '')} className="text-red-400 hover:text-red-600 transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      )}
    </div>
  );

  const totalSites    = sites.length;
  const highRisk      = sites.filter(s => s.riskLevel === 'High').length;
  const nonCompliant  = MOCK_ASSIGNMENTS.filter(a => a.complianceStatus === 'Non-Compliant').length;
  const totalWorkers  = MOCK_ASSIGNMENTS.length;

  const allClients = [...MOCK_CLIENTS, ...addedClients];

  const enriched = sites.map(s => {
    const client      = allClients.find(c => c.id === s.clientId);
    const assignments = MOCK_ASSIGNMENTS.filter(a => a.siteId === s.id);
    const nonC = assignments.filter(a => a.complianceStatus === 'Non-Compliant').length;
    const exp  = assignments.filter(a => a.complianceStatus === 'Expiring').length;
    const overallStatus: ComplianceKey =
      nonC > 0 ? 'Non-Compliant' : exp > 0 ? 'Expiring' : 'Compliant';
    return { ...s, client, assignmentCount: assignments.length, overallStatus };
  });

  const filtered = enriched.filter(s => {
    const q = search.toLowerCase();
    return (
      (!q || s.name.toLowerCase().includes(q) || s.postcode.toLowerCase().includes(q)) &&
      (!clientFilter || s.clientId === clientFilter) &&
      (!riskFilter   || s.riskLevel === riskFilter)
    );
  });

  return (
    <div className="space-y-6 max-w-screen sm:w-full sm:max-w-full">

      {/* Success toast */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 animate-in fade-in duration-300">
          <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
          <p className="text-green-800 text-sm font-bold">{successMsg}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sites',    value: totalSites,   icon: 'location_city', iconColor: 'text-[#2e4150]' },
          { label: 'Total Workers',  value: totalWorkers, icon: 'group',         iconColor: 'text-[#2e4150]' },
          { label: 'High Risk',      value: highRisk,     icon: 'warning',       iconColor: 'text-amber-500' },
          { label: 'Non-Compliant',  value: nonCompliant, icon: 'person_off',    iconColor: 'text-red-600'   },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-5 flex flex-col gap-3">
            <div className="flex flex-col gap-1 sm:gap-3 justify-between items-left">
              <span className={`material-symbols-outlined text-[22px] sm:text-[30px] p-2 w-fit rounded-[12px] sm:p-3 bg-[#f2f6f9] ${s.iconColor}`}>{s.icon}</span>
              <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">{s.label}</p>
              <p className="text-[30px] font-bold text-[#000]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">

        {/* Filter bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e7ebf3] flex-wrap">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            <div className="flex items-center h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 flex-1 min-w-[180px] focus-within:border-[#2e4150]/40 transition-all">
              <span className="material-symbols-outlined text-[#9aa5be] text-[18px] mr-2">search</span>
              <input
                className="bg-transparent border-none text-[#0d121b] placeholder:text-[#9aa5be] text-sm outline-none w-full"
                placeholder="Search site name or postcode..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              value={clientFilter}
              onChange={e => setClientFilter(e.target.value)}
              className="h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 text-sm text-[#0d121b] outline-none cursor-pointer font-semibold sm:min-w-[160px] min-w-full"
            >
              <option value="">All Clients</option>
              {allClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className="h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 text-sm text-[#0d121b] outline-none cursor-pointer font-semibold sm:min-w-[160px] min-w-full"
            >
              <option value="">All Risk Levels</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNavigateAllocation}
              className="flex items-center gap-2 rounded-full border border-[#e7ebf3] bg-white text-[#0d121b] text-xs font-bold hover:bg-[#f6f6f8] transition-all px-4 h-9 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">assignment_ind</span>
              Allocate
            </button>
            <button
              onClick={openModal}
              className="flex items-center gap-2 rounded-full bg-[#2e4150] text-white text-xs font-bold hover:bg-[#2e4150]/90 transition-all px-4 h-9 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Site
            </button>
          </div>
        </div>

        {/* Table header with record count */}
        <div className="px-5 py-3 border-b border-[#e7ebf3] flex items-center gap-3">
          <h2 className="text-[#0d121b] text-sm sm:text-base font-black font-semibold">Site Records</h2>
          <span className="bg-[#f2f6f9] text-[#4c669a] text-xs font-bold px-2.5 py-1 rounded-full">{filtered.length} records</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#e7ebf3] bg-[#f8fafc]">
                <th className="text-left px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Site Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Client</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Postcode</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Risk Level</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Required Trainings</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Workers</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Compliance</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7ebf3]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center">
                    <span className="material-symbols-outlined text-[#c7c7c7] text-5xl block mb-2">search_off</span>
                    <p className="text-[#4c669a] text-sm font-semibold">No sites match your filters</p>
                  </td>
                </tr>
              ) : filtered.map(site => (
                <tr key={site.id} className="hover:bg-[#f8fafc] transition-colors group">
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-[#0d121b]">{site.name}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-[#0d121b]">{site.client?.name ?? '—'}</p>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-[#4c669a] whitespace-nowrap">{site.postcode}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black uppercase font-semibold tracking-wide ${RISK_BADGE[site.riskLevel]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${site.riskLevel === 'Low' ? 'bg-green-500' : site.riskLevel === 'Medium' ? 'bg-amber-400' : 'bg-red-500'}`} />
                      {site.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {site.requiredTrainings.slice(0, 2).map(t => (
                        <span key={t} className="text-xs bg-[#f2f6f9] text-[#4c669a] border border-[#e7ebf3] px-2 py-0.5 rounded font-semibold">
                          {t.length > 12 ? t.slice(0, 10) + '…' : t}
                        </span>
                      ))}
                      {site.requiredTrainings.length > 2 && (
                        <span className="text-xs bg-[#f2f6f9] text-[#4c669a] border border-[#e7ebf3] px-2 py-0.5 rounded font-bold">
                          +{site.requiredTrainings.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#0d121b]">{site.assignmentCount}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold font-black uppercase tracking-wide ${COMPLIANCE_BADGE[site.overallStatus]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${site.overallStatus === 'Compliant' ? 'bg-green-500' : site.overallStatus === 'Expiring' ? 'bg-amber-400' : 'bg-red-500'}`} />
                      {site.overallStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => onSelectSite(site.id)}
                      className="text-[#4c669a] text-xs font-black capitalize tracking-wide transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-[#e7ebf3] bg-[#f8fafc] flex items-center justify-between">
          <p className="text-xs text-[#4c669a]">
            Showing <span className="font-bold text-[#0d121b]">{filtered.length}</span> of <span className="font-bold text-[#0d121b]">{sites.length}</span> sites
          </p>
        </div>
      </div>

      {/* Add Site Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7ebf3] sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px] text-[#2e4150]">add_location_alt</span>
                <h2 className="text-lg font-bold text-[#0d121b]">Add New Site</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f6f9] transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px] text-[#4c669a]">close</span>
              </button>
            </div>

            {/* Form body */}
            <div className="px-6 py-5 space-y-5">

              {/* Section: Site Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#2e4150]">location_city</span>
                  <h3 className="text-sm font-bold text-[#0d121b] uppercase tracking-wide">Site Details</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0d121b] mb-1">Site Name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter site name" value={form.name} onChange={e => setField('name', e.target.value)}
                    className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none ${formErrors.name ? 'border-red-400' : 'border-[#c7d2e0]'}`} />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">Client <span className="text-red-500">*</span></label>
                    <select value={form.clientId} onChange={e => setField('clientId', e.target.value)}
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none cursor-pointer ${formErrors.clientId ? 'border-red-400' : 'border-[#c7d2e0]'}`}>
                      <option value="">Select client…</option>
                      {allClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {formErrors.clientId && <p className="text-red-500 text-xs mt-1">{formErrors.clientId}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">Risk Level <span className="text-red-500">*</span></label>
                    <select value={form.riskLevel} onChange={e => setField('riskLevel', e.target.value)}
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none cursor-pointer ${formErrors.riskLevel ? 'border-red-400' : 'border-[#c7d2e0]'}`}>
                      <option value="">Select risk level…</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    {formErrors.riskLevel && <p className="text-red-500 text-xs mt-1">{formErrors.riskLevel}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0d121b] mb-1">Address <span className="text-red-500">*</span></label>
                  <textarea rows={2} placeholder="Full site address" value={form.address} onChange={e => setField('address', e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-sm text-[#0d121b] bg-white outline-none resize-none ${formErrors.address ? 'border-red-400' : 'border-[#c7d2e0]'}`} />
                  {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0d121b] mb-1">Postcode <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="e.g. M2 4WQ" value={form.postcode} onChange={e => setField('postcode', e.target.value)}
                    className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none ${formErrors.postcode ? 'border-red-400' : 'border-[#c7d2e0]'}`} />
                  {formErrors.postcode && <p className="text-red-500 text-xs mt-1">{formErrors.postcode}</p>}
                </div>
              </div>

              <hr className="border-[#e7ebf3]" />

              {/* Section: Emergency & Access */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#2e4150]">emergency</span>
                  <h3 className="text-sm font-bold text-[#0d121b] uppercase tracking-wide">Emergency & Access</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">Emergency Contact Name <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Contact name" value={form.emergencyContact} onChange={e => setField('emergencyContact', e.target.value)}
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none ${formErrors.emergencyContact ? 'border-red-400' : 'border-[#c7d2e0]'}`} />
                    {formErrors.emergencyContact && <p className="text-red-500 text-xs mt-1">{formErrors.emergencyContact}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">Emergency Phone <span className="text-red-500">*</span></label>
                    <input type="tel" placeholder="+44 xxx xxx xxxx" value={form.emergencyPhone} onChange={e => setField('emergencyPhone', e.target.value)}
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none ${formErrors.emergencyPhone ? 'border-red-400' : 'border-[#c7d2e0]'}`} />
                    {formErrors.emergencyPhone && <p className="text-red-500 text-xs mt-1">{formErrors.emergencyPhone}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0d121b] mb-1">Access Instructions</label>
                  <textarea rows={2} placeholder="e.g. Key fob from reception. Code: 4412." value={form.accessInstructions} onChange={e => setField('accessInstructions', e.target.value)}
                    className="w-full rounded-xl border border-[#c7d2e0] px-3 py-2 text-sm text-[#0d121b] bg-white outline-none resize-none" />
                </div>
              </div>

              <hr className="border-[#e7ebf3]" />

              {/* Section: Required Trainings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#2e4150]">school</span>
                  <h3 className="text-sm font-bold text-[#0d121b] uppercase tracking-wide">Required Trainings</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRAINING_OPTIONS.map(t => (
                    <button key={t} type="button" onClick={() => toggleTraining(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        form.requiredTrainings.includes(t)
                          ? 'bg-[#2e4150] text-white border-[#2e4150]'
                          : 'bg-white text-[#4c669a] border-[#e7ebf3] hover:border-[#2e4150]/40'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
                {form.requiredTrainings.length > 0 && (
                  <p className="text-xs text-[#4c669a]">{form.requiredTrainings.length} training{form.requiredTrainings.length > 1 ? 's' : ''} selected</p>
                )}
              </div>

              <hr className="border-[#e7ebf3]" />

              {/* Section: Site Documents */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#2e4150]">folder_open</span>
                  <h3 className="text-sm font-bold text-[#0d121b] uppercase tracking-wide">Site Documents</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {docField('Risk Assessment', 'riskAssessmentDoc', 'assignment_late')}
                  {docField('Floor Plan / Layout', 'floorPlanDoc', 'map')}
                  {docField('Access Permit', 'accessPermitDoc', 'key')}
                  {docField('Fire Safety Certificate', 'fireSafetyDoc', 'local_fire_department')}
                  {docField('COSHH Assessment', 'coshhAssessmentDoc', 'science')}
                  {docField('Site Induction Pack', 'siteInductionDoc', 'menu_book')}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e7ebf3] sticky bottom-0 bg-white rounded-b-2xl">
              <button type="button" onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-full border border-[#c7d2e0] text-[#4c669a] text-sm font-bold hover:bg-[#f2f6f9] transition-all cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Add Site
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SitesList;
