import React from 'react';
import type { Invoice } from '../../finance-payroll/types';

interface InvoiceNotesProps {
  invoice?: Invoice | null;
}

const InvoiceNotes: React.FC<InvoiceNotesProps> = ({ invoice }) => (
  <div className="mt-6 p-4 border border-[#e7ebf3] rounded-xl">
    <h3 className="text-xs font-bold text-[#6b7a99] uppercase tracking-wider mb-2">Notes</h3>
    <p className="text-sm text-[#4c669a] leading-relaxed">
      {invoice?.notes || 'Cleaning services were performed according to the service contract agreement.'}
    </p>
    <p className="text-sm text-[#4c669a] leading-relaxed mt-2">
      For any invoice queries please contact the accounts department.
    </p>
  </div>
);

export default InvoiceNotes;
