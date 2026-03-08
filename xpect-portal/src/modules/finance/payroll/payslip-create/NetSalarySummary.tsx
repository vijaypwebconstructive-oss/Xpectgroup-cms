import React from 'react';

interface Props {
  grossPay: string;
  totalDeductions: string;
  netPay: string;
  netPayInWords: string;
  onNetPayChange: (v: string) => void;
  onNetPayInWordsChange: (v: string) => void;
}

const NetSalarySummary: React.FC<Props> = ({
  grossPay,
  totalDeductions,
  netPay,
  netPayInWords,
  onNetPayChange,
  onNetPayInWordsChange,
}) => {
  const inputCls = 'w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide">Net Salary Summary</h2>
      <div className="bg-[#2e4150] rounded-xl border border-[#2e4150] p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-white/90 uppercase tracking-wide mb-1.5">Gross Pay (£)</label>
            <div className="px-3 py-2 text-lg font-bold text-white">{grossPay}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/90 uppercase tracking-wide mb-1.5">Total Deductions (£)</label>
            <div className="px-3 py-2 text-lg font-bold text-white">{totalDeductions}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/90 uppercase tracking-wide mb-1.5">Net Pay (£)</label>
            <input
              type="text"
              value={netPay}
              onChange={e => onNetPayChange(e.target.value)}
              className={inputCls}
              placeholder="1,290.00"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/90 uppercase tracking-wide mb-1.5">Net Pay in Words</label>
          <input
            type="text"
            value={netPayInWords}
            onChange={e => onNetPayInWordsChange(e.target.value)}
            className={inputCls}
            placeholder="One thousand two hundred ninety pounds only"
          />
        </div>
      </div>
    </div>
  );
};

export default NetSalarySummary;
