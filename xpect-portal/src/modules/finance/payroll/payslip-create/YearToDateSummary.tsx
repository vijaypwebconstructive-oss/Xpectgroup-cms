import React from 'react';
import type { YTDSummary } from './payslipFormTypes';

interface Props {
  value: YTDSummary;
  onChange: (v: Partial<YTDSummary>) => void;
}

const YearToDateSummary: React.FC<Props> = ({ value, onChange }) => {
  const inputCls = 'w-full px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20';

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide">Year To Date Summary</h2>
      <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Gross Pay YTD (£)</label>
            <input
              type="text"
              value={value.grossPayYTD}
              onChange={e => onChange({ grossPayYTD: e.target.value })}
              className={inputCls}
              placeholder="19200.00"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Tax Paid YTD (£)</label>
            <input
              type="text"
              value={value.taxPaidYTD}
              onChange={e => onChange({ taxPaidYTD: e.target.value })}
              className={inputCls}
              placeholder="1800.00"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">NI Paid YTD (£)</label>
            <input
              type="text"
              value={value.niPaidYTD}
              onChange={e => onChange({ niPaidYTD: e.target.value })}
              className={inputCls}
              placeholder="1020.00"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Pension YTD (£)</label>
            <input
              type="text"
              value={value.pensionYTD}
              onChange={e => onChange({ pensionYTD: e.target.value })}
              className={inputCls}
              placeholder="900.00"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearToDateSummary;
