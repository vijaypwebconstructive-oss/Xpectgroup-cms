import React from 'react';
import type { ServiceDetailsInfo } from './invoiceFormTypes';

const SITE_TYPES = ['Office', 'Healthcare', 'School', 'Commercial'];

interface Props {
  rows: ServiceDetailsInfo[];
  onChange: (rows: ServiceDetailsInfo[]) => void;
}

const ServiceDetailsForm: React.FC<Props> = ({ rows, onChange }) => {
  const inputCls = 'w-full px-2 py-1.5 bg-[#f6f7fb] border border-[#e7ebf3] rounded text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20';

  const updateRow = (index: number, field: keyof ServiceDetailsInfo, value: string) => {
    const next = [...rows];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const addRow = () => {
    onChange([
      ...rows,
      { siteLocation: '', siteType: '', supervisorName: '' },
    ]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide">Service Details</h2>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-2 text-xs font-semibold text-[#2e4150] hover:underline"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Service Item
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] text-sm border border-[#e7ebf3] rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-[#f6f6f8] border-b border-[#e7ebf3]">
              <th className="px-3 py-2 text-left text-xs font-semibold text-[#6b7a99] uppercase">Site Location</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[#6b7a99] uppercase">Site Type</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[#6b7a99] uppercase">Supervisor Name</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-[#e7ebf3]">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={row.siteLocation}
                    onChange={e => updateRow(i, 'siteLocation', e.target.value)}
                    className={`${inputCls} min-w-[140px]`}
                    placeholder="Site Location"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={row.siteType}
                    onChange={e => updateRow(i, 'siteType', e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select type</option>
                    {SITE_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={row.supervisorName}
                    onChange={e => updateRow(i, 'supervisorName', e.target.value)}
                    className={`${inputCls} min-w-[120px]`}
                    placeholder="Supervisor Name"
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Remove"
                  >
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

export default ServiceDetailsForm;
