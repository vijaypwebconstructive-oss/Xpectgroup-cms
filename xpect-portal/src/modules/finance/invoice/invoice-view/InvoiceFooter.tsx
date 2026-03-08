import React from 'react';
import { DocumentFooter } from '../../../../components/finance';

interface InvoiceFooterProps {
  footer?: string | null;
}

const InvoiceFooter: React.FC<InvoiceFooterProps> = (props) => <DocumentFooter {...props} />;

export default InvoiceFooter;
