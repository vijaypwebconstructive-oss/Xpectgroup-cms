import React from 'react';

export interface ServiceItemDisplay {
  serviceDescription?: string;
  siteLocation?: string;
  quantity?: string;
  rate?: string | number;
  discount?: string | number;
  amount?: string | number;
}

interface ServiceItemsTableDisplayProps {
  items?: ServiceItemDisplay[];
  emptyPlaceholder?: ServiceItemDisplay[];
}

const ServiceItemsTableDisplay: React.FC<ServiceItemsTableDisplayProps> = ({
  items = [],
  emptyPlaceholder = [
    { serviceDescription: 'Office Cleaning Service (Daily)', quantity: '20 visits', rate: 120, discount: 0, amount: 2400 },
    { serviceDescription: 'Washroom Sanitization Service', quantity: '20 visits', rate: 35, discount: 0, amount: 700 },
  ],
}) => {
  const hasItems = items.length > 0;
  const rows = hasItems
    ? items.map((s, i) => ({
        no: String(i + 1).padStart(2, '0'),
        description: s.serviceDescription || '',
        quantity: s.quantity ? `${s.quantity} visits` : '0',
        rate: typeof s.rate === 'string' ? parseFloat(s.rate) || 0 : (s.rate ?? 0),
        discount: typeof s.discount === 'string' ? parseFloat(s.discount) || 0 : (s.discount ?? 0),
        amount: typeof s.amount === 'string' ? parseFloat(s.amount) || 0 : (s.amount ?? 0),
      }))
    : emptyPlaceholder.map((s, i) => ({
        no: String(i + 1).padStart(2, '0'),
        description: s.serviceDescription || '',
        quantity: s.quantity ? `${s.quantity}` : '0',
        rate: typeof s.rate === 'string' ? parseFloat(s.rate) || 0 : (s.rate ?? 0),
        discount: typeof s.discount === 'string' ? parseFloat(s.discount) || 0 : (s.discount ?? 0),
        amount: typeof s.amount === 'string' ? parseFloat(s.amount) || 0 : (s.amount ?? 0),
      }));

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full border border-[#e7ebf3] rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-[#f6f6f8] border-b border-[#e7ebf3]">
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">No</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Service Description</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Quantity</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Rate</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Discount</th>
            <th className="text-right text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.no} className="border-b border-[#e7ebf3] hover:bg-[#f8f9fc]">
              <td className="px-4 py-3 text-sm text-[#0d121b]">{row.no}</td>
              <td className="px-4 py-3 text-sm text-[#0d121b]">{row.description}</td>
              <td className="px-4 py-3 text-sm text-[#4c669a]">{row.quantity}</td>
              <td className="px-4 py-3 text-sm text-[#4c669a]">£{row.rate}</td>
              <td className="px-4 py-3 text-sm text-[#4c669a]">{row.discount}%</td>
              <td className="px-4 py-3 text-sm font-semibold text-[#0d121b] text-right">
                £{row.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceItemsTableDisplay;
