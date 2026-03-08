import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import type { QuotationFormData } from './quotationFormTypes';
import QuotationForm from './QuotationForm';

function mapSettingsToFormData(settings: {
  billBy?: Record<string, unknown>;
  defaultNotes?: string;
  defaultFooter?: string;
  defaultServiceItems?: Array<{
    serviceDescription: string;
    siteLocation: string;
    quantity: string;
    rate: string;
    discount: string;
    amount: string;
  }>;
}): Partial<QuotationFormData> {
  const billBy = settings.billBy || {};
  const items = settings.defaultServiceItems || [];
  const subtotal = items.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const vatAmount = Math.round(subtotal * 0.2 * 100) / 100;
  const total = subtotal + vatAmount;

  const today = new Date();
  const expiryDate = new Date(today);
  expiryDate.setDate(expiryDate.getDate() + 30);
  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return {
    company: {
      companyLogoBase64: (billBy.companyLogoBase64 as string) || undefined,
      companyName: (billBy.companyName as string) || '',
      companyAddress: (billBy.companyAddress as string) || '',
      email: (billBy.email as string) || '',
      phone: (billBy.phone as string) || '',
    },
    quotationInfo: {
      quotationNumber: '',
      issueDate: formatDate(today),
      expiryDate: formatDate(expiryDate),
    },
    billBy: {
      companyName: (billBy.companyName as string) || '',
      companyAddress: (billBy.companyAddress as string) || '',
      email: (billBy.email as string) || '',
      phone: (billBy.phone as string) || '',
    },
    billTo: {
      clientName: '',
      clientAddress: '',
      contactPerson: '',
      email: '',
      phone: '',
    },
    serviceItems: items.length > 0 ? items : [
      { serviceDescription: 'Office Cleaning', siteLocation: 'Main Office', quantity: '20', rate: '120', discount: '0', amount: '2400.00' },
      { serviceDescription: 'Healthcare Facility Cleaning', siteLocation: 'Clinic A', quantity: '20', rate: '150', discount: '0', amount: '3000.00' },
    ],
    subtotal: subtotal.toFixed(2),
    discount: '0.00',
    vat: vatAmount.toFixed(2),
    serviceCharges: '0.00',
    totalAmount: total.toFixed(2),
    payableAmount: total.toFixed(2),
    notes: settings.defaultNotes || '',
    footer: settings.defaultFooter || '',
  };
}

const QuotationCreatePage: React.FC = () => {
  const [initialData, setInitialData] = useState<Partial<QuotationFormData> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.invoiceSettings
      .get()
      .then((settings) => setInitialData(mapSettingsToFormData(settings)))
      .catch(() => setInitialData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[#6b7a99]">Loading...</p>
      </div>
    );
  }

  return <QuotationForm mode="create" initialData={initialData ?? undefined} />;
};

export default QuotationCreatePage;
