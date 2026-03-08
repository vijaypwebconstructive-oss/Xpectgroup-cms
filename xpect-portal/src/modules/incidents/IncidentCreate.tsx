import React, { useState, useMemo } from 'react';
import { useIncidents } from '../../context/IncidentsContext';
import { useClientsSites } from '../../context/ClientsSitesContext';
import { IncidentType } from './types';

interface Props {
  onBack: () => void;
  onCreated: (id: string) => void;
}

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('Failed to read file'));
    r.readAsDataURL(file);
  });

const INCIDENT_TYPES: IncidentType[] = ['Accident', 'Near Miss', 'Property Damage', 'Client Complaint', 'Environmental Incident'];

const STEPS = [
  { number: 1, label: 'Basic Info',        icon: 'info' },
  { number: 2, label: 'Injury & Damage',   icon: 'medical_services' },
  { number: 3, label: 'Actions & Evidence', icon: 'bolt' },
];

interface FormData {
  type: IncidentType | '';
  date: string;
  time: string;
  site: string;
  worker: string;
  description: string;
  injuryOccurred: boolean;
  injuryDescription: string;
  medicalTreatmentRequired: boolean;
  propertyDamage: string;
  immediateActionTaken: string;
  witnessNotes: string;
  hasPhotos: boolean;
  photoEvidenceName: string;
  photoEvidenceData: string;
}

const today = () => new Date().toISOString().split('T')[0];
const nowTime = () => new Date().toTimeString().slice(0, 5);

