import React, { useState, useMemo } from 'react';
import { MOCK_CHEMICALS } from './mockData';
import { Chemical } from './types';

interface Props {
  onSelectChemical: (id: string) => void;
  onBack: () => void;
  onNavigateSDS: () => void;
}

export const addedChemicals: Chemical[] = [];

const HAZARD_TYPES = ['Irritant', 'Corrosive', 'Flammable', 'Oxidising', 'Toxic', 'Health Hazard', 'Environmental Hazard'];
const PPE_OPTIONS  = ['Nitrile Gloves', 'Safety Goggles', 'Face Shield', 'FFP2 Mask', 'FFP3 Mask', 'Chemical Apron', 'Rubber Boots', 'Lab Coat'];

const hazardColor = (type: string) => {
  if (type.includes('Corrosive'))   return 'bg-red-100 text-red-700 border border-red-200';
  if (type.includes('Flammable'))   return 'bg-orange-100 text-orange-700 border border-orange-200';
  if (type.includes('Oxidising'))   return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
  if (type.includes('Irritant'))    return 'bg-amber-100 text-amber-700 border border-amber-200';
  return                                   'bg-gray-100 text-gray-600 border border-gray-200';
};

interface ChemForm {
  name: string;
  manufacturer: string;
  hazardType: string;
  storageLocation: string;
  ppeRequired: string[];
  firstAidMeasures: string;
  spillResponse: string;
  disposalMethod: string;
  handlingInstructions: string;
  maxExposureLimit: string;
  sdsFile: File | null;
}

const emptyForm: ChemForm = {
  name: '', manufacturer: '', hazardType: '', storageLocation: '',
  ppeRequired: [], firstAidMeasures: '', spillResponse: '',
  disposalMethod: '', handlingInstructions: '', maxExposureLimit: '',
  sdsFile: null,
};

