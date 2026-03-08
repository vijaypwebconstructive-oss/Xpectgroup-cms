import React from 'react';

export interface BillingParty {
  companyName?: string;
  companyAddress?: string;
  email?: string;
  phone?: string;
}

export interface ClientInfo {
  clientName?: string;
  clientAddress?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
}

interface BillingSectionProps {
  billBy?: BillingParty | null;
  billTo?: ClientInfo | null;
}

const BillingSection: React.FC<BillingSectionProps> = ({ billBy, billTo }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
    <div>
      <h3 className="text-xs font-bold text-[#6b7a99] uppercase tracking-wider mb-2">Bill By</h3>
      <p className="text-sm font-bold text-[#0d121b]">{billBy?.companyName || 'Xpect Group'}</p>
      <p className="text-sm text-[#4c669a] mt-1">{billBy?.companyAddress || '24 Kingsway Business Park'}</p>
      <p className="text-sm text-[#4c669a]">London, UK</p>
      <p className="text-sm text-[#4c669a] mt-2">{billBy?.email || 'info@xpectgroup.com'}</p>
      <p className="text-sm text-[#4c669a]">{billBy?.phone || '+44 20 1234 5678'}</p>
    </div>
    <div>
      <h3 className="text-xs font-bold text-[#6b7a99] uppercase tracking-wider mb-2">Bill To</h3>
      <p className="text-sm font-bold text-[#0d121b]">{billTo?.clientName || 'Acme Corp'}</p>
      <p className="text-sm text-[#4c669a] mt-1">{billTo?.clientAddress || '123 Business Avenue'}</p>
      <p className="text-sm text-[#4c669a]">Manchester, UK</p>
      <p className="text-sm text-[#4c669a] mt-2">Contact: {billTo?.contactPerson || 'John Smith'}</p>
      <p className="text-sm text-[#4c669a]">{billTo?.email || 'accounts@acmecorp.co.uk'}</p>
      <p className="text-sm text-[#4c669a]">{billTo?.phone || '+44 161 123 4567'}</p>
    </div>
  </div>
);

export default BillingSection;