const IncidentCreate: React.FC<Props> = ({ onBack, onCreated }) => {
  const { addIncident } = useIncidents();
  const { sites, getClientById } = useClientsSites();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const siteOptions = useMemo(() =>
    sites.map(s => {
      const client = getClientById(s.clientId);
      const label = client ? `${s.name} — ${client.name}` : s.name;
      return { value: label, label };
    }),
    [sites, getClientById]
  );

  const [form, setForm] = useState<FormData>({
    type: '', date: today(), time: nowTime(), site: '', worker: '',
    description: '',
    injuryOccurred: false, injuryDescription: '', medicalTreatmentRequired: false, propertyDamage: '',
    immediateActionTaken: '',
    witnessNotes: '', hasPhotos: false, photoEvidenceName: '', photoEvidenceData: '',
  });

  const set = (key: keyof FormData, val: string | boolean) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => { const n = { ...e }; delete n[key as string]; return n; });
  };

  const validateStep = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.type)               e.type        = 'Incident type is required.';
      if (!form.date)               e.date        = 'Date is required.';
      if (!form.site)               e.site        = 'Site is required.';
      if (!form.worker.trim())      e.worker      = 'Reporter name is required.';
      if (!form.description.trim()) e.description = 'Description is required.';
    }
    if (s === 2 && form.injuryOccurred && !form.injuryDescription.trim()) {
      e.injuryDescription = 'Please describe the injury.';
    }
    return e;
  };

  const nextStep = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(s => Math.min(s + 1, 3));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      nextStep();
      return;
    }
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const dateTime = `${form.date}T${form.time}:00.000Z`;
      const created = await addIncident({
        date: dateTime,
        site: form.site,
        worker: form.worker,
        type: form.type as IncidentType,
        severity: 'Medium',
        status: 'Open',
        description: form.description.trim(),
        injuryOccurred: form.injuryOccurred,
        injuryDescription: form.injuryDescription.trim() || undefined,
        medicalTreatmentRequired: form.medicalTreatmentRequired,
        propertyDamage: form.propertyDamage.trim() || undefined,
        immediateActionTaken: form.immediateActionTaken.trim(),
        supervisorNotified: false,
        witnessNotes: form.witnessNotes.trim() || undefined,
        hasPhotos: form.hasPhotos,
        photoEvidenceName: form.photoEvidenceName || undefined,
        photoEvidenceData: form.photoEvidenceData || undefined,
      });
      onCreated(created.id);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldCls = (key: string) =>
    `w-full px-3 py-2.5 bg-[#f6f7fb] border rounded-xl text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 ${
      errors[key] ? 'border-red-300 focus:ring-red-300/30' : 'border-[#e7ebf3]'
    }`;

  return (
    <div className="min-h-full bg-[#f6f7fb]">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] sm:px-8 px-4 sm:py-5 py-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Incidents
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-[20px]">report_problem</span>
          </div>
          <div>
            <h1 className="sm:text-xl text-lg font-bold text-[#0d121b]">Report an Incident</h1>
            <p className="text-base text-[#4c669a]">Complete all sections to submit an incident report</p>
          </div>
        </div>
      </div>

      {/* Step progress */}
      <div className="bg-white border-b border-[#e7ebf3] px-8 py-4">
        <div className="flex items-center gap-0 max-w-2xl">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.number}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step > s.number   ? 'bg-green-500 text-white' :
                  step === s.number ? 'bg-[#2e4150] text-white' :
                  'bg-[#f0f2f7] text-[#6b7a99]'
                }`}>
                  {step > s.number
                    ? <span className="material-symbols-outlined text-[16px]">check</span>
                    : <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
                  }
                </div>
                <span className={`text-xs font-semibold whitespace-nowrap ${step === s.number ? 'text-[#0d121b]' : 'text-[#6b7a99]'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${step > s.number ? 'bg-green-400' : 'bg-[#e7ebf3]'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="sm:px-8 px-4 sm:py-6 py-3 max-w-3xl">
        <form onSubmit={handleSubmit} noValidate>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-4 space-y-5">
              <h2 className="text-base font-bold text-[#0d121b] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">info</span>
                Step 1 — Basic Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={fieldCls('date')} />
                  {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Time</label>
                  <input type="time" value={form.time} onChange={e => set('time', e.target.value)} className={fieldCls('time')} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Site <span className="text-red-500">*</span></label>
                  <select value={form.site} onChange={e => set('site', e.target.value)} className={fieldCls('site')}>
                    <option value="">Select site…</option>
                    {siteOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {errors.site && <p className="text-xs text-red-500 mt-1">{errors.site}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Reporter Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter reporter name"
                    value={form.worker}
                    onChange={e => set('worker', e.target.value)}
                    className={fieldCls('worker')}
                  />
                  {errors.worker && <p className="text-xs text-red-500 mt-1">{errors.worker}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Incident Type <span className="text-red-500">*</span></label>
                <select value={form.type} onChange={e => set('type', e.target.value)} className={fieldCls('type')}>
                  <option value="">Select type…</option>
                  {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea rows={4} placeholder="Describe what happened, where, and the immediate circumstances…"
                  value={form.description} onChange={e => set('description', e.target.value)}
                  className={`${fieldCls('description')} resize-none`} />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Injury & Damage */}
          {step === 2 && (
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-4 space-y-5">
              <h2 className="text-base font-bold text-[#0d121b] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">medical_services</span>
                Step 2 — Injury & Property Damage
              </h2>

              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-3">Did an injury occur?</label>
                <div className="flex gap-3">
                  {[true, false].map(val => (
                    <button key={String(val)} type="button" onClick={() => set('injuryOccurred', val)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                        form.injuryOccurred === val
                          ? val ? 'bg-red-600 text-white border-red-600' : 'bg-[#2e4150] text-white border-[#2e4150]'
                          : 'bg-[#f6f7fb] text-[#6b7a99] border-[#e7ebf3] hover:border-[#2e4150]/30'
                      }`}>{val ? 'Yes' : 'No'}</button>
                  ))}
                </div>
              </div>

              {form.injuryOccurred && (
                <div className="space-y-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <div>
                    <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Injury Description <span className="text-red-500">*</span></label>
                    <textarea rows={3} placeholder="Describe the nature and location of the injury…"
                      value={form.injuryDescription} onChange={e => set('injuryDescription', e.target.value)}
                      className={`${fieldCls('injuryDescription')} resize-none`} />
                    {errors.injuryDescription && <p className="text-xs text-red-500 mt-1">{errors.injuryDescription}</p>}
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.medicalTreatmentRequired}
                      onChange={e => set('medicalTreatmentRequired', e.target.checked)}
                      className="w-4 h-4 rounded accent-red-600" />
                    <span className="text-sm font-medium text-[#0d121b]">Medical treatment was required</span>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Property / Equipment Damage</label>
                <textarea rows={2} placeholder="Describe any property or equipment damage, and estimated cost if known…"
                  value={form.propertyDamage} onChange={e => set('propertyDamage', e.target.value)}
                  className={`${fieldCls('propertyDamage')} resize-none`} />
              </div>
            </div>
          )}

          {/* Step 3: Actions & Evidence */}
          {step === 3 && (
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-4 space-y-5">
              <h2 className="text-base font-bold text-[#0d121b] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">bolt</span>
                Step 3 — Immediate Actions & Evidence
              </h2>

              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Immediate Actions Taken</label>
                <textarea rows={3} placeholder="Describe what was done immediately after the incident…"
                  value={form.immediateActionTaken} onChange={e => set('immediateActionTaken', e.target.value)}
                  className={`${fieldCls('immediateActionTaken')} resize-none`} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Witness Statements / Notes</label>
                <textarea rows={3} placeholder="Include witness name and what they observed…"
                  value={form.witnessNotes} onChange={e => set('witnessNotes', e.target.value)}
                  className={`${fieldCls('witnessNotes')} resize-none`} />
              </div>

              {/* Photo upload */}
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-2">Upload Evidence (optional)</label>
                {form.hasPhotos ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <span className="material-symbols-outlined text-green-500 text-[22px]">check_circle</span>
                    <p className="text-sm font-semibold text-[#0d121b]">{form.photoEvidenceName || 'Photo attached'}</p>
                    <button type="button" onClick={() => setForm(f => ({ ...f, hasPhotos: false, photoEvidenceName: '', photoEvidenceData: '' }))}
                      className="ml-auto text-[#6b7a99] hover:text-red-500">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="p-6 border-2 border-dashed border-[#e7ebf3] rounded-xl text-center hover:border-[#2e4150]/40 hover:bg-[#f6f7fb] transition-all">
                      <span className="material-symbols-outlined text-[36px] text-[#e7ebf3] block mb-2">photo_camera</span>
                      <p className="text-sm font-semibold text-[#0d121b]">Click to attach photos</p>
                      <p className="text-xs text-[#6b7a99] mt-1">JPEG, PNG — scene photos, injuries (if consented)</p>
                    </div>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      className="hidden"
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const dataUrl = await fileToDataUrl(file);
                            setForm(f => ({ ...f, hasPhotos: true, photoEvidenceName: file.name, photoEvidenceData: dataUrl }));
                          } catch { /* ignore */ }
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Summary before submit */}
              <div className="p-4 bg-[#f6f7fb] border border-[#e7ebf3] rounded-xl space-y-2">
                <p className="text-xs font-bold text-[#6b7a99] uppercase tracking-wide mb-2">Report Summary</p>
                {[
                  ['Type', form.type || '—'],
                  ['Date', form.date ? `${form.date} ${form.time}` : '—'],
                  ['Site', form.site || '—'],
                  ['Reporter', form.worker || '—'],
                  ['Injury', form.injuryOccurred ? 'Yes' : 'No'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-sm">
                    <span className="text-[#6b7a99]">{k}</span>
                    <span className="font-semibold text-[#0d121b]">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5 pb-8">
            <button type="button" onClick={step === 1 ? onBack : prevStep}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#6b7a99] bg-white hover:bg-[#f6f7fb] transition-colors">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              {step === 1 ? 'Cancel' : 'Previous'}
            </button>

            {step < 3 ? (
              <button type="button" onClick={(e) => { e.preventDefault(); nextStep(); }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm">
                Next
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            ) : (
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm">
                {submitting ? (
                  <><span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>Submitting…</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">send</span>Submit Report</>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentCreate;
