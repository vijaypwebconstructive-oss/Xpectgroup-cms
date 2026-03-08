import React, { useEffect, useState, useRef } from 'react';
import { financeNavigate } from '../../financeNavStore';
import api from '../../../../services/api';
import type { Invoice } from '../../finance-payroll/types';
import InvoiceHeader from './InvoiceHeader';
import BillingInformation from './BillingInformation';
import CleaningServicesTable from './CleaningServicesTable';
import InvoiceSummary from './InvoiceSummary';
import ServiceDetails from './ServiceDetails';
import InvoiceNotes from './InvoiceNotes';
import InvoiceFooter from './InvoiceFooter';

interface InvoiceViewPageProps {
  invoiceId: string;
}

const InvoiceViewPage: React.FC<InvoiceViewPageProps> = ({ invoiceId }) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);
  const hasAutoPrinted = useRef(false);

  const isPlaceholder = invoiceId === 'preview' || invoiceId === 'generated';
  const isPrintMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('print') === 'true';

  useEffect(() => {
    if (isPlaceholder || !invoiceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.finance.invoices
      .getById(invoiceId)
      .then((inv: Invoice) => setInvoice(inv))
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false));
  }, [invoiceId, isPlaceholder]);

  useEffect(() => {
    if (isPrintMode && !loading && invoice && !hasAutoPrinted.current) {
      hasAutoPrinted.current = true;
      window.print();
    }
  }, [isPrintMode, loading, invoice]);

  const handlePrint = () => window.print();

  const handleSendInvoice = async () => {
    if (!invoiceId || !invoice?.billTo?.email?.trim()) {
      alert('Client email is required to send the invoice.');
      return;
    }
    setSendLoading(true);
    try {
      const updated = await api.finance.invoices.send(invoiceId);
      setInvoice(prev => prev ? { ...prev, status: updated.status } : prev);
      alert('Invoice sent successfully to ' + invoice.billTo.email);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send invoice');
    } finally {
      setSendLoading(false);
    }
  };

  if (loading && !isPlaceholder) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[#6b7a99]">Loading invoice...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="print:hidden mb-6">
        <nav className="flex items-center gap-2 text-sm text-[#4c669a] mb-2">
          <span>Home</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Finance & Payroll</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Invoice</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#0d121b] font-semibold">Invoice</span>
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-bold font-black">Invoice</h1>
          <div className="flex items-center gap-2">
            {invoice && invoice.billTo?.email && (
              <button
                type="button"
                onClick={handleSendInvoice}
                disabled={sendLoading}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                {sendLoading ? 'Sending…' : 'Send Invoice'}
              </button>
            )}
            {invoice && (
              <button
                type="button"
                onClick={() => financeNavigate('invoice-edit', invoiceId)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e7ebf3] text-[#4c669a] rounded-lg text-sm font-semibold hover:bg-[#f2f6f9] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={() => financeNavigate('invoice-list')}
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

      <div id="invoice-print-container" className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6 sm:p-8 print:border-0 print:shadow-none print:p-0">
        <InvoiceHeader invoice={invoice} />
        <BillingInformation invoice={invoice} />
        <CleaningServicesTable invoice={invoice} />
        <InvoiceSummary invoice={invoice} />
        <ServiceDetails invoice={invoice} />
        <InvoiceNotes invoice={invoice} />
        <InvoiceFooter footer={invoice?.footer} />
      </div>
    </div>
  );
};

export default InvoiceViewPage;
