import React from 'react';

export interface DeductionsRow {
  description: string;
  amount: string;
}

interface Props {
  rows: DeductionsRow[];
  onChange: (rows: DeductionsRow[]) => void;
}

export const DEFAULT_DEDUCTIONS_ROWS: DeductionsRow[] = [
  { description: 'PAYE Tax', amount: '150.00' },
  { description: 'National Insurance', amount: '85.00' },
  { description: 'Pension Contribution', amount: '75.00' },
  { description: 'Student Loan', amount: '0.00' },
  { description: 'Other Deductions', amount: '0.00' },
];

const DeductionsTableInput: React.FC<Props> = ({ rows, onChange }) => {
  const inputCls = 'w-full px-2 py-1.5 bg-[#f6f7fb] border border-[#e7ebf3] rounded text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20';

  const totalDeductions = rows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  const updateRow = (index: number, field: keyof DeductionsRow, value: string) => {
    const next = [...rows];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const addRow = () => {
    onChange([...rows, { description: '', amount: '0.00' }]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide">Deductions</h2>
        <button type="button" onClick={addRow} className="text-xs font-semibold text-[#2e4150] hover:underline">
          + Add Row
        </button>
      </div>
      <div className="bg-white rounded-xl border border-[#e7ebf3] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e7ebf3] bg-[#f6f7fb]">
              <th className="px-3 py-2 text-left text-xs font-semibold text-[#6b7a99] uppercase">Description</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-[#6b7a99] uppercase">Amount (£)</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-[#e7ebf3]">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={row.description}
                    onChange={e => updateRow(i, 'description', e.target.value)}
                    className={inputCls}
                    placeholder="Description"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={row.amount}
                    onChange={e => updateRow(i, 'amount', e.target.value)}
                    className={`${inputCls} text-right`}
                    placeholder="0.00"
                  />
                </td>
                <td className="px-3 py-2">
                  <button type="button" onClick={() => removeRow(i)} className="text-red-600 hover:text-red-700 p-1" title="Remove">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#2e4150] bg-[#f6f7fb] font-bold">
              <td className="px-3 py-2 text-[#0d121b]">Total Deductions</td>
              <td className="px-3 py-2 text-right text-[#0d121b]">£{totalDeductions.toFixed(2)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DeductionsTableInput;