const COSHHRegister: React.FC<Props> = ({ onSelectChemical, onBack, onNavigateSDS }) => {
  const [search, setSearch]             = useState('');
  const [hazardFilter, setHazard]       = useState('');
  const [chemList, setChemList]         = useState<Chemical[]>([...addedChemicals, ...MOCK_CHEMICALS]);

  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [form, setForm]                 = useState<ChemForm>({ ...emptyForm });
  const [formErrors, setFormErrors]     = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg]     = useState('');

  const setField = (key: keyof ChemForm, val: string | string[] | File | null) => {
    setForm(f => ({ ...f, [key]: val }));
    setFormErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const togglePPE = (item: string) => {
    setForm(f => ({
      ...f,
      ppeRequired: f.ppeRequired.includes(item)
        ? f.ppeRequired.filter(p => p !== item)
        : [...f.ppeRequired, item],
    }));
  };

  const flash = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.name.trim())              e.name              = 'Chemical name is required.';
    if (!form.manufacturer.trim())      e.manufacturer      = 'Manufacturer is required.';
    if (!form.hazardType)               e.hazardType        = 'Hazard type is required.';
    if (!form.storageLocation.trim())   e.storageLocation   = 'Storage location is required.';
    if (form.ppeRequired.length === 0)  e.ppeRequired       = 'Select at least one PPE item.';
    if (!form.firstAidMeasures.trim())  e.firstAidMeasures  = 'First aid measures are required.';
    if (!form.spillResponse.trim())     e.spillResponse     = 'Spill response is required.';
    if (!form.disposalMethod.trim())    e.disposalMethod    = 'Disposal method is required.';
    return e;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    const nextNum = MOCK_CHEMICALS.length + addedChemicals.length + 1;
    const hasSDS = !!form.sdsFile;

    const newChem: Chemical = {
      id: `chem-${String(nextNum).padStart(3, '0')}`,
      name: form.name.trim(),
      manufacturer: form.manufacturer.trim(),
      hazardType: form.hazardType,
      hazardSymbols: [],
      storageLocation: form.storageLocation.trim(),
      ppeRequired: [...form.ppeRequired],
      sdsAvailable: hasSDS,
      firstAidMeasures: form.firstAidMeasures.trim(),
      spillResponse: form.spillResponse.trim(),
      disposalMethod: form.disposalMethod.trim(),
      handlingInstructions: form.handlingInstructions.trim(),
      maxExposureLimit: form.maxExposureLimit.trim() || undefined,
    };

    addedChemicals.unshift(newChem);
    setChemList([newChem, ...chemList]);
    setForm({ ...emptyForm });
    setFormErrors({});
    setIsModalOpen(false);
    flash(`"${newChem.name}" added to the COSHH register.`);
  };

  const openModal = () => {
    setForm({ ...emptyForm });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const hazardTypes = useMemo(() => [...new Set(chemList.map(c => c.hazardType))], [chemList]);

  const filtered = useMemo(() => {
    let list = [...chemList];
    if (search)       list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.manufacturer.toLowerCase().includes(search.toLowerCase()));
    if (hazardFilter) list = list.filter(c => c.hazardType === hazardFilter);
    return list;
  }, [search, hazardFilter, chemList]);

  const stats = useMemo(() => ({
    total: chemList.length,
    noSDS: chemList.filter(c => !c.sdsAvailable).length,
    high:  chemList.filter(c => ['Corrosive', 'Flammable', 'Oxidising'].some(h => c.hazardType.includes(h))).length,
  }), [chemList]);

  const fieldCls = (key: string) =>
    `w-full px-3 py-2.5 bg-[#f6f7fb] border rounded-xl text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 ${
      formErrors[key] ? 'border-red-300 focus:ring-red-300/30' : 'border-[#e7ebf3]'
    }`;

  return (
    <div className="min-h-full bg-[#f6f7fb] w-screen sm:w-full sm:max-w-full">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] sm:px-8 px-4 sm:py-5 py-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]">science</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0d121b]">COSHH Chemical Register</h1>
              <p className="text-base text-[#4c669a]">Control of Substances Hazardous to Health</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onNavigateSDS}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors">
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              SDS Library
            </button>
            <button onClick={openModal} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Chemical
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex items-start gap-3 flex-col">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">science</span>
            </div>
            <div><p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Registered Chemicals</p><p className="text-xl sm:text-[30px] font-bold text-[#0d121b]">{stats.total}</p></div>
          </div>
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex items-start gap-3 flex-col">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div><p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">High Hazard Chemicals</p><p className="text-xl sm:text-[30px] font-bold text-[#0d121b]">{stats.high}</p></div>
          </div>
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex items-start gap-3 flex-col">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${stats.noSDS > 0 ? 'bg-red-100 text-red-600' : 'bg-green-50 text-green-600'}`}>
              <span className="material-symbols-outlined text-[20px]">{stats.noSDS > 0 ? 'gpp_bad' : 'verified'}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Missing SDS Sheets</p>
              <p className={`text-xl sm:text-[30px] font-bold ${stats.noSDS > 0 ? 'text-red-600' : 'text-[#0d121b]'}`}>{stats.noSDS}</p>
            </div>
          </div>
        </div>

        {stats.noSDS > 0 && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0 mt-0.5">gpp_bad</span>
            <div>
              <p className="text-sm font-bold text-red-700">SDS Sheets Missing</p>
              <p className="text-xs text-red-600 mt-0.5">
                {stats.noSDS} chemical{stats.noSDS > 1 ? 's' : ''} do not have a Safety Data Sheet. Under COSHH regulations (SI 2002/2677), SDS must be available for all hazardous substances. Action required immediately.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6b7a99]">search</span>
            <input type="text" placeholder="Search chemicals or manufacturer…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20" />
          </div>
          <select value={hazardFilter} onChange={e => setHazard(e.target.value)}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 min-w-[160px]">
            <option value="">All Hazard Types</option>
            {hazardTypes.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          {(search || hazardFilter) && (
            <button onClick={() => { setSearch(''); setHazard(''); }}
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
                  {['Chemical Name', 'Manufacturer', 'Hazard Type', 'Storage Location', 'PPE Required', 'SDS Available', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {filtered.length === 0
                  ? (
                    <tr><td colSpan={7} className="px-4 py-16 text-center">
                      <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">science</span>
                      <p className="text-[#6b7a99] font-medium">No chemicals found</p>
                    </td></tr>
                  )
                  : filtered.map(c => (
                    <tr key={c.id} onClick={() => onSelectChemical(c.id)} className="cursor-pointer hover:bg-[#f6f7fb] transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">science</span>
                          <span className="font-semibold text-[#0d121b] max-w-[180px] truncate">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[#6b7a99]">{c.manufacturer}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${hazardColor(c.hazardType)}`}>
                          {c.hazardType}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[#6b7a99] max-w-[160px] truncate">{c.storageLocation}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {c.ppeRequired.map(p => (
                            <span key={p} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#f0f2f7] text-[#2e4150]">{p}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {c.sdsAvailable
                          ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">Yes</span>
                          : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">Missing</span>
                        }
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-semibold text-[#2e4150] hover:underline">View</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-[#e7ebf3] bg-[#f6f7fb] text-xs text-[#6b7a99]">
              Showing {filtered.length} of {chemList.length} chemicals
            </div>
          )}
        </div>
      </div>

      {/* Add Chemical Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7ebf3] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2e4150] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[18px]">science</span>
                </div>
                <h2 className="text-lg font-bold text-[#0d121b]">Add Chemical to COSHH Register</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f6f9] transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px] text-[#4c669a]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              {/* Name + Manufacturer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Chemical Name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="e.g. Sodium Hypochlorite" value={form.name} onChange={e => setField('name', e.target.value)} className={fieldCls('name')} />
                  {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Manufacturer <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="e.g. Ecolab" value={form.manufacturer} onChange={e => setField('manufacturer', e.target.value)} className={fieldCls('manufacturer')} />
                  {formErrors.manufacturer && <p className="text-xs text-red-500 mt-1">{formErrors.manufacturer}</p>}
                </div>
              </div>

              {/* Hazard + Storage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Hazard Type <span className="text-red-500">*</span></label>
                  <select value={form.hazardType} onChange={e => setField('hazardType', e.target.value)} className={fieldCls('hazardType')}>
                    <option value="">Select hazard type…</option>
                    {HAZARD_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  {formErrors.hazardType && <p className="text-xs text-red-500 mt-1">{formErrors.hazardType}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Storage Location <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="e.g. Cleaning store, locked cabinet" value={form.storageLocation} onChange={e => setField('storageLocation', e.target.value)} className={fieldCls('storageLocation')} />
                  {formErrors.storageLocation && <p className="text-xs text-red-500 mt-1">{formErrors.storageLocation}</p>}
                </div>
              </div>

              {/* Max Exposure */}
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Max Exposure Limit</label>
                <input type="text" placeholder="e.g. 5 ppm (8hr TWA)" value={form.maxExposureLimit} onChange={e => setField('maxExposureLimit', e.target.value)} className={fieldCls('maxExposureLimit')} />
              </div>

              {/* PPE Required */}
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-2">PPE Required <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {PPE_OPTIONS.map(p => (
                    <button key={p} type="button" onClick={() => togglePPE(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        form.ppeRequired.includes(p)
                          ? 'bg-[#2e4150] text-white border-[#2e4150]'
                          : 'bg-[#f6f7fb] text-[#6b7a99] border-[#e7ebf3] hover:border-[#2e4150]/30'
                      }`}>{p}</button>
                  ))}
                </div>
                {formErrors.ppeRequired && <p className="text-xs text-red-500 mt-1">{formErrors.ppeRequired}</p>}
              </div>

              {/* Handling Instructions */}
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Handling Instructions</label>
                <textarea rows={2} placeholder="How to safely handle this chemical…"
                  value={form.handlingInstructions} onChange={e => setField('handlingInstructions', e.target.value)}
                  className={`${fieldCls('handlingInstructions')} resize-none`} />
              </div>

              {/* First Aid + Spill + Disposal */}
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">First Aid Measures <span className="text-red-500">*</span></label>
                <textarea rows={2} placeholder="First aid procedures if exposed…"
                  value={form.firstAidMeasures} onChange={e => setField('firstAidMeasures', e.target.value)}
                  className={`${fieldCls('firstAidMeasures')} resize-none`} />
                {formErrors.firstAidMeasures && <p className="text-xs text-red-500 mt-1">{formErrors.firstAidMeasures}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Spill Response <span className="text-red-500">*</span></label>
                  <textarea rows={2} placeholder="Steps if spilled…"
                    value={form.spillResponse} onChange={e => setField('spillResponse', e.target.value)}
                    className={`${fieldCls('spillResponse')} resize-none`} />
                  {formErrors.spillResponse && <p className="text-xs text-red-500 mt-1">{formErrors.spillResponse}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Disposal Method <span className="text-red-500">*</span></label>
                  <textarea rows={2} placeholder="How to safely dispose…"
                    value={form.disposalMethod} onChange={e => setField('disposalMethod', e.target.value)}
                    className={`${fieldCls('disposalMethod')} resize-none`} />
                  {formErrors.disposalMethod && <p className="text-xs text-red-500 mt-1">{formErrors.disposalMethod}</p>}
                </div>
              </div>

              {/* SDS Document Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-2">Safety Data Sheet (SDS)</label>
                {form.sdsFile ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <span className="material-symbols-outlined text-green-500 text-[20px]">attach_file</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0d121b] truncate">{form.sdsFile.name}</p>
                      <p className="text-[10px] text-[#6b7a99]">{(form.sdsFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button type="button" onClick={() => setField('sdsFile', null)}
                      className="text-[#6b7a99] hover:text-red-500 shrink-0">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="p-5 border-2 border-dashed border-[#e7ebf3] rounded-xl text-center hover:border-[#2e4150]/40 hover:bg-[#f6f7fb] transition-all">
                      <span className="material-symbols-outlined text-[28px] text-[#e7ebf3] block mb-1">upload_file</span>
                      <p className="text-sm font-semibold text-[#0d121b]">Upload SDS Document</p>
                      <p className="text-xs text-[#6b7a99] mt-0.5">PDF, DOC — Safety Data Sheet for this chemical</p>
                    </div>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                      onChange={e => { if (e.target.files?.[0]) setField('sdsFile', e.target.files[0]); e.target.value = ''; }} />
                  </label>
                )}
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
                  Save Chemical
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default COSHHRegister;
