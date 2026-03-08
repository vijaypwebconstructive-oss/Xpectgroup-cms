import React, { useEffect, useState, useRef } from 'react';
import { financeNavigate } from '../../financeNavStore';
import api from '../../../../services/api';
import type { Quotation } from '../../../finance-payroll/types';
import { DocumentHeader, BillingSection, ServiceItemsTableDisplay, DocumentSummary, DocumentFooter, DocumentNotes } from '../../../../components/finance';

interface QuotationViewPageProps {
  quotationId: string;
}

const PLACEHOLDER_QUOTATION: Quotation = {
  id: 'sample',
  quotationNumber: 'QUO-2026-001',
  issueDate: '01 Feb 2026',
  expiryDate: '01 Mar 2026',
  status: 'Draft',
  billBy: {
    companyName: 'Xpect Group',
    companyAddress: '24 Kingsway Business Park, London, UK',
    email: 'info@xpectgroup.com',
    phone: '+44 20 1234 5678',
  },
  billTo: {
    clientName: 'Acme Corp',
    clientAddress: '123 Business Avenue, Manchester, UK',
    contactPerson: 'John Smith',
    email: 'accounts@acmecorp.co.uk',
    phone: '+44 161 123 4567',
  },
  serviceItems: [
    { serviceDescription: 'Office Cleaning', siteLocation: 'Main Office', quantity: '20', rate: '120', discount: '0', amount: '2400.00' },
    { serviceDescription: 'Healthcare Facility Cleaning', siteLocation: 'Clinic A', quantity: '20', rate: '150', discount: '0', amount: '3000.00' },
  ],
  subtotal: 5400,
  discount: 0,
  vat: 1080,
  serviceCharges: 0,
  totalAmount: 6480,
  payableAmount: 6480,
  notes: 'Cleaning services will be performed according to the service agreement.',
  footer: 'This quotation is valid for 30 days. Thank you for your business.',
};

const QuotationViewPage: React.FC<QuotationViewPageProps> = ({ quotationId }) => {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const hasAutoPrinted = useRef(false);

  const isPlaceholder = quotationId === 'sample' || quotationId === 'preview';
  const isPrintMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('print') === 'true';

  useEffect(() => {
    if (isPlaceholder || !quotationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.finance.quotations
      .getById(quotationId)
      .then((q: Quotation) => setQuotation(q))
      .catch(() => setQuotation(null))
      .finally(() => setLoading(false));
  }, [quotationId, isPlaceholder]);

  useEffect(() => {
    if (isPrintMode && !loading && (quotation || isPlaceholder) && !hasAutoPrinted.current) {
      hasAutoPrinted.current = true;
      window.print();
    }
  }, [isPrintMode, loading, quotation, isPlaceholder]);

  const handlePrint = () => window.print();

  const displayQuotation = isPlaceholder ? PLACEHOLDER_QUOTATION : quotation;

  if (loading && !isPlaceholder) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[#6b7a99]">Loading quotation...</p>
      </div>
    );
  }

  if (!displayQuotation) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">Quotation not found</p>
        <button
          type="button"
          onClick={() => financeNavigate('quotation-list')}
          className="text-sm font-semibold text-[#4c669a] hover:text-[#2e4150]"
        >
          Back to List
        </button>
      </div>
    );
  }

  const serviceItems = displayQuotation.serviceItems || [];
  const billTo = displayQuotation.billTo || {};
  const hasBillTo = billTo.clientName || displayQuotation.clientName;

  return (
    <div className="w-full">
      <div className="print:hidden mb-6">
        <nav className="flex items-center gap-2 text-sm text-[#4c669a] mb-2">
          <span>Home</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Finance & Payroll</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Quotation</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#0d121b] font-semibold">Quotation</span>
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-bold font-black">Quotation</h1>
          <div className="flex flex-wrap items-center gap-2">
            {!isPlaceholder && (
            <button
              type="button"
              onClick={() => financeNavigate('quotation-edit', quotationId)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e7ebf3] text-[#4c669a] rounded-lg text-sm font-semibold hover:bg-[#f2f6f9] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit
            </button>
            )}
            <button
              type="button"
              onClick={() => financeNavigate('quotation-list')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e7ebf3] text-[#4c669a] rounded-lg text-sm font-semibold hover:bg-[#f2f6f9] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to List
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#2e4150] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              Print
            </button>
          </div>
        </div>
      </div>

      <div id="quotation-print-container" className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6 sm:p-8 print:border-0 print:shadow-none print:p-0">
        <DocumentHeader
          documentType="quotation"
          documentNumber={displayQuotation.quotationNumber}
          issueDate={displayQuotation.issueDate}
          dueOrExpiryDate={displayQuotation.expiryDate}
          dueDateLabel="Expiry Date"
          billBy={displayQuotation.billBy}
        />
        <BillingSection billBy={displayQuotation.billBy} billTo={hasBillTo ? { ...billTo, clientName: billTo.clientName || displayQuotation.clientName, email: billTo.email || displayQuotation.clientEmail } : billTo} />
        <ServiceItemsTableDisplay
          items={serviceItems.map(s => ({
            serviceDescription: s.serviceDescription,
            quantity: s.quantity,
            rate: s.rate,
            discount: s.discount,
            amount: s.amount,
          }))}
          emptyPlaceholder={[
            { serviceDescription: 'Office Cleaning Service (Daily)', quantity: '20 visits', rate: 120, discount: 0, amount: 2400 },
            { serviceDescription: 'Washroom Sanitization Service', quantity: '20 visits', rate: 35, discount: 0, amount: 700 },
          ]}
        />
        <DocumentSummary
          subtotal={displayQuotation.subtotal ?? 4785}
          discount={displayQuotation.discount ?? 0}
          vat={displayQuotation.vat ?? 957}
          serviceCharges={displayQuotation.serviceCharges ?? 0}
          totalAmount={displayQuotation.totalAmount ?? displayQuotation.totalPrice ?? 5742}
          payableAmount={displayQuotation.payableAmount ?? displayQuotation.totalPrice ?? displayQuotation.totalAmount ?? 0}
          showPayableAmount
        />
        <DocumentNotes notes={displayQuotation.notes} />
        <DocumentFooter footer={displayQuotation.footer} />
      </div>
    </div>
  );
};

export default QuotationViewPage;
