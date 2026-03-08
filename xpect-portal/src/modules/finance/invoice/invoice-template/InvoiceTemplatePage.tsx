import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import type { InvoiceFormData } from '../invoice-create/invoiceFormTypes';
import InvoiceForm from '../invoice-create/InvoiceForm';

function mapSettingsToFormData(settings: {
  billBy?: Record<string, unknown>;
  invoicePrefix?: string;
  defaultVatPercent?: number;
  defaultServiceCharges?: number;
  defaultPaymentTermsDays?: number;
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
  defaultServiceDetails?: Record<string, string> | Array<{ siteLocation: string; siteType: string; supervisorName: string }>;
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

  const prefix = settings.invoicePrefix || 'INV-YYYY';
  const year = today.getFullYear();
  const invoicePrefix = prefix.replace('YYYY', String(year));

  return {
    company: {
      companyLogoBase64: (billBy.companyLogoBase64 as string) || undefined,
      companyName: (billBy.companyName as string) || '',
      companyAddress: (billBy.companyAddress as string) || '',
      email: (billBy.email as string) || '',
      phone: (billBy.phone as string) || '',
    },
    invoiceInfo: {
      invoiceNumber: `${invoicePrefix}-001`,
      issueDate: formatDate(today),
      dueDate: formatDate(dueDate),
      servicePeriod: '',
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
  };
}

const InvoiceTemplatePage: React.FC = () => {
  const [initialData, setInitialData] = useState<Partial<InvoiceFormData> | null>(null);
  const [templateDefaults, setTemplateDefaults] = useState<{
    invoicePrefix: string;
    defaultVatPercent: number;
    defaultServiceCharges: number;
    defaultPaymentTermsDays: number;
    defaultNotes: string;
    defaultFooter: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.invoiceSettings
      .get()
      .then((settings) => {
        setInitialData(mapSettingsToFormData(settings));
        setTemplateDefaults({
          invoicePrefix: (settings.invoicePrefix as string) || 'INV-YYYY',
          defaultVatPercent: (settings.defaultVatPercent as number) ?? 20,
          defaultServiceCharges: (settings.defaultServiceCharges as number) ?? 0,
          defaultPaymentTermsDays: (settings.defaultPaymentTermsDays as number) ?? 14,
          defaultNotes: (settings.defaultNotes as string) || '',
          defaultFooter: (settings.defaultFooter as string) || '',
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load invoice template'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[#6b7a99]">Loading template...</p>
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error || 'Failed to load template'}</p>
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

  return (
    <InvoiceForm
      mode="template"
      initialData={initialData}
      templateDefaults={templateDefaults ?? undefined}
    />
  );
};

export default InvoiceTemplatePage;
