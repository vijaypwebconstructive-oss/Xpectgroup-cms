import React from 'react';
import type { InvoiceInfo } from './invoiceFormTypes';

interface Props {
  value: InvoiceInfo;
  onChange: (v: Partial<InvoiceInfo>) => void;
}

const InvoiceInformationForm: React.FC<Props> = ({ value, onChange }) => {
  const inputCls = 'w-full px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20';

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide">Invoice Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Invoice Number</label>
          <input
            type="text"
            value={value.invoiceNumber}
            onChange={e => onChange({ invoiceNumber: e.target.value })}
            className={inputCls}
            placeholder="INV-2026-001"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Issue Date</label>
          <input
            type="text"
            value={value.issueDate}
            onChange={e => onChange({ issueDate: e.target.value })}
            className={inputCls}
            placeholder="01 Feb 2026"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Due Date</label>
          <input
            type="text"
            value={value.dueDate}
            onChange={e => onChange({ dueDate: e.target.value })}
            className={inputCls}
            placeholder="15 Feb 2026"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Service Period</label>
          <input
            type="text"
            value={value.servicePeriod}
            onChange={e => onChange({ servicePeriod: e.target.value })}
            className={inputCls}
            placeholder="01 Jan 2026 – 31 Jan 2026"
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceInformationForm;
