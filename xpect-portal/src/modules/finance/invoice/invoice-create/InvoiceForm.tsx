import React, { useState, useEffect, useMemo, useRef } from 'react';
import { financeNavigate } from '../../financeNavStore';
import { useFinance } from '../../../../context/FinanceContext';
import api from '../../../../services/api';
import { useClientsSites } from '../../../../context/ClientsSitesContext';
import CompanyInformationForm from './CompanyInformationForm';
import InvoiceInformationForm from './InvoiceInformationForm';
import BillingInformationForm from './BillingInformationForm';
import ServiceItemsTable from './ServiceItemsTable';
import InvoiceSummaryCard from './InvoiceSummaryCard';
import ServiceDetailsForm from './ServiceDetailsForm';
import NotesSection from './NotesSection';
import FooterSection from './FooterSection';
import InvoiceFormActionButtons from './InvoiceFormActionButtons';
import {
  DEFAULT_INVOICE_FORM_DATA,
  DEFAULT_SERVICE_ITEMS,
  type InvoiceFormData,
} from './invoiceFormTypes';

export interface InvoiceTemplateDefaults {
  invoicePrefix: string;
  defaultVatPercent: number;
  defaultServiceCharges: number;
  defaultPaymentTermsDays: number;
  defaultNotes: string;
  defaultFooter: string;
}

interface Props {
  mode: 'create' | 'edit' | 'template';
  invoiceId?: string | null;
  initialData?: Partial<InvoiceFormData>;
  templateDefaults?: InvoiceTemplateDefaults | null;
}

