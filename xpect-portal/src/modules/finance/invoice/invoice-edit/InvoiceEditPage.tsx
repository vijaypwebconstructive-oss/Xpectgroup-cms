import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import type { Invoice } from '../../finance-payroll/types';
import type { InvoiceFormData } from '../invoice-create/invoiceFormTypes';
import InvoiceForm from '../invoice-create/InvoiceForm';

function mapInvoiceToFormData(inv: Invoice): Partial<InvoiceFormData> {
  return {
    company: {
      companyName: inv.billBy?.companyName || '',
      companyAddress: inv.billBy?.companyAddress || '',
      email: inv.billBy?.email || '',
      phone: inv.billBy?.phone || '',
    },
    invoiceInfo: {
      invoiceNumber: inv.invoiceNumber,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      servicePeriod: inv.servicePeriod || '',
    },
    billBy: inv.billBy || { companyName: '', companyAddress: '', email: '', phone: '' },
    billTo: inv.billTo || { clientName: '', clientAddress: '', contactPerson: '', email: '', phone: '' },
    clientId: inv.clientId || undefined,
    serviceItems: (inv.serviceItems || []).map(s => ({
      serviceDescription: s.serviceDescription || '',
      siteLocation: s.siteLocation || '',
      quantity: s.quantity || '1',
      rate: s.rate || '0',
      discount: s.discount || '0',
      amount: s.amount || '0',
    })),
    subtotal: String(inv.subtotal ?? 0),
    discount: String(inv.discount ?? 0),
    vat: String(inv.vat ?? 0),
    serviceCharges: String(inv.serviceCharges ?? 0),
    totalAmount: String(inv.totalAmount ?? 0),
    payableAmount: String(inv.payableAmount ?? inv.totalAmount ?? 0),
    serviceDetails: (() => {
      const sd = inv.serviceDetails;
      if (!sd) return [{ siteLocation: '', siteType: '', supervisorName: '' }];
      if (Array.isArray(sd) && sd.length) return sd;
      return [sd] as { siteLocation: string; siteType: string; supervisorName: string }[];
    })(),
    notes: inv.notes || '',
    footer: inv.footer ?? '',
  };
}

interface InvoiceEditPageProps {
  invoiceId: string | null;
}

const InvoiceEditPage: React.FC<InvoiceEditPageProps> = ({ invoiceId }) => {
  const [initialData, setInitialData] = useState<Partial<InvoiceFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceId) {
      setLoading(false);
      setError('No invoice ID provided');
      return;
    }
    setLoading(true);
    setError(null);
    api.finance.invoices
      .getById(invoiceId)
      .then((inv: Invoice) => setInitialData(mapInvoiceToFormData(inv)))
      .catch(() => setError('Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[#6b7a99]">Loading invoice...</p>
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error || 'Invoice not found'}</p>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="text-sm font-semibold text-[#4c669a] hover:text-[#2e4150]"
        >
          Back
        </button>
      </div>
    );
  }

  return <InvoiceForm mode="edit" invoiceId={invoiceId} initialData={initialData} />;
};

export default InvoiceEditPage;
