import React from 'react';

export interface DocumentHeaderBillBy {
  companyName?: string;
  companyAddress?: string;
  email?: string;
  phone?: string;
}

interface DocumentHeaderProps {
  documentType: 'invoice' | 'quotation';
  documentNumber?: string;
  issueDate?: string;
  dueOrExpiryDate?: string;
  dueDateLabel?: string;
  billBy?: DocumentHeaderBillBy | null;
}

const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  documentType,
  documentNumber,
  issueDate,
  dueOrExpiryDate,
  dueDateLabel,
  billBy,
}) => {
  const isInvoice = documentType === 'invoice';
  const title = isInvoice ? 'Invoice' : 'Quotation';
  const numLabel = isInvoice ? 'Invoice Number' : 'Quotation Number';
  const dateLabel = isInvoice ? 'Due Date' : 'Expiry Date';
  const label = dueDateLabel ?? dateLabel;

  const defaultNum = isInvoice ? 'INV-2026-001' : 'QUO-2026-001';
  const defaultIssue = '01 Feb 2026';
  const defaultDue = '15 Feb 2026';

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 print:flex-row">
      <div>
        <div className="w-20 h-20 rounded-lg flex items-center justify-center mb-3">
          <img src="/logo.webp" alt="Company" className="h-20 w-auto print:h-10" />
        </div>
        <p className="text-base font-bold text-[#0d121b]">{billBy?.companyName || 'Xpect Group'}</p>
        <p className="text-sm text-[#4c669a] mt-1">{billBy?.companyAddress || '24 Kingsway Business Park'}</p>
        <p className="text-sm text-[#4c669a]">London, UK</p>
        <p className="text-sm text-[#4c669a] mt-2">{billBy?.email || 'info@xpectgroup.com'}</p>
        <p className="text-sm text-[#4c669a]">{billBy?.phone || '+44 20 1234 5678'}</p>
      </div>
      <div className="text-left sm:text-right">
        <h1 className="text-xl font-black font-bold text-[#0d121b] uppercase tracking-wide">{title}</h1>
        <div className="mt-4 space-y-1">
          <p className="text-sm text-[#4c669a]">
            <span className="font-semibold text-[#0d121b]">{numLabel}:</span> {documentNumber || defaultNum}
          </p>
          <p className="text-sm text-[#4c669a]">
            <span className="font-semibold text-[#0d121b]">Issue Date:</span> {issueDate || defaultIssue}
          </p>
          <p className="text-sm text-[#4c669a]">
            <span className="font-semibold text-[#0d121b]">{label}:</span> {dueOrExpiryDate || defaultDue}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentHeader;
