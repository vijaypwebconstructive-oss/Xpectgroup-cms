import React, { useState } from 'react';
import type { Prospect, ProspectStatus } from './types';

const STATUSES: ProspectStatus[] = ['New', 'Contacted', 'Qualified', 'Quotation Sent', 'Converted', 'Lost'];

interface Props {
  initial?: Partial<Prospect>;
  onSubmit: (data: Omit<Prospect, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const ProspectForm: React.FC<Props> = ({ initial, onSubmit, onCancel, submitLabel = 'Save Prospect' }) => {
  const [form, setForm] = useState({
    clientName: initial?.clientName ?? '',
    company: initial?.company ?? '',
    industryType: initial?.industryType ?? '',
    email: initial?.email ?? '',
    contactNumber: initial?.contactNumber ?? '',
    address: initial?.address ?? '',
    notes: initial?.notes ?? '',
    status: (initial?.status ?? 'New') as ProspectStatus,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, val: string | ProspectStatus) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.clientName.trim()) e.clientName = 'Client name is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        clientName: form.clientName.trim(),
        company: form.company.trim(),
        industryType: form.industryType.trim(),
        email: form.email.trim(),
        contactNumber: form.contactNumber.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
        status: form.status,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldCls = (key: string) =>
    `w-full px-3 py-2.5 bg-[#f6f7fb] border rounded-xl text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 ${
      errors[key] ? 'border-red-300 focus:ring-red-300/30' : 'border-[#e7ebf3]'
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Client Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.clientName}
            onChange={e => set('clientName', e.target.value)}
            placeholder="Full name"
            className={fieldCls('clientName')}
          />
          {errors.clientName && <p className="text-xs text-red-500 mt-1">{errors.clientName}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Company</label>
          <input
            type="text"
            value={form.company}
            onChange={e => set('company', e.target.value)}
            placeholder="Company name"
            className={fieldCls('company')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Industry Type</label>
          <input
            type="text"
            value={form.industryType}
            onChange={e => set('industryType', e.target.value)}
            placeholder="e.g. Healthcare, Retail"
            className={fieldCls('industryType')}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Status</label>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value as ProspectStatus)}
            className={fieldCls('status')}
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="email@example.com"
            className={fieldCls('email')}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Contact Number</label>
          <input
            type="tel"
            value={form.contactNumber}
            onChange={e => set('contactNumber', e.target.value)}
            placeholder="Phone number"
            className={fieldCls('contactNumber')}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Address</label>
        <textarea
          rows={2}
          value={form.address}
          onChange={e => set('address', e.target.value)}
          placeholder="Full address"
          className={`${fieldCls('address')} resize-none`}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Notes</label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Conversation notes, requirements, etc."
          className={`${fieldCls('notes')} resize-none`}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#6b7a99] hover:bg-[#f6f7fb] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ProspectForm;
