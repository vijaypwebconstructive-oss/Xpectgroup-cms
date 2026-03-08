import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import type { InvoiceFormData } from './invoiceFormTypes';
import InvoiceForm from './InvoiceForm';

function mapSettingsToFormData(settings: {
  billBy?: Record<string, unknown>;
  invoicePrefix?: string;
  defaultVatPercent?: number;
  defaultServiceCharges?: number;
  defaultPaymentTermsDays?: number;
  defaultNotes?: string;
  defaultServiceItems?: Array<{
    serviceDescription: string;
    siteLocation: string;
    quantity: string;
    rate: string;
    discount: string;
    amount: string;
  }>;
  defaultServiceDetails?: Record<string, string> | Array<{ siteLocation: string; siteType: string; supervisorName: string }>;
  defaultFooter?: string;
}): Partial<InvoiceFormData> {
  const billBy = settings.billBy || {};
  const items = settings.defaultServiceItems || [];
  const subtotal = items.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const vatPercent = settings.defaultVatPercent ?? 20;
  const vatAmount = subtotal * (vatPercent / 100);
  const serviceCharges = settings.defaultServiceCharges ?? 0;
  const total = subtotal + vatAmount + serviceCharges;

  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + (settings.defaultPaymentTermsDays ?? 14));

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return {
    invoiceInfo: {
      invoiceNumber: '', // Backend will auto-generate on create
      issueDate: formatDate(today),
      dueDate: formatDate(dueDate),
      servicePeriod: '',
    },
    company: {
      companyLogoBase64: (billBy.companyLogoBase64 as string) || undefined,
      companyName: (billBy.companyName as string) || '',
      companyAddress: (billBy.companyAddress as string) || '',
      email: (billBy.email as string) || '',
      phone: (billBy.phone as string) || '',
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
    serviceCharges: serviceCharges.toFixed(2),
    totalAmount: total.toFixed(2),
    payableAmount: total.toFixed(2),
    serviceDetails: (() => {
      const sd = settings.defaultServiceDetails;
      if (!sd) return [{ siteLocation: '', siteType: '', supervisorName: '' }];
      if (Array.isArray(sd) && sd.length) return sd;
      return [sd];
    })(),
    notes: settings.defaultNotes || '',
    footer: settings.defaultFooter || '',
  };
}

const InvoiceCreatePage: React.FC = () => {
  const [initialData, setInitialData] = useState<Partial<InvoiceFormData> | null>(null);
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

  return <InvoiceForm mode="create" initialData={initialData ?? undefined} />;
};

export default InvoiceCreatePage;
