import React, { useState, useMemo } from 'react';
import { useRiskCoshh } from '../../context/RiskCoshhContext';
import { SDS, SDSStatus } from './types';

interface Props {
  onBack: () => void;
  onNavigateCOSHH: () => void;
}

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const today = () => new Date().toISOString().split('T')[0];
const daysUntil = (dateStr: string): number => {
  if (!dateStr) return Infinity;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr).getTime() - now.getTime()) / 86_400_000);
};

const statusBadge = (status: SDSStatus) => {
  const map: Record<SDSStatus, { cls: string; label: string }> = {
    valid:       { cls: 'bg-green-100 text-green-700 border border-green-200',  label: 'Valid' },
    review_soon: { cls: 'bg-amber-100 text-amber-700 border border-amber-200',  label: 'Review Soon' },
    expired:     { cls: 'bg-red-100 text-red-700 border border-red-200',        label: 'Expired' },
  };
  return map[status];
};

type SDSWithComputed = SDS & { computedStatus: SDSStatus };

const computeStatus = (sds: SDS): SDSStatus => {
  const days = daysUntil(sds.reviewDate);
  if (days <= 0)  return 'expired';
  if (days <= 30) return 'review_soon';
  return 'valid';
};

const HAZARD_CLASSIFICATIONS = [
  'Irritant', 'Corrosive', 'Flammable', 'Toxic', 'Oxidising',
  'Harmful', 'Environmental Hazard', 'Explosive', 'Gas Under Pressure',
  'Health Hazard', 'Not Classified',
];

const GHS_SIGNAL_WORDS = ['Danger', 'Warning', 'None'];

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Other'];

interface SDSForm {
  chemicalName: string;
  manufacturer: string;
  revision: string;
  issueDate: string;
  reviewDate: string;
  hazardClassification: string;
  ghsSignalWord: string;
  casNumber: string;
  emergencyContact: string;
  storageRequirements: string;
  language: string;
  sdsFile: File | null;
}

const emptyForm: SDSForm = {
  chemicalName: '', manufacturer: '', revision: '',
  issueDate: today(), reviewDate: '',
  hazardClassification: '', ghsSignalWord: '', casNumber: '',
  emergencyContact: '', storageRequirements: '', language: 'English',
  sdsFile: null,
};

