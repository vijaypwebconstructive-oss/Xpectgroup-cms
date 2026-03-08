import React, { useState, useEffect, useMemo } from 'react';
import { financeNavigate } from '../../financeNavStore';
import { useFinance } from '../../../../context/FinanceContext';
import CompanyInformationForm from '../../invoice/invoice-create/CompanyInformationForm';
import ServiceItemsTable from '../../invoice/invoice-create/ServiceItemsTable';
import InvoiceSummaryCard from '../../invoice/invoice-create/InvoiceSummaryCard';
import NotesSection from '../../invoice/invoice-create/NotesSection';
import FooterSection from '../../invoice/invoice-create/FooterSection';
import QuotationInformationForm from './QuotationInformationForm';
import QuotationBillingForm from './QuotationBillingForm';
import {
  DEFAULT_QUOTATION_FORM_DATA,
  DEFAULT_QUOTATION_SERVICE_ITEMS,
  type QuotationFormData,
} from './quotationFormTypes';
import type { ServiceItemRow } from './quotationFormTypes';

interface Props {
  mode: 'create' | 'edit';
  quotationId?: string | null;
  initialData?: Partial<QuotationFormData>;
}

const QuotationForm: React.FC<Props> = ({ mode, quotationId, initialData }) => {
  const { addQuotation, updateQuotation, refreshQuotations } = useFinance();
  const defaults = { ...DEFAULT_QUOTATION_FORM_DATA, ...initialData };

  const [company, setCompany] = useState(defaults.company);
  const [quotationInfo, setQuotationInfo] = useState(defaults.quotationInfo);
  const [billBy, setBillBy] = useState(defaults.billBy);
  const [billTo, setBillTo] = useState(defaults.billTo);
  const [serviceItems, setServiceItems] = useState(defaults.serviceItems ?? DEFAULT_QUOTATION_SERVICE_ITEMS);
  const [subtotal, setSubtotal] = useState(defaults.subtotal ?? '5400.00');
  const [discount, setDiscount] = useState(defaults.discount ?? '0.00');
  const [vat, setVat] = useState(defaults.vat ?? '1080.00');
  const [serviceCharges, setServiceCharges] = useState(defaults.serviceCharges ?? '0.00');
  const [totalAmount, setTotalAmount] = useState(defaults.totalAmount ?? '6480.00');
  const [payableAmount, setPayableAmount] = useState(defaults.payableAmount ?? '5400.00');
  const [notes, setNotes] = useState(defaults.notes ?? '');
  const [footer, setFooter] = useState(defaults.footer ?? '');
  const [status, setStatus] = useState<QuotationFormData['status']>(defaults.status ?? 'Draft');
  const [submitLoading, setSubmitLoading] = useState(false);

  const computedSubtotal = useMemo(() => {
    return serviceItems.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  }, [serviceItems]);

  useEffect(() => setSubtotal(computedSubtotal.toFixed(2)), [computedSubtotal]);
  useEffect(() => {
    const sub = parseFloat(subtotal) || 0;
    const disc = parseFloat(discount) || 0;
    const v = parseFloat(vat) || 0;
    const sc = parseFloat(serviceCharges) || 0;
    const total = sub - disc + v + sc;
    setTotalAmount(total.toFixed(2));
    setPayableAmount(total.toFixed(2));
  }, [subtotal, discount, vat, serviceCharges]);

  const handleSubmit = async () => {
    const clientName = billTo?.clientName?.trim();
    if (!clientName) {
      alert('Please enter the Client Name.');
      return;
    }
    const total = parseFloat(payableAmount) || parseFloat(totalAmount) || 0;
    if (total <= 0) {
      alert('Total amount must be greater than 0.');
      return;
    }

    const payload = {
      quotationNumber: quotationInfo?.quotationNumber || '',
      issueDate: quotationInfo?.issueDate || '',
      expiryDate: quotationInfo?.expiryDate || '',
      status,
      billBy: billBy || {},
      billTo: billTo || {},
      serviceItems: serviceItems.map((s: ServiceItemRow) => ({
        serviceDescription: s.serviceDescription,
        siteLocation: s.siteLocation,
        quantity: s.quantity,
        rate: s.rate,
        discount: s.discount,
        amount: s.amount,
      })),
      subtotal: parseFloat(subtotal) || 0,
      discount: parseFloat(discount) || 0,
      vat: parseFloat(vat) || 0,
      serviceCharges: parseFloat(serviceCharges) || 0,
      totalAmount: parseFloat(totalAmount) || 0,
      payableAmount: total,
      notes: notes || '',
      footer: footer || '',
    };

    setSubmitLoading(true);
    try {
      if (mode === 'edit' && quotationId) {
        await updateQuotation(quotationId, payload);
        await refreshQuotations();
        financeNavigate('quotation-view', quotationId);
      } else {
        const created = await addQuotation(payload as Parameters<typeof addQuotation>[0]);
        await refreshQuotations();
        financeNavigate('quotation-view', created.id);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save quotation');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePreview = () => financeNavigate('quotation-view', quotationId || 'preview');
  const handleCancel = () => financeNavigate('quotation-list');

  const title = mode === 'create' ? 'Create Quotation' : 'Edit Quotation';

  return (
    <div className="w-full max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-[#4c669a] mb-4 print:hidden">
        <button type="button" onClick={() => financeNavigate('quotation-list')} className="flex items-center gap-2 text-[#4c669a] hover:text-[#2e4150] font-semibold">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Quotation List
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6 sm:p-8 space-y-8">
        <h1 className="text-xl font-bold text-[#0d121b]">{title}</h1>

        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
          <CompanyInformationForm value={company} onChange={v => setCompany(prev => ({ ...prev, ...v }))} />
        </div>

        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
          <QuotationInformationForm value={quotationInfo} onChange={v => setQuotationInfo(prev => ({ ...prev, ...v }))} />
        </div>

        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
          <QuotationBillingForm billBy={billBy} billTo={billTo} onBillByChange={v => setBillBy(prev => ({ ...prev, ...v }))} onBillToChange={v => setBillTo(prev => ({ ...prev, ...v }))} />
        </div>

        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
          <ServiceItemsTable rows={serviceItems} onChange={setServiceItems} />
        </div>

        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
          <InvoiceSummaryCard
            subtotal={subtotal}
            discount={discount}
            vat={vat}
            serviceCharges={serviceCharges}
            totalAmount={totalAmount}
            payableAmount={payableAmount}
            onSubtotalChange={setSubtotal}
            onDiscountChange={setDiscount}
            onVatChange={setVat}
            onServiceChargesChange={setServiceCharges}
            onTotalAmountChange={setTotalAmount}
            onPayableAmountChange={setPayableAmount}
          />
        </div>

        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
          <NotesSection value={notes} onChange={setNotes} />
        </div>

        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
          <FooterSection value={footer} onChange={setFooter} />
        </div>

        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
          <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide">Status</h2>
          <select value={status} onChange={e => setStatus(e.target.value as QuotationFormData['status'])} className="w-full max-w-[200px] px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm">
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={handleSubmit} disabled={submitLoading} className="flex items-center gap-2 px-6 py-2.5 bg-[#2e4150] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
            {submitLoading ? 'Saving…' : mode === 'edit' ? 'Update Quotation' : 'Save Quotation'}
          </button>
          <button type="button" onClick={handlePreview} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#e7ebf3] text-[#4c669a] rounded-lg text-sm font-semibold hover:bg-[#f2f6f9]">
            Preview
          </button>
          <button type="button" onClick={handleCancel} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#e7ebf3] text-[#4c669a] rounded-lg text-sm font-semibold hover:bg-[#f2f6f9]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationForm;
export type { QuotationFormData };