const InvoiceForm: React.FC<Props> = ({ mode, invoiceId, initialData, templateDefaults }) => {
  const { addInvoice, updateInvoice, refreshInvoices } = useFinance();
  const isTemplate = mode === 'template';
  const { clients } = useClientsSites();
  const defaults = { ...DEFAULT_INVOICE_FORM_DATA, ...initialData };

  const [company, setCompany] = useState(defaults.company);
  const [invoiceInfo, setInvoiceInfo] = useState(defaults.invoiceInfo);
  const [billBy, setBillBy] = useState(defaults.billBy);
  const [billTo, setBillTo] = useState(defaults.billTo);
  const [clientId, setClientId] = useState(defaults.clientId ?? '');
  const [serviceItems, setServiceItems] = useState(defaults.serviceItems ?? DEFAULT_SERVICE_ITEMS);
  const [subtotal, setSubtotal] = useState(defaults.subtotal ?? '5400.00');
  const [discount, setDiscount] = useState(defaults.discount ?? '0.00');
  const [vat, setVat] = useState(defaults.vat ?? '1080.00');
  const [serviceCharges, setServiceCharges] = useState(defaults.serviceCharges ?? '0.00');
  const [totalAmount, setTotalAmount] = useState(defaults.totalAmount ?? '6480.00');
  const [payableAmount, setPayableAmount] = useState(defaults.payableAmount ?? '5400.00');
  const defaultServiceDetails = Array.isArray(defaults.serviceDetails)
    ? defaults.serviceDetails.length
      ? defaults.serviceDetails
      : [{ siteLocation: '', siteType: '', supervisorName: '' }]
    : defaults.serviceDetails && typeof defaults.serviceDetails === 'object' && 'siteLocation' in defaults.serviceDetails
      ? [defaults.serviceDetails]
      : [{ siteLocation: '', siteType: '', supervisorName: '' }];
  const [serviceDetails, setServiceDetails] = useState(defaultServiceDetails);
  const [notes, setNotes] = useState(defaults.notes ?? '');
  const [footer, setFooter] = useState(defaults.footer ?? '');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  const [invPrefix, setInvPrefix] = useState(templateDefaults?.invoicePrefix ?? 'INV-YYYY');
  const [vatPercent, setVatPercent] = useState(templateDefaults?.defaultVatPercent ?? 20);
  const [defServiceCharges, setDefServiceCharges] = useState(templateDefaults?.defaultServiceCharges ?? 0);
  const [paymentTermsDays, setPaymentTermsDays] = useState(templateDefaults?.defaultPaymentTermsDays ?? 14);
  const [defNotes, setDefNotes] = useState(templateDefaults?.defaultNotes ?? '');
  const [defFooter, setDefFooter] = useState(templateDefaults?.defaultFooter ?? '');

  const computedSubtotal = useMemo(() => {
    return serviceItems.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  }, [serviceItems]);

  const initialTemplateRef = useRef<InvoiceTemplateDefaults | null>(null);
  useEffect(() => {
    if (templateDefaults) {
      initialTemplateRef.current = { ...templateDefaults };
      setInvPrefix(templateDefaults.invoicePrefix);
      setVatPercent(templateDefaults.defaultVatPercent);
      setDefServiceCharges(templateDefaults.defaultServiceCharges);
      setPaymentTermsDays(templateDefaults.defaultPaymentTermsDays);
      setDefNotes(templateDefaults.defaultNotes);
      setDefFooter(templateDefaults.defaultFooter);
    }
  }, [templateDefaults]);

  useEffect(() => {
    setSubtotal(computedSubtotal.toFixed(2));
  }, [computedSubtotal]);

  useEffect(() => {
    const sub = parseFloat(subtotal) || 0;
    const disc = parseFloat(discount) || 0;
    const v = parseFloat(vat) || 0;
    const sc = parseFloat(serviceCharges) || 0;
    const total = sub - disc + v + sc;
    setTotalAmount(total.toFixed(2));
    setPayableAmount(total.toFixed(2));
  }, [subtotal, discount, vat, serviceCharges]);

  const handleClientSelect = (selectedId: string) => {
    setClientId(selectedId);
    if (!selectedId) return;
    const c = clients.find(x => x.id === selectedId);
    if (c) {
      setBillTo(prev => ({
        ...prev,
        clientName: c.name,
        clientAddress: c.address || prev.clientAddress,
        contactPerson: c.contactPerson || prev.contactPerson,
        email: c.email || prev.email,
        phone: c.phone || prev.phone,
      }));
    }
  };

  const resetForm = () => {
    const d = { ...DEFAULT_INVOICE_FORM_DATA, ...initialData };
    setCompany(d.company);
    setInvoiceInfo(d.invoiceInfo);
    setBillBy(d.billBy);
    setBillTo(d.billTo);
    setClientId(d.clientId ?? '');
    setServiceItems(d.serviceItems ?? DEFAULT_SERVICE_ITEMS);
    setSubtotal(d.subtotal ?? '5400.00');
    setDiscount(d.discount ?? '0.00');
    setVat(d.vat ?? '1080.00');
    setServiceCharges(d.serviceCharges ?? '0.00');
    setTotalAmount(d.totalAmount ?? '6480.00');
    setPayableAmount(d.payableAmount ?? '5400.00');
    const sd = d.serviceDetails;
    setServiceDetails(
      Array.isArray(sd) && sd.length
        ? sd
        : sd && typeof sd === 'object' && 'siteLocation' in sd
          ? [sd]
          : [{ siteLocation: '', siteType: '', supervisorName: '' }]
    );
    setNotes(d.notes ?? '');
    setFooter(d.footer ?? '');
    if (isTemplate && initialTemplateRef.current) {
      const t = initialTemplateRef.current;
      setInvPrefix(t.invoicePrefix);
      setVatPercent(t.defaultVatPercent);
      setDefServiceCharges(t.defaultServiceCharges);
      setPaymentTermsDays(t.defaultPaymentTermsDays);
      setDefNotes(t.defaultNotes);
      setDefFooter(t.defaultFooter);
    }
  };

  const handlePreview = () => {
    financeNavigate('invoice-view', invoiceId || 'preview');
  };

  const handleGenerate = async () => {
    if (isTemplate) {
      setSubmitLoading(true);
      try {
        await api.invoiceSettings.update({
          billBy: {
            companyLogoBase64: company.companyLogoBase64,
            companyName: company.companyName,
            companyAddress: company.companyAddress,
            email: company.email,
            phone: company.phone,
          },
          invoicePrefix: invPrefix,
          defaultVatPercent: vatPercent,
          defaultServiceCharges: defServiceCharges,
          defaultPaymentTermsDays: paymentTermsDays,
          defaultNotes: defNotes,
          defaultFooter: defFooter,
          defaultServiceItems: serviceItems,
          defaultServiceDetails: serviceDetails,
        });
        alert('Invoice template saved successfully.');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to save template');
      } finally {
        setSubmitLoading(false);
      }
      return;
    }

    const clientName = billTo?.clientName?.trim();
    if (!clientName) {
      alert('Please fill in the Bill To client name.');
      return;
    }
    const total = parseFloat(payableAmount) || parseFloat(totalAmount) || 0;
    if (total <= 0) {
      alert('Total amount must be greater than 0.');
      return;
    }

    const payload = {
      invoiceNumber: invoiceInfo?.invoiceNumber || '',
      issueDate: invoiceInfo?.issueDate || '',
      dueDate: invoiceInfo?.dueDate || '',
      servicePeriod: invoiceInfo?.servicePeriod || '',
      status: 'Pending' as const,
      billBy: billBy || {},
      billTo: billTo || {},
      clientId: clientId || undefined,
      serviceItems: serviceItems.map(s => ({
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
      serviceDetails: Array.isArray(serviceDetails) ? serviceDetails : serviceDetails ? [serviceDetails] : [],
      notes: notes || '',
      footer: footer || '',
    };

    setSubmitLoading(true);
    try {
      if (mode === 'edit' && invoiceId) {
        await updateInvoice(invoiceId, payload);
        await refreshInvoices();
        financeNavigate('invoice-view', invoiceId);
      } else {
        const created = await addInvoice(payload);
        await refreshInvoices();
        financeNavigate('invoice-view', created.id);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save invoice');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    financeNavigate('invoice-list');
  };

  const handleSendInvoice = async () => {
    if (!invoiceId) return;
    if (!billTo?.email?.trim()) {
      alert('Client email is required to send the invoice.');
      return;
    }
    setSendLoading(true);
    try {
      await api.finance.invoices.send(invoiceId);
      await refreshInvoices();
      alert('Invoice sent successfully to ' + billTo.email);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send invoice');
    } finally {
      setSendLoading(false);
    }
  };

  const title = isTemplate ? 'Invoice Template' : mode === 'create' ? 'Create Invoice' : 'Edit Invoice';

  return (
    <div className="w-full max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-[#4c669a] mb-4 print:hidden">
        <button
          type="button"
          onClick={() => financeNavigate('invoice-list')}
          className="flex items-center gap-2 text-[#4c669a] hover:text-[#2e4150] font-semibold"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Invoice List
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6 sm:p-8 space-y-8">
        <h1 className="text-xl font-bold text-[#0d121b]">{title}</h1>

        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
          <CompanyInformationForm value={company} onChange={v => setCompany(prev => ({ ...prev, ...v }))} />
        </div>

        {!isTemplate && (
          <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
            <InvoiceInformationForm value={invoiceInfo} onChange={v => setInvoiceInfo(prev => ({ ...prev, ...v }))} />
          </div>
        )}

        {isTemplate && (
          <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
            <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide">Invoice Defaults</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Invoice Number Prefix</label>
                <input
                  type="text"
                  value={invPrefix}
                  onChange={e => setInvPrefix(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm"
                  placeholder="INV-YYYY"
                />
                <p className="text-xs text-[#6b7a99] mt-1">Use YYYY for year (e.g. INV-2026-001)</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Default VAT %</label>
                <input
                  type="number"
                  value={vatPercent}
                  onChange={e => setVatPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Default Service Charges (£)</label>
                <input
                  type="number"
                  value={defServiceCharges}
                  onChange={e => setDefServiceCharges(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Default Payment Terms (days)</label>
                <input
                  type="number"
                  value={paymentTermsDays}
                  onChange={e => setPaymentTermsDays(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Default Notes</label>
                <textarea
                  value={defNotes}
                  onChange={e => setDefNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Default Footer Message</label>
                <input
                  type="text"
                  value={defFooter}
                  onChange={e => setDefFooter(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm"
                  placeholder="e.g. Thank you for your business"
                />
              </div>
            </div>
          </div>
        )}

        {!isTemplate && (
        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
          <BillingInformationForm
            billBy={billBy}
            billTo={billTo}
            onBillByChange={v => setBillBy(prev => ({ ...prev, ...v }))}
            onBillToChange={v => setBillTo(prev => ({ ...prev, ...v }))}
            clients={clients.map(c => ({
              id: c.id,
              name: c.name,
              contactPerson: c.contactPerson,
              email: c.email,
              phone: c.phone,
              address: c.address,
            }))}
            selectedClientId={clientId}
            onClientSelect={handleClientSelect}
          />
        </div>
        )}

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
          <ServiceDetailsForm rows={serviceDetails} onChange={setServiceDetails} />
        </div>

        {!isTemplate && (
        <>
        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
          <NotesSection value={notes} onChange={setNotes} />
        </div>
        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
          <FooterSection value={footer} onChange={setFooter} />
        </div>
        </>
        )}

        <InvoiceFormActionButtons
          mode={isTemplate ? 'template' : mode}
          onReset={resetForm}
          onCancel={handleCancel}
          onPreview={handlePreview}
          onGenerate={handleGenerate}
          onSendInvoice={mode === 'edit' ? handleSendInvoice : undefined}
          submitLoading={submitLoading}
          sendLoading={sendLoading}
          generateLabel={isTemplate ? 'Save Template' : mode === 'edit' ? 'Update Invoice' : 'Generate Invoice'}
        />
      </div>
    </div>
  );
};

export default InvoiceForm;
