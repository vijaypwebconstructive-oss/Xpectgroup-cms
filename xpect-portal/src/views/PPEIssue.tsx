import React, { useState } from 'react';
import { PPEItemType, PPECondition } from '../types';
import { ALL_PPE_TYPES, PPE_ITEM_ICONS } from './ppeData';

interface PPEIssueProps {
  onBack: () => void;
}

const WORKERS = [
  'James Thornton', 'Sarah Mitchell', 'David Okafor', 'Emma Clarke',
  'Ryan Patel', 'Priya Singh', 'Luke Henderson', 'Amara Osei',
  'Chris Evans', 'Fatima Hassan', 'Michael Brown', 'Grace Obi',
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'One Size', '4', '5', '6', '7', '8', '9', '10', '11'];

const PPEIssue: React.FC<PPEIssueProps> = ({ onBack }) => {
  const [form, setForm] = useState({
    worker: '',
    ppeType: '' as PPEItemType | '',
    size: '',
    issueDate: new Date().toISOString().split('T')[0],
    condition: 'New' as PPECondition,
    replacementMonths: '6' as '3' | '6' | '12',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.worker)    e.worker   = 'Please select a worker.';
    if (!form.ppeType)   e.ppeType  = 'Please select a PPE type.';
    if (!form.size)      e.size     = 'Please select a size.';
    if (!form.issueDate) e.issueDate= 'Please enter an issue date.';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
  };

  const set = (k: string, v: string | boolean) => setForm(prev => ({ ...prev, [k]: v }));

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-green-600 text-[42px]">check_circle</span>
        </div>
        <div className="text-center">
          <h2 className="text-[#0d121b] text-xl font-black mb-1">PPE Issued Successfully</h2>
          <p className="text-[#4c669a] text-sm">
            <strong>{form.ppeType}</strong> has been issued to <strong>{form.worker}</strong>.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-2.5 rounded-full border border-[#e7ebf3] text-[#0d121b] text-sm font-bold hover:bg-[#f2f6f9] transition-all cursor-pointer"
          >
            Issue Another
          </button>
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-all cursor-pointer"
          >
            Back to Records
          </button>
        </div>
      </div>
    );
  }

  const err = (k: string) => errors[k] ? (
    <p className="text-red-500 text-xs mt-1 font-semibold">{errors[k]}</p>
  ) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1 text-[#4c669a] text-sm font-bold hover:text-[#0d121b] transition-colors cursor-pointer">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Records
      </button>

      <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="sm:px-6 px-3 sm:py-5 py-3 border-b border-[#e7ebf3] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2e4150]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#2e4150] text-[22px]">safety_check</span>
          </div>
          <div>
            <h2 className="text-[#0d121b] text-base font-bold font-black">Issue PPE</h2>
            <p className="text-[#4c669a] text-md">Record personal protective equipment issued to a worker</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="sm:p-6 p-3 space-y-6">
          {/* Worker + PPE Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0d121b] mb-1.5">Worker <span className="text-red-500">*</span></label>
              <select
                className={`w-full h-10 rounded-lg border px-3 text-sm text-[#0d121b] outline-none bg-[#f8fafc] focus:border-[#2e4150] transition-all ${errors.worker ? 'border-red-400' : 'border-[#e7ebf3]'}`}
                value={form.worker}
                onChange={e => set('worker', e.target.value)}
              >
                <option value="">Select worker…</option>
                {WORKERS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
              {err('worker')}
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0d121b] mb-1.5">PPE Item Type <span className="text-red-500">*</span></label>
              <select
                className={`w-full h-10 rounded-lg border px-3 text-sm text-[#0d121b] outline-none bg-[#f8fafc] focus:border-[#2e4150] transition-all ${errors.ppeType ? 'border-red-400' : 'border-[#e7ebf3]'}`}
                value={form.ppeType}
                onChange={e => set('ppeType', e.target.value)}
              >
                <option value="">Select PPE type…</option>
                {ALL_PPE_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {err('ppeType')}
            </div>
          </div>

          {/* PPE type preview pill */}
          {form.ppeType && (
            <div className="flex items-center gap-2 p-3 bg-[#f2f6f9] rounded-xl border border-[#e7ebf3]">
              <span className="material-symbols-outlined text-[#2e4150] text-[22px]">{PPE_ITEM_ICONS[form.ppeType as PPEItemType]}</span>
              <span className="text-sm font-bold text-[#0d121b]">{form.ppeType}</span>
            </div>
          )}

          {/* Size + Issue Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0d121b] mb-1.5">Size <span className="text-red-500">*</span></label>
              <select
                className={`w-full h-10 rounded-lg border px-3 text-sm text-[#0d121b] outline-none bg-[#f8fafc] focus:border-[#2e4150] transition-all ${errors.size ? 'border-red-400' : 'border-[#e7ebf3]'}`}
                value={form.size}
                onChange={e => set('size', e.target.value)}
              >
                <option value="">Select size…</option>
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {err('size')}
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0d121b] mb-1.5">Issue Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                className={`w-full h-10 rounded-lg border px-3 text-sm text-[#0d121b] outline-none bg-[#f8fafc] focus:border-[#2e4150] transition-all ${errors.issueDate ? 'border-red-400' : 'border-[#e7ebf3]'}`}
                value={form.issueDate}
                onChange={e => set('issueDate', e.target.value)}
              />
              {err('issueDate')}
            </div>
          </div>

          {/* Condition + Replacement Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0d121b] mb-1.5">Condition at Issue</label>
              <div className="flex gap-2">
                {(['New', 'Good', 'Used'] as PPECondition[]).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set('condition', c)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
                      form.condition === c
                        ? 'bg-[#2e4150] text-white border-[#2e4150]'
                        : 'bg-[#f8fafc] text-[#4c669a] border-[#e7ebf3] hover:border-[#2e4150]/30'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0d121b] mb-1.5">Expected Replacement Period</label>
              <div className="flex gap-2">
                {(['3', '6', '12'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => set('replacementMonths', m)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
                      form.replacementMonths === m
                        ? 'bg-[#2e4150] text-white border-[#2e4150]'
                        : 'bg-[#f8fafc] text-[#4c669a] border-[#e7ebf3] hover:border-[#2e4150]/30'
                    }`}
                  >
                    {m} mo
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-[#0d121b] mb-1.5">Notes <span className="text-[#4c669a] font-normal">(optional)</span></label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-[#e7ebf3] px-3 py-2 text-sm text-[#0d121b] outline-none bg-[#f8fafc] focus:border-[#2e4150] transition-all resize-none"
              placeholder="Add any relevant notes about this PPE issuance…"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2.5 rounded-full border border-[#e7ebf3] text-[#0d121b] text-sm font-bold hover:bg-[#f2f6f9] transition-all cursor-pointer w-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center w-full gap-2 px-6 py-2.5 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">hourglass_empty</span>
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px] font-bold">save</span>
                  Issue PPE
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PPEIssue;
