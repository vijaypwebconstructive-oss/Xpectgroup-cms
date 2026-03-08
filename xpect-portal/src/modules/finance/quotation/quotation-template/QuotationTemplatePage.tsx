import React, { useEffect, useState } from 'react';
import { financeNavigate } from '../../financeNavStore';
import api from '../../../../services/api';
import CompanyInformationForm from '../../invoice/invoice-create/CompanyInformationForm';
import ServiceItemsTable from '../../invoice/invoice-create/ServiceItemsTable';
import NotesSection from '../../invoice/invoice-create/NotesSection';
import FooterSection from '../../invoice/invoice-create/FooterSection';
import type { QuotationFormData } from '../quotation-create/quotationFormTypes';
import { DEFAULT_QUOTATION_SERVICE_ITEMS } from '../quotation-create/quotationFormTypes';

const QuotationTemplatePage: React.FC = () => {
  const [company, setCompany] = useState<QuotationFormData['company']>({
    companyName: '',
    companyAddress: '',
    email: '',
    phone: '',
  });
  const [serviceItems, setServiceItems] = useState(DEFAULT_QUOTATION_SERVICE_ITEMS);
  const [notes, setNotes] = useState('');
  const [footer, setFooter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.invoiceSettings
      .get()
      .then((settings) => {
        const billBy = settings.billBy || {};
        setCompany({
          companyLogoBase64: (billBy.companyLogoBase64 as string) || undefined,
          companyName: (billBy.companyName as string) || '',
          companyAddress: (billBy.companyAddress as string) || '',
          email: (billBy.email as string) || '',
          phone: (billBy.phone as string) || '',
        });
        const items = settings.defaultServiceItems;
        setServiceItems(Array.isArray(items) && items.length > 0 ? items : DEFAULT_QUOTATION_SERVICE_ITEMS);
        setNotes((settings.defaultNotes as string) || '');
        setFooter((settings.defaultFooter as string) || '');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load template'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await api.invoiceSettings.update({
        billBy: {
          companyLogoBase64: company.companyLogoBase64,
          companyName: company.companyName,
          companyAddress: company.companyAddress,
          email: company.email,
          phone: company.phone,
        },
        defaultServiceItems: serviceItems,
        defaultNotes: notes,
        defaultFooter: footer,
      });
      alert('Quotation template saved successfully.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[#6b7a99]">Loading template...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error}</p>
        <button type="button" onClick={() => financeNavigate('quotation-list')} className="text-sm font-semibold text-[#4c669a] hover:text-[#2e4150]">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-[#4c669a] mb-4">
        <button type="button" onClick={() => financeNavigate('quotation-list')} className="flex items-center gap-2 text-[#4c669a] hover:text-[#2e4150] font-semibold">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Quotation List
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6 sm:p-8 space-y-8">
        <h1 className="text-xl font-bold text-[#0d121b]">Quotation Template</h1>
        <p className="text-sm text-[#6b7a99]">Set default values for new quotations. These are shared with the Invoice template.</p>

        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
          <CompanyInformationForm value={company} onChange={v => setCompany(prev => ({ ...prev, ...v }))} />
        </div>

        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
          <ServiceItemsTable rows={serviceItems} onChange={setServiceItems} />
        </div>

        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
          <NotesSection value={notes} onChange={setNotes} />
        </div>

        <div className="bg-[#fafbfd] rounded-xl border border-[#e7ebf3] p-4 sm:p-6 space-y-6">
          <FooterSection value={footer} onChange={setFooter} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={handleSave} disabled={saveLoading} className="flex items-center gap-2 px-6 py-2.5 bg-[#2e4150] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
            {saveLoading ? 'Saving…' : 'Save Template'}
          </button>
          <button type="button" onClick={() => financeNavigate('quotation-list')} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#e7ebf3] text-[#4c669a] rounded-lg text-sm font-semibold hover:bg-[#f2f6f9]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplatePage;
