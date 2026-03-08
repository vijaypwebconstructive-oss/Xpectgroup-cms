import React from 'react';

export interface LeaveRow {
  leaveType: string;
  entitled: string;
  used: string;
  balance: string;
}

interface Props {
  rows: LeaveRow[];
  onChange: (rows: LeaveRow[]) => void;
}

export const DEFAULT_LEAVE_ROWS: LeaveRow[] = [
  { leaveType: 'Annual Leave', entitled: '28', used: '5', balance: '23' },
  { leaveType: 'Sick Leave', entitled: '10', used: '0', balance: '10' },
];

const LeaveSummaryInput: React.FC<Props> = ({ rows, onChange }) => {
  const inputCls = 'w-full px-2 py-1.5 bg-[#f6f7fb] border border-[#e7ebf3] rounded text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20';

  const updateRow = (index: number, field: keyof LeaveRow, value: string) => {
    const next = [...rows];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const addRow = () => {
    onChange([...rows, { leaveType: '', entitled: '0', used: '0', balance: '0' }]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide">Leave Summary (Optional)</h2>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2e4150] text-white text-sm font-semibold hover:opacity-90"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Leave Item
        </button>
      </div>
      <div className="bg-white rounded-xl border border-[#e7ebf3] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e7ebf3] bg-[#f6f7fb]">
              <th className="px-3 py-2 text-left text-xs font-semibold text-[#6b7a99] uppercase">Leave Type</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-[#6b7a99] uppercase">Entitled</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-[#6b7a99] uppercase">Used</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-[#6b7a99] uppercase">Balance</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-[#e7ebf3]">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={row.leaveType}
                    onChange={e => updateRow(i, 'leaveType', e.target.value)}
                    className={inputCls}
                    placeholder="Leave Type"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={row.entitled}
                    onChange={e => updateRow(i, 'entitled', e.target.value)}
                    className={`${inputCls} text-center`}
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={row.used}
                    onChange={e => updateRow(i, 'used', e.target.value)}
                    className={`${inputCls} text-center`}
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={row.balance}
                    onChange={e => updateRow(i, 'balance', e.target.value)}
                    className={`${inputCls} text-center`}
                    placeholder="0"
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
        </table>
      </div>
    </div>
  );
};

export default LeaveSummaryInput;