const SDSLibrary: React.FC<Props> = ({ onBack, onNavigateCOSHH }) => {
  const { sdsList, sdsLoading, sdsError, addSDS, getChemicalById, chemicals } = useRiskCoshh();
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState<SDSStatus | ''>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm]               = useState<SDSForm>({ ...emptyForm });
  const [formErrors, setFormErrors]   = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg]   = useState('');

  const setField = (key: keyof SDSForm, val: string | File | null) => {
    setForm(f => ({ ...f, [key]: val }));
    setFormErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const flash = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.chemicalName.trim())      e.chemicalName      = 'Chemical name is required.';
    if (!form.manufacturer.trim())      e.manufacturer      = 'Manufacturer is required.';
    if (!form.revision.trim())          e.revision          = 'Revision is required.';
    if (!form.issueDate)                e.issueDate         = 'Issue date is required.';
    if (!form.reviewDate)               e.reviewDate        = 'Review date is required.';
    if (!form.hazardClassification)     e.hazardClassification = 'Hazard classification is required.';
    if (!form.ghsSignalWord)            e.ghsSignalWord     = 'GHS signal word is required.';
    if (!form.sdsFile)                  e.sdsFile           = 'SDS document is required.';
    if (form.issueDate && form.reviewDate && form.reviewDate <= form.issueDate) {
      e.reviewDate = 'Review date must be after issue date.';
    }
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    const file = form.sdsFile!;
    const documentData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    await addSDS({
      chemicalId: '',
      chemicalName: form.chemicalName.trim(),
      issueDate: form.issueDate,
      reviewDate: form.reviewDate,
      status: 'valid',
      manufacturer: form.manufacturer.trim(),
      fileName: file.name,
      fileSize: file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(0)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      revision: form.revision.trim(),
      hazardClassification: form.hazardClassification,
      ghsSignalWord: form.ghsSignalWord,
      casNumber: form.casNumber.trim() || undefined,
      emergencyContact: form.emergencyContact.trim() || undefined,
      storageRequirements: form.storageRequirements.trim() || undefined,
      language: form.language,
      documentData,
    });
    setForm({ ...emptyForm });
    setFormErrors({});
    setIsModalOpen(false);
    flash(`SDS for "${form.chemicalName.trim()}" uploaded successfully.`);
  };

  const openModal = () => {
    setForm({ ...emptyForm });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const allSDS: SDSWithComputed[] = useMemo(() =>
    sdsList.map(s => ({ ...s, computedStatus: computeStatus(s) })),
  [sdsList]);

  const sdsWithFiles = useMemo(() => allSDS.filter(s => !!s.fileName), [allSDS]);

  const filtered = useMemo(() => {
    let list = [...sdsWithFiles];
    if (search)       list = list.filter(s => s.chemicalName.toLowerCase().includes(search.toLowerCase()) || s.manufacturer.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) list = list.filter(s => s.computedStatus === statusFilter);
    return list;
  }, [sdsWithFiles, search, statusFilter]);

  const stats = useMemo(() => ({
    total:      sdsWithFiles.length,
    valid:      sdsWithFiles.filter(s => s.computedStatus === 'valid').length,
    reviewSoon: sdsWithFiles.filter(s => s.computedStatus === 'review_soon').length,
    expired:    sdsWithFiles.filter(s => s.computedStatus === 'expired').length,
  }), [sdsWithFiles]);

  const fieldCls = (key: string) =>
    `w-full px-3 py-2.5 bg-[#f6f7fb] border rounded-xl text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 ${
      formErrors[key] ? 'border-red-300 focus:ring-red-300/30' : 'border-[#e7ebf3]'
    }`;

  return (
    <div className="min-h-full bg-[#f6f7fb] w-screen sm:max-w-full">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] sm:px-8 px-4 sm:py-5 py-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]">menu_book</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0d121b]">SDS Library</h1>
              <p className="text-base text-[#4c669a]">Safety Data Sheets — uploaded documents only</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onNavigateCOSHH}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors">
              <span className="material-symbols-outlined text-[18px]">science</span>
              COSHH Register
            </button>
            <button onClick={openModal} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Upload SDS
            </button>
          </div>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total SDS',   value: stats.total,      icon: 'menu_book',  bg: 'bg-blue-50 text-blue-600' },
            { label: 'Valid',        value: stats.valid,      icon: 'verified',   bg: 'bg-green-50 text-green-600' },
            { label: 'Review Soon',  value: stats.reviewSoon, icon: 'schedule',   bg: 'bg-amber-50 text-amber-600' },
            { label: 'Expired',      value: stats.expired,    icon: 'cancel',     bg: 'bg-red-50 text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex items-start gap-3 flex-col">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${s.bg}`}>
                <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
              </div>
              <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">{s.label}</p>
              <p className="text-xl sm:text-[30px] font-bold text-[#0d121b]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Expired alert */}
        {stats.expired > 0 && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0 mt-0.5">warning</span>
            <div>
              <p className="text-sm font-bold text-red-700">Expired SDS Sheets Detected</p>
              <p className="text-xs text-red-600 mt-0.5">
                {stats.expired} SDS document{stats.expired > 1 ? 's' : ''} have expired. Under COSHH regulations, SDS must be kept current (max 3 years). Request updated documents from manufacturers immediately.
              </p>
            </div>
          </div>
        )}

        {/* ISO info bar */}
        <div className="flex items-start gap-3 bg-[#2e4150] rounded-xl px-5 py-4">
          <span className="material-symbols-outlined text-white/70 text-[20px] shrink-0 mt-0.5">verified_user</span>
          <div>
            <p className="text-sm font-semibold text-white">REACH & COSHH Compliance</p>
            <p className="text-xs text-white/70 mt-0.5">
              Safety Data Sheets must comply with REACH Regulation (EC) No 1907/2006 Annex II and be updated whenever significant new information becomes available. Sheets older than 3 years should be refreshed.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6b7a99]">search</span>
            <input type="text" placeholder="Search chemical or manufacturer…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20" />
          </div>
          <select value={statusFilter} onChange={e => setStatus(e.target.value as SDSStatus | '')}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 min-w-full sm:min-w-[150px]">
            <option value="">All Statuses</option>
            <option value="valid">Valid</option>
            <option value="review_soon">Review Soon</option>
            <option value="expired">Expired</option>
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
                  {['Chemical Name', 'Manufacturer', 'Revision', 'Issue Date', 'Review Date', 'Status', 'Document', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {sdsLoading ? (
                  <tr><td colSpan={8} className="px-4 py-16 text-center">
                    <span className="material-symbols-outlined text-[#4c669a] text-4xl animate-spin block mb-2">progress_activity</span>
                    <p className="text-[#4c669a] font-medium">Loading SDS…</p>
                  </td></tr>
                ) : sdsError ? (
                  <tr><td colSpan={8} className="px-4 py-16 text-center">
                    <span className="material-symbols-outlined text-red-500 text-[48px] block mb-3">error</span>
                    <p className="text-red-600 font-medium">{sdsError}</p>
                  </td></tr>
                ) : filtered.length === 0
                  ? (
                    <tr><td colSpan={8} className="px-4 py-16 text-center">
                      <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">menu_book</span>
                      <p className="text-[#6b7a99] font-medium">No SDS documents found</p>
                      <p className="text-xs text-[#6b7a99] mt-1">Upload a Safety Data Sheet to get started</p>
                    </td></tr>
                  )
                  : filtered.map(s => {
                    const sb = statusBadge(s.computedStatus);
                    const chemical = getChemicalById(s.chemicalId);
                    const days = daysUntil(s.reviewDate);
                    return (
                      <tr key={s.id} className="hover:bg-[#f6f7fb] transition-colors">
                        <td className="px-4 py-4 min-w-[200px]">
                          <div>
                            <p className="font-semibold text-[#0d121b]">{s.chemicalName}</p>
                            {(chemical || s.hazardClassification) && (
                              <p className="text-xs text-[#6b7a99]">{s.hazardClassification || chemical?.hazardType}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#6b7a99]">{s.manufacturer}</td>
                        <td className="px-4 py-4 text-[#0d121b] font-mono text-xs">{s.revision}</td>
                        <td className="px-4 py-4 text-[#6b7a99] whitespace-nowrap">{fmt(s.issueDate)}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${days <= 0 ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-[#6b7a99]'}`}>
                            {fmt(s.reviewDate)}
                          </span>
                          {days > 0 && days <= 30 && <p className="text-[10px] text-amber-500 mt-0.5">In {days}d</p>}
                          {days <= 0 && <p className="text-[10px] text-red-500 mt-0.5">{Math.abs(days)}d overdue</p>}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sb.cls}`}>
                            {sb.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-[#6b7a99]">picture_as_pdf</span>
                            <div>
                              <span className="text-xs text-[#0d121b] font-medium truncate max-w-[120px] block">{s.fileName}</span>
                              {s.fileSize && <span className="text-[10px] text-[#6b7a99]">{s.fileSize}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button className="text-sm font-semibold text-[#2e4150] hover:underline">Download</button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-[#e7ebf3] bg-[#f6f7fb] text-xs text-[#6b7a99]">
              Showing {filtered.length} of {sdsWithFiles.length} SDS documents
            </div>
          )}
        </div>
      </div>

      {/* Upload SDS Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7ebf3] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2e4150] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[18px]">upload_file</span>
                </div>
                <h2 className="text-lg font-bold text-[#0d121b]">Upload Safety Data Sheet</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f6f9] transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px] text-[#4c669a]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              {/* Chemical Name */}
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Chemical Name <span className="text-red-500">*</span></label>
                <input type="text" list="chem-suggestions" placeholder="e.g. Sodium Hypochlorite" value={form.chemicalName}
                  onChange={e => setField('chemicalName', e.target.value)} className={fieldCls('chemicalName')} />
                <datalist id="chem-suggestions">
                  {chemicals.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
                {formErrors.chemicalName && <p className="text-xs text-red-500 mt-1">{formErrors.chemicalName}</p>}
              </div>

              {/* Manufacturer + Revision */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Manufacturer <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="e.g. Ecolab" value={form.manufacturer} onChange={e => setField('manufacturer', e.target.value)} className={fieldCls('manufacturer')} />
                  {formErrors.manufacturer && <p className="text-xs text-red-500 mt-1">{formErrors.manufacturer}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Revision <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="e.g. Rev. 3" value={form.revision} onChange={e => setField('revision', e.target.value)} className={fieldCls('revision')} />
                  {formErrors.revision && <p className="text-xs text-red-500 mt-1">{formErrors.revision}</p>}
                </div>
              </div>

              {/* Hazard Classification + GHS Signal Word */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Hazard Classification <span className="text-red-500">*</span></label>
                  <select value={form.hazardClassification} onChange={e => setField('hazardClassification', e.target.value)} className={fieldCls('hazardClassification')}>
                    <option value="">Select classification…</option>
                    {HAZARD_CLASSIFICATIONS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  {formErrors.hazardClassification && <p className="text-xs text-red-500 mt-1">{formErrors.hazardClassification}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">GHS Signal Word <span className="text-red-500">*</span></label>
                  <select value={form.ghsSignalWord} onChange={e => setField('ghsSignalWord', e.target.value)} className={fieldCls('ghsSignalWord')}>
                    <option value="">Select signal word…</option>
                    {GHS_SIGNAL_WORDS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                  {formErrors.ghsSignalWord && <p className="text-xs text-red-500 mt-1">{formErrors.ghsSignalWord}</p>}
                </div>
              </div>

              {/* CAS Number + Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">CAS Number</label>
                  <input type="text" placeholder="e.g. 7681-52-9" value={form.casNumber} onChange={e => setField('casNumber', e.target.value)} className={fieldCls('casNumber')} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Language</label>
                  <select value={form.language} onChange={e => setField('language', e.target.value)} className={fieldCls('language')}>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Issue Date + Review Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Issue Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.issueDate} onChange={e => setField('issueDate', e.target.value)} className={fieldCls('issueDate')} />
                  {formErrors.issueDate && <p className="text-xs text-red-500 mt-1">{formErrors.issueDate}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Review Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.reviewDate} onChange={e => setField('reviewDate', e.target.value)} className={fieldCls('reviewDate')} />
                  {formErrors.reviewDate && <p className="text-xs text-red-500 mt-1">{formErrors.reviewDate}</p>}
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Emergency Contact Number</label>
                <input type="text" placeholder="e.g. +44 800 123 4567" value={form.emergencyContact} onChange={e => setField('emergencyContact', e.target.value)} className={fieldCls('emergencyContact')} />
              </div>

              {/* Storage Requirements */}
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Storage Requirements</label>
                <textarea placeholder="e.g. Store in cool, dry, well-ventilated area. Keep away from direct sunlight." value={form.storageRequirements}
                  onChange={e => setField('storageRequirements', e.target.value)} rows={2}
                  className={fieldCls('storageRequirements') + ' resize-none'} />
              </div>

              {/* SDS Document Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-2">SDS Document <span className="text-red-500">*</span></label>
                {form.sdsFile ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <span className="material-symbols-outlined text-green-500 text-[22px]">picture_as_pdf</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0d121b] truncate">{form.sdsFile.name}</p>
                      <p className="text-[10px] text-[#6b7a99]">
                        {form.sdsFile.size < 1024 * 1024
                          ? `${(form.sdsFile.size / 1024).toFixed(0)} KB`
                          : `${(form.sdsFile.size / (1024 * 1024)).toFixed(1)} MB`}
                      </p>
                    </div>
                    <button type="button" onClick={() => setField('sdsFile', null)}
                      className="text-[#6b7a99] hover:text-red-500 shrink-0">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="p-6 border-2 border-dashed border-[#e7ebf3] rounded-xl text-center hover:border-[#2e4150]/40 hover:bg-[#f6f7fb] transition-all">
                      <span className="material-symbols-outlined text-[32px] text-[#e7ebf3] block mb-1">upload_file</span>
                      <p className="text-sm font-semibold text-[#0d121b]">Click to upload SDS document</p>
                      <p className="text-xs text-[#6b7a99] mt-0.5">PDF format preferred — manufacturer's Safety Data Sheet</p>
                    </div>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                      onChange={e => { if (e.target.files?.[0]) setField('sdsFile', e.target.files[0]); e.target.value = ''; }} />
                  </label>
                )}
                {formErrors.sdsFile && <p className="text-xs text-red-500 mt-1">{formErrors.sdsFile}</p>}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e7ebf3] shrink-0">
              <button onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#6b7a99] bg-white hover:bg-[#f6f7fb] transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Upload SDS
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SDSLibrary;
