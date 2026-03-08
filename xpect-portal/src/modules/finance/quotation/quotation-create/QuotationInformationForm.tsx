import React from 'react';
import type { QuotationInfo } from './quotationFormTypes';

interface Props {
  value: QuotationInfo;
  onChange: (v: Partial<QuotationInfo>) => void;
}

const QuotationInformationForm: React.FC<Props> = ({ value, onChange }) => {
  const inputCls = 'w-full px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20';

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide">Quotation Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Quotation Number</label>
          <input
            type="text"
            value={value.quotationNumber}
            onChange={e => onChange({ quotationNumber: e.target.value })}
            className={inputCls}
            placeholder="QUO-2026-001"
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
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Expiry Date</label>
          <input
            type="text"
            value={value.expiryDate}
            onChange={e => onChange({ expiryDate: e.target.value })}
            className={inputCls}
            placeholder="15 Feb 2026"
          />
        </div>
      </div>
    </div>
  );
};

export default QuotationInformationForm;
