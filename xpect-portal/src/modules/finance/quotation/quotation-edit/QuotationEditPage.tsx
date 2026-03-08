import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import type { Quotation } from '../../../finance-payroll/types';
import QuotationForm, { type QuotationFormData } from '../quotation-create/QuotationForm';

function mapQuotationToFormData(q: Quotation): Partial<QuotationFormData> {
  const billTo = q.billTo || {};
  const hasNewFormat = q.serviceItems && q.serviceItems.length > 0;
  return {
    company: q.billBy ? { companyName: q.billBy.companyName || '', companyAddress: q.billBy.companyAddress || '', email: q.billBy.email || '', phone: q.billBy.phone || '' } : undefined,
    quotationInfo: {
      quotationNumber: q.quotationNumber || '',
      issueDate: q.issueDate || '',
      expiryDate: q.expiryDate || '',
    },
    billBy: q.billBy ? { companyName: q.billBy.companyName || '', companyAddress: q.billBy.companyAddress || '', email: q.billBy.email || '', phone: q.billBy.phone || '' } : undefined,
    billTo: {
      clientName: billTo.clientName || q.clientName || '',
      clientAddress: billTo.clientAddress || q.serviceAddress || '',
      contactPerson: billTo.contactPerson || '',
      email: billTo.email || q.clientEmail || '',
      phone: billTo.phone || '',
    },
    serviceItems: hasNewFormat
      ? (q.serviceItems || []).map(s => ({
          serviceDescription: s.serviceDescription || '',
          siteLocation: s.siteLocation || '',
          quantity: s.quantity || '1',
          rate: s.rate || '0',
          discount: s.discount || '0',
          amount: s.amount || '0',
        }))
      : (() => {
          const nc = q.numCleaners ?? 1;
          const hpv = q.hoursPerVisit ?? 2;
          const vpw = q.visitsPerWeek ?? 5;
          const hr = q.hourlyRate ?? 0;
          const amt = Math.round(nc * hpv * vpw * 4 * hr * 100) / 100;
          return [{
            serviceDescription: q.serviceDescription || '',
            siteLocation: q.serviceAddress || '',
            quantity: String(nc * hpv * vpw * 4),
            rate: String(hr),
            discount: '0',
            amount: String(amt),
          }];
        })(),
    subtotal: q.subtotal != null ? String(q.subtotal) : undefined,
    discount: q.discount != null ? String(q.discount) : undefined,
    vat: q.vat != null ? String(q.vat) : undefined,
    serviceCharges: q.serviceCharges != null ? String(q.serviceCharges) : undefined,
    totalAmount: q.totalAmount != null ? String(q.totalAmount) : q.totalPrice != null ? String(q.totalPrice) : undefined,
    payableAmount: q.payableAmount != null ? String(q.payableAmount) : undefined,
    notes: q.notes || '',
    footer: q.footer || '',
    status: (q.status || 'Draft') as QuotationFormData['status'],
  };
}

interface QuotationEditPageProps {
  quotationId: string | null;
}

const QuotationEditPage: React.FC<QuotationEditPageProps> = ({ quotationId }) => {
  const [initialData, setInitialData] = useState<Partial<QuotationFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quotationId) {
      setLoading(false);
      setError('No quotation ID provided');
      return;
    }
    setLoading(true);
    setError(null);
    api.finance.quotations
      .getById(quotationId)
      .then((q: Quotation) => setInitialData(mapQuotationToFormData(q)))
      .catch(() => setError('Failed to load quotation'))
      .finally(() => setLoading(false));
  }, [quotationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[#6b7a99]">Loading quotation...</p>
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error || 'Quotation not found'}</p>
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

  return <QuotationForm mode="edit" quotationId={quotationId} initialData={initialData} />;
};

export default QuotationEditPage;
