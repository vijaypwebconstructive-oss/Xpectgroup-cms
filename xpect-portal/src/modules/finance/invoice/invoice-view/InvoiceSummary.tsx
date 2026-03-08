import React from 'react';
import { DocumentSummary } from '../../../../components/finance';
import type { Invoice } from '../../finance-payroll/types';

interface InvoiceSummaryProps {
  invoice?: Invoice | null;
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({ invoice }) => (
  <DocumentSummary
    subtotal={invoice?.subtotal ?? 4785}
    discount={invoice?.discount ?? 0}
    vat={invoice?.vat ?? 957}
    serviceCharges={invoice?.serviceCharges ?? 0}
    totalAmount={invoice?.totalAmount ?? 5742}
    payableAmount={invoice?.payableAmount ?? invoice?.totalAmount ?? 4785}
    showPayableAmount
  />
);

export default InvoiceSummary;
