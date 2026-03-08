import React from 'react';
import type { ServiceItemRow } from './invoiceFormTypes';

interface Props {
  rows: ServiceItemRow[];
  onChange: (rows: ServiceItemRow[]) => void;
}

const ServiceItemsTable: React.FC<Props> = ({ rows, onChange }) => {
  const inputCls = 'w-full px-2 py-1.5 bg-[#f6f7fb] border border-[#e7ebf3] rounded text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20';

  const updateRow = (index: number, field: keyof ServiceItemRow, value: string) => {
    const next = [...rows];
    next[index] = { ...next[index], [field]: value };
    const rate = parseFloat(next[index].rate) || 0;
    const qty = parseFloat(next[index].quantity) || 0;
    const disc = parseFloat(next[index].discount) || 0;
    const amt = rate * qty * (1 - disc / 100);
    next[index].amount = amt.toFixed(2);
    onChange(next);
  };

  const addRow = () => {
    onChange([
      ...rows,
      {
        serviceDescription: '',
        siteLocation: '',
        quantity: '1',
        rate: '0',
        discount: '0',
        amount: '0.00',
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide">Cleaning Services</h2>
        <button type="button" onClick={addRow} className="flex items-center gap-2 text-xs font-semibold text-[#2e4150] hover:underline">
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Service Item
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm border border-[#e7ebf3] rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-[#f6f6f8] border-b border-[#e7ebf3]">
              <th className="px-3 py-2 text-left text-xs font-semibold text-[#6b7a99] uppercase">Service Description</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[#6b7a99] uppercase">Site Location</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[#6b7a99] uppercase">Quantity / Visits</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[#6b7a99] uppercase">Rate (£)</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[#6b7a99] uppercase">Discount (%)</th>
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
                    value={row.serviceDescription}
                    onChange={e => updateRow(i, 'serviceDescription', e.target.value)}
                    className={`${inputCls} min-w-[140px]`}
                    placeholder="e.g. Office Cleaning, Waste Disposal"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={row.siteLocation}
                    onChange={e => updateRow(i, 'siteLocation', e.target.value)}
                    className={`${inputCls} min-w-[100px]`}
                    placeholder="Site"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={row.quantity}
                    onChange={e => updateRow(i, 'quantity', e.target.value)}
                    className={`${inputCls} w-20 text-right`}
                    placeholder="1"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={row.rate}
                    onChange={e => updateRow(i, 'rate', e.target.value)}
                    className={`${inputCls} w-24 text-right`}
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={row.discount}
                    onChange={e => updateRow(i, 'discount', e.target.value)}
                    className={`${inputCls} w-16 text-right`}
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium text-[#0d121b]">£{row.amount}</td>
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

export default ServiceItemsTable;
