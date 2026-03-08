import React from 'react';
import type { InvoiceCompanyInfo } from './invoiceFormTypes';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

interface Props {
  value: InvoiceCompanyInfo;
  onChange: (v: Partial<InvoiceCompanyInfo>) => void;
}

const CompanyInformationForm: React.FC<Props> = ({ value, onChange }) => {
  const inputCls = 'w-full px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20';

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    fileToBase64(file).then(base64 => onChange({ companyLogoBase64: base64 }));
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide">Company Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Company Logo Upload</label>
          <div className="flex items-center gap-3">
            {value.companyLogoBase64 && (
              <img src={value.companyLogoBase64} alt="Company logo" className="h-12 w-auto rounded border border-[#e7ebf3]" />
            )}
            <input type="file" accept="image/*" onChange={handleLogoChange} className="text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Company Name</label>
          <input
            type="text"
            value={value.companyName}
            onChange={e => onChange({ companyName: e.target.value })}
            className={inputCls}
            placeholder="Company Name"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Email</label>
          <input
            type="text"
            value={value.email}
            onChange={e => onChange({ email: e.target.value })}
            className={inputCls}
            placeholder="info@company.com"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Phone</label>
          <input
            type="text"
            value={value.phone}
            onChange={e => onChange({ phone: e.target.value })}
            className={inputCls}
            placeholder="+44 20 1234 5678"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Company Address</label>
          <input
            type="text"
            value={value.companyAddress}
            onChange={e => onChange({ companyAddress: e.target.value })}
            className={inputCls}
            placeholder="Address Line 1, City, Postcode"
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyInformationForm;
