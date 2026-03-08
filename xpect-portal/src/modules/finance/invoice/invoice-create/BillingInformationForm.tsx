import React from 'react';
import type { BillByInfo, BillToInfo } from './invoiceFormTypes';

export interface ClientOption {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

interface Props {
  billBy: BillByInfo;
  billTo: BillToInfo;
  onBillByChange: (v: Partial<BillByInfo>) => void;
  onBillToChange: (v: Partial<BillToInfo>) => void;
  clients?: ClientOption[];
  selectedClientId?: string;
  onClientSelect?: (clientId: string) => void;
}

const BillingInformationForm: React.FC<Props> = ({
  billBy,
  billTo,
  onBillByChange,
  onBillToChange,
  clients = [],
  selectedClientId = '',
  onClientSelect,
}) => {
  const inputCls = 'w-full px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20';

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide">Billing Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xs font-bold text-[#6b7a99] uppercase tracking-wider mb-3">Bill By</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#6b7a99] mb-1">Company Name</label>
              <input
                type="text"
                value={billBy.companyName}
                onChange={e => onBillByChange({ companyName: e.target.value })}
                className={inputCls}
                placeholder="Company Name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6b7a99] mb-1">Company Address</label>
              <input
                type="text"
                value={billBy.companyAddress}
                onChange={e => onBillByChange({ companyAddress: e.target.value })}
                className={inputCls}
                placeholder="Address"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6b7a99] mb-1">Email</label>
              <input
                type="text"
                value={billBy.email}
                onChange={e => onBillByChange({ email: e.target.value })}
                className={inputCls}
                placeholder="Email"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6b7a99] mb-1">Phone</label>
              <input
                type="text"
                value={billBy.phone}
                onChange={e => onBillByChange({ phone: e.target.value })}
                className={inputCls}
                placeholder="Phone"
              />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold text-[#6b7a99] uppercase tracking-wider mb-3">Bill To</h3>
          {clients.length > 0 && onClientSelect && (
            <div className="mb-3">
              <label className="block text-xs font-semibold text-[#6b7a99] mb-1">Select Client</label>
              <select
                value={selectedClientId}
                onChange={e => onClientSelect(e.target.value)}
                className={inputCls}
              >
                <option value="">— Select a client —</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#6b7a99] mb-1">Client Name</label>
              <input
                type="text"
                value={billTo.clientName}
                onChange={e => onBillToChange({ clientName: e.target.value })}
                className={inputCls}
                placeholder="Client Name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6b7a99] mb-1">Client Address</label>
              <input
                type="text"
                value={billTo.clientAddress}
                onChange={e => onBillToChange({ clientAddress: e.target.value })}
                className={inputCls}
                placeholder="Address"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6b7a99] mb-1">Contact Person</label>
              <input
                type="text"
                value={billTo.contactPerson}
                onChange={e => onBillToChange({ contactPerson: e.target.value })}
                className={inputCls}
                placeholder="Contact Person"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6b7a99] mb-1">Email</label>
              <input
                type="text"
                value={billTo.email}
                onChange={e => onBillToChange({ email: e.target.value })}
                className={inputCls}
                placeholder="Email"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6b7a99] mb-1">Phone</label>
              <input
                type="text"
                value={billTo.phone}
                onChange={e => onBillToChange({ phone: e.target.value })}
                className={inputCls}
                placeholder="Phone"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingInformationForm;
