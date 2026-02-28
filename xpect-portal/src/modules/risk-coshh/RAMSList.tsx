import React, { useState, useMemo } from 'react';
import { MOCK_RAMS } from './mockData';
import { RAMS, RAMSStatus } from './types';

interface Props {
  onSelectRAMS: (id: string) => void;
  onBack: () => void;
}

export const addedRAMS: RAMS[] = [];

const statusBadge = (status: RAMSStatus) => {
  const map: Record<RAMSStatus, { cls: string; label: string }> = {
    approved:        { cls: 'bg-green-100 text-green-700 border border-green-200',  label: 'Approved' },
    draft:           { cls: 'bg-gray-100 text-gray-600 border border-gray-200',     label: 'Draft' },
    review_required: { cls: 'bg-amber-100 text-amber-700 border border-amber-200',  label: 'Review Required' },
  };
  return map[status];
};

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const SITES = [
  'St. Mary\'s Hospital — Ward B',
  'Meridian Tower — Floors 12-18',
  'Westside Primary School',
  'Hartley & Co Headquarters',
  'Greenfield Industrial Unit 7',
  'NHS Trust East — Main Reception',
];

const CLIENTS = [
  'NHS Trust East',
  'Meridian Capital Group',
  'Westside Academy Trust',
  'Hartley & Co',
  'Greenfield Logistics',
];

const SUPERVISORS = [
  'Patricia Nwachukwu', 'Tom Briggs', 'Richard Hammond',
  'Amanda Foster', 'Claire Ashton',
];

interface RAMSForm {
  siteName: string;
  clientName: string;
  description: string;
  workingHours: string;
  status: RAMSStatus;
  supervisor: string;
  workMethod: string;
  emergencyProcedures: string;
}

const emptyForm: RAMSForm = {
  siteName: '', clientName: '', description: '', workingHours: '',
  status: 'draft', supervisor: '', workMethod: '', emergencyProcedures: '',
};

