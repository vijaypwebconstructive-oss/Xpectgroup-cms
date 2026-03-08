import React from 'react';
import { DocumentHeader } from '../../../../components/finance';
import type { Invoice } from '../../finance-payroll/types';

interface InvoiceHeaderProps {
  invoice?: Invoice | null;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ invoice }) => (
  <DocumentHeader
    documentType="invoice"
    documentNumber={invoice?.invoiceNumber}
    issueDate={invoice?.issueDate}
    dueOrExpiryDate={invoice?.dueDate}
    dueDateLabel="Due Date"
    billBy={invoice?.billBy}
  />
);

export default InvoiceHeader;
