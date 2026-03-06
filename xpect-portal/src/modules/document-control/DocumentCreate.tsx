import React, { useState } from 'react';
import { usePolicyDocuments } from '../../context/PolicyDocumentsContext';
import { DocCategory, ReviewFrequency } from './types';

interface Props {
  onBack: () => void;
  onCreated: (id: string) => void;
}

const CATEGORIES: DocCategory[] = [
  'Health & Safety', 'Environmental', 'Quality', 'Work Instructions', 'Forms', 'Insurance',
];

const DEPARTMENTS = ['Operations', 'Compliance', 'Quality Assurance', 'Finance', 'HR', 'Management'];

const today = () => new Date().toISOString().split('T')[0];

const addMonths = (date: string, months: number): string => {
  if (!date) return '';
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
};

const DocumentCreate: React.FC<Props> = ({ onBack, onCreated }) => {
  const { addDocument } = usePolicyDocuments();
  const [form, setForm] = useState({
    title: '',
    category: '' as DocCategory | '',
    department: '',
    owner: '',
    description: '',
    effectiveDate: today(),
    reviewFrequencyMonths: 12 as ReviewFrequency,
    fileName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);

  const set = (key: string, val: string | number) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim())      e.title      = 'Document title is required.';
    if (!form.category)          e.category   = 'Category is required.';
    if (!form.department)        e.department = 'Department is required.';
    if (!form.owner.trim())      e.owner      = 'Owner is required.';
    if (!form.effectiveDate)     e.effectiveDate = 'Effective date is required.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const newDoc = await addDocument({
        title: form.title.trim(),
        category: form.category as DocCategory,
        owner: form.owner.trim(),
        department: form.department,
        version: '1.0',
        status: 'draft',
        effectiveDate: form.effectiveDate,
        lastReviewDate: form.effectiveDate,
        nextReviewDate: addMonths(form.effectiveDate, form.reviewFrequencyMonths),
        reviewFrequencyMonths: form.reviewFrequencyMonths,
        description: form.description.trim(),
        fileName: fileSelected ? (form.fileName || 'document.pdf') : '',
        fileSize: fileSelected ? '0.8 MB' : '',
        versionHistory: [
          {
            version: '1.0',
            date: new Date().toISOString().split('T')[0],
            uploadedBy: form.owner.trim(),
            notes: 'Initial draft.',
            approvalStatus: 'pending',
          },
        ],
      });
      onCreated(newDoc.id);
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
        <button onClick={onBack} className="flex sm:items-center items-start gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Library
        </button>
        <div className="flex sm:items-center items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-[20px]">post_add</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0d121b]">New Document</h1>
            <p className="text-sm text-[#6b7a99]">Create a new policy or procedure document</p>
          </div>
        </div>
      </div>

      <div className="sm:px-8 px-4 sm:py-6 py-3 max-w-3xl">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* Document Details card */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-3 space-y-5">
            <h2 className="text-base font-bold text-[#0d121b] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">info</span>
              Document Details
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">
                Document Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Health & Safety Policy"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                className={fieldCls('title')}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            {/* Category + Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  className={fieldCls('category')}
                >
                  <option value="">Select category…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.department}
                  onChange={e => set('department', e.target.value)}
                  className={fieldCls('department')}
                >
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
              </div>
            </div>

            {/* Owner */}
            <div>
              <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">
                Document Owner <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Patricia Nwachukwu"
                value={form.owner}
                onChange={e => set('owner', e.target.value)}
                className={fieldCls('owner')}
              />
              {errors.owner && <p className="text-xs text-red-500 mt-1">{errors.owner}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Brief description of this document's purpose…"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                className={`${fieldCls('description')} resize-none`}
              />
            </div>
          </div>

          {/* Review & Dates card */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-3 space-y-5">
            <h2 className="text-base font-bold text-[#0d121b] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">event</span>
              Review Schedule
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">
                  Effective Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.effectiveDate}
                  onChange={e => set('effectiveDate', e.target.value)}
                  className={fieldCls('effectiveDate')}
                />
                {errors.effectiveDate && <p className="text-xs text-red-500 mt-1">{errors.effectiveDate}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">
                  Review Frequency
                </label>
                <select
                  value={form.reviewFrequencyMonths}
                  onChange={e => set('reviewFrequencyMonths', Number(e.target.value) as ReviewFrequency)}
                  className={fieldCls('reviewFrequencyMonths')}
                >
                  <option value={6}>Every 6 months</option>
                  <option value={12}>Every 12 months</option>
                  <option value={24}>Every 24 months</option>
                </select>
              </div>
            </div>

            {form.effectiveDate && (
              <div className="p-3 bg-[#f6f7fb] rounded-xl border border-[#e7ebf3] text-sm text-[#6b7a99]">
                <span className="material-symbols-outlined text-[16px] align-middle mr-1">event_available</span>
                Next review due: <span className="font-semibold text-[#0d121b]">
                  {new Date(addMonths(form.effectiveDate, form.reviewFrequencyMonths)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>

          {/* File Upload card */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-3">
            <h2 className="text-base font-bold text-[#0d121b] flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">upload_file</span>
              Upload Document
            </h2>
            {fileSelected ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <span className="material-symbols-outlined text-green-500 text-[22px]">check_circle</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0d121b]">{form.fileName || 'document.pdf'}</p>
                  <p className="text-xs text-[#6b7a99]">Ready to upload</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setFileSelected(false); set('fileName', ''); }}
                  className="text-[#6b7a99] hover:text-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <div className="p-8 border-2 border-dashed border-[#e7ebf3] rounded-xl text-center hover:border-[#2e4150]/40 hover:bg-[#f6f7fb] transition-all">
                  <span className="material-symbols-outlined text-[36px] text-[#e7ebf3] block mb-2">upload_file</span>
                  <p className="text-sm font-semibold text-[#0d121b]">Click to select a file</p>
                  <p className="text-xs text-[#6b7a99] mt-1">PDF, Word, or Excel — max 25 MB</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files?.[0]) {
                      setFileSelected(true);
                      set('fileName', e.target.files[0].name);
                    }
                  }}
                />
              </label>
            )}
            <p className="text-xs text-[#6b7a99] mt-3">
              <span className="material-symbols-outlined text-[14px] align-middle mr-0.5">info</span>
              File upload is UI-only in this version. The document will be saved as a draft.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pb-8">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#6b7a99] bg-white hover:bg-[#f6f7fb] transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full text-center sm:text-left justify-center sm:justify-start sm:w-auto items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                  Creating…
                </>
              ) : (
                <>
                  
                  Create
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentCreate;