const RAMSList: React.FC<Props> = ({ onSelectRAMS, onBack }) => {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState<RAMSStatus | ''>('');
  const [ramsList, setRamsList]   = useState<RAMS[]>([...addedRAMS, ...MOCK_RAMS]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm]               = useState<RAMSForm>({ ...emptyForm });
  const [formErrors, setFormErrors]   = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg]   = useState('');

  const setField = (key: keyof RAMSForm, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setFormErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const flash = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.siteName.trim())     e.siteName     = 'Site name is required.';
    if (!form.clientName.trim())   e.clientName   = 'Client name is required.';
    if (!form.description.trim())  e.description  = 'Work description is required.';
    if (!form.workingHours.trim()) e.workingHours = 'Working hours are required.';
    if (!form.supervisor.trim())   e.supervisor   = 'Supervisor is required.';
    return e;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    const nextNum = MOCK_RAMS.length + addedRAMS.length + 1;
    const newRAMS: RAMS = {
      id: `rams-${String(nextNum).padStart(3, '0')}`,
      siteName: form.siteName.trim(),
      clientName: form.clientName.trim(),
      description: form.description.trim(),
      workingHours: form.workingHours.trim(),
      status: form.status,
      lastUpdated: new Date().toISOString().split('T')[0],
      supervisor: form.supervisor.trim(),
      workMethod: form.workMethod.trim() ? form.workMethod.trim().split('\n').filter(l => l.trim()) : [],
      emergencyProcedures: form.emergencyProcedures.trim() ? form.emergencyProcedures.trim().split('\n').filter(l => l.trim()) : [],
      linkedRiskAssessmentIds: [],
      signedCopyAvailable: false,
    };

    addedRAMS.unshift(newRAMS);
    setRamsList([newRAMS, ...ramsList]);
    setForm({ ...emptyForm });
    setFormErrors({});
    setIsModalOpen(false);
    flash(`RAMS "${newRAMS.siteName}" added successfully.`);
  };

  const openModal = () => {
    setForm({ ...emptyForm });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const filtered = useMemo(() => {
    let list = [...ramsList];
    if (search)       list = list.filter(r => r.siteName.toLowerCase().includes(search.toLowerCase()) || r.clientName.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) list = list.filter(r => r.status === statusFilter);
    return list;
  }, [search, statusFilter, ramsList]);

  const stats = useMemo(() => ({
    total: ramsList.length,
    approved: ramsList.filter(r => r.status === 'approved').length,
    draft: ramsList.filter(r => r.status === 'draft').length,
  }), [ramsList]);

  const fieldCls = (key: string) =>
    `w-full px-3 py-2.5 bg-[#f6f7fb] border rounded-xl text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 ${
      formErrors[key] ? 'border-red-300 focus:ring-red-300/30' : 'border-[#e7ebf3]'
    }`;

  return (
    <div className="min-h-full bg-[#f6f7fb] w-screen sm:w-full sm:max-w-full">
      <div className="bg-white border-b border-[#e7ebf3] sm:px-8 px-4 sm:py-5 py-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </button>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]">assignment</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0d121b]">RAMS — Method Statements</h1>
              <p className="text-base text-[#4c669a]">Risk Assessment & Method Statements linked to client sites</p>
            </div>
          </div>
          <button onClick={openModal} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add RAMS
          </button>
        </div>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="sm:mx-8 mx-4 mt-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-3 animate-in slide-in-from-top-2 duration-300">
          <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
          <p className="text-sm font-semibold text-green-700">{successMsg}</p>
        </div>
      )}

      <div className="sm:px-8 px-4 sm:py-6 py-3 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Total RAMS',  value: stats.total,    icon: 'assignment',    bg: 'bg-blue-50 text-blue-600' },
            { label: 'Approved',    value: stats.approved, icon: 'verified',      bg: 'bg-green-50 text-green-600' },
            { label: 'Draft',       value: stats.draft,    icon: 'draft',         bg: 'bg-gray-100 text-gray-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-4 p-2 flex items-start gap-3 flex-col">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${s.bg}`}>
                <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">{s.label}</p>
                <p className="text-xl sm:text-[30px] font-bold text-[#0d121b]">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6b7a99]">search</span>
            <input type="text" placeholder="Search site or client…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20" />
          </div>
          <select value={statusFilter} onChange={e => setStatus(e.target.value as RAMSStatus | '')}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 sm:min-w-[160px] min-w-full">
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="review_required">Review Required</option>
            <option value="draft">Draft</option>
          </select>
          {(search || statusFilter) && (
            <button onClick={() => { setSearch(''); setStatus(''); }}
              className="text-sm text-[#6b7a99] hover:text-[#0d121b] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">close</span>Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e7ebf3] bg-[#f6f7fb]">
                  {['Site Name', 'Client', 'Work Description', 'Working Hours', 'Last Updated', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {filtered.length === 0
                  ? (
                    <tr><td colSpan={7} className="px-4 py-16 text-center">
                      <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">assignment</span>
                      <p className="text-[#6b7a99] font-medium">No RAMS found</p>
                    </td></tr>
                  )
                  : filtered.map(r => {
                    const sb = statusBadge(r.status);
                    return (
                      <tr key={r.id} onClick={() => onSelectRAMS(r.id)} className="cursor-pointer hover:bg-[#f6f7fb] transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">location_on</span>
                            <span className="font-semibold text-[#0d121b]">{r.siteName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#6b7a99]">{r.clientName}</td>
                        <td className="px-4 py-4 text-[#0d121b] max-w-[200px] truncate">{r.description}</td>
                        <td className="px-4 py-4 text-[#6b7a99] whitespace-nowrap">{r.workingHours}</td>
                        <td className="px-4 py-4 text-[#6b7a99] whitespace-nowrap">{fmt(r.lastUpdated)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${sb.cls}`}>{sb.label}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-semibold text-[#2e4150] hover:underline">View</span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-[#e7ebf3] bg-[#f6f7fb] text-xs text-[#6b7a99]">
              Showing {filtered.length} of {ramsList.length} RAMS
            </div>
          )}
        </div>
      </div>

      {/* Add RAMS Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7ebf3] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2e4150] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[18px]">assignment_add</span>
                </div>
                <h2 className="text-lg font-bold text-[#0d121b]">Add New RAMS</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f6f9] transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px] text-[#4c669a]">close</span>
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Site Name <span className="text-red-500">*</span></label>
                  <select value={form.siteName} onChange={e => setField('siteName', e.target.value)} className={fieldCls('siteName')}>
                    <option value="">Select site…</option>
                    {SITES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {formErrors.siteName && <p className="text-xs text-red-500 mt-1">{formErrors.siteName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Client Name <span className="text-red-500">*</span></label>
                  <select value={form.clientName} onChange={e => setField('clientName', e.target.value)} className={fieldCls('clientName')}>
                    <option value="">Select client…</option>
                    {CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {formErrors.clientName && <p className="text-xs text-red-500 mt-1">{formErrors.clientName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Supervisor <span className="text-red-500">*</span></label>
                  <select value={form.supervisor} onChange={e => setField('supervisor', e.target.value)} className={fieldCls('supervisor')}>
                    <option value="">Select supervisor…</option>
                    {SUPERVISORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {formErrors.supervisor && <p className="text-xs text-red-500 mt-1">{formErrors.supervisor}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setField('status', e.target.value)} className={fieldCls('status')}>
                    <option value="draft">Draft</option>
                    <option value="approved">Approved</option>
                    <option value="review_required">Review Required</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Working Hours <span className="text-red-500">*</span></label>
                <input type="text" placeholder="e.g. Monday–Friday, 06:00–08:00" value={form.workingHours} onChange={e => setField('workingHours', e.target.value)} className={fieldCls('workingHours')} />
                {formErrors.workingHours && <p className="text-xs text-red-500 mt-1">{formErrors.workingHours}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Work Description <span className="text-red-500">*</span></label>
                <textarea rows={3} placeholder="Describe the work activity covered by this RAMS…"
                  value={form.description} onChange={e => setField('description', e.target.value)}
                  className={`${fieldCls('description')} resize-none`} />
                {formErrors.description && <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Work Method Steps</label>
                <textarea rows={4} placeholder="Enter each step on a new line…&#10;Step 1: Sign in at reception&#10;Step 2: Collect equipment"
                  value={form.workMethod} onChange={e => setField('workMethod', e.target.value)}
                  className={`${fieldCls('workMethod')} resize-none`} />
                <p className="text-[10px] text-[#6b7a99] mt-1">One step per line. These will appear as numbered steps.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Emergency Procedures</label>
                <textarea rows={3} placeholder="Enter each procedure on a new line…&#10;Fire: Evacuate via nearest exit&#10;Injury: Call 999"
                  value={form.emergencyProcedures} onChange={e => setField('emergencyProcedures', e.target.value)}
                  className={`${fieldCls('emergencyProcedures')} resize-none`} />
                <p className="text-[10px] text-[#6b7a99] mt-1">One procedure per line. Use "Type: Description" format.</p>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e7ebf3] shrink-0">
              <button onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#6b7a99] bg-white hover:bg-[#f6f7fb] transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save RAMS
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RAMSList;
