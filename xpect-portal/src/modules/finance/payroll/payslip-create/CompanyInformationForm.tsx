import React from 'react';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface CompanyInfo {
  companyLogoBase64?: string;
  companyName: string;
  companyAddress: string;
  payeReference: string;
  payPeriod: string;
  payDate: string;
  payslipNumber: string;
  month: number;
  year: number;
}

interface Props {
  value: CompanyInfo;
  onChange: (v: Partial<CompanyInfo>) => void;
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
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Company Name</label>
          <input
            type="text"
            value={value.companyName}
            onChange={e => onChange({ companyName: e.target.value })}
            className={inputCls}
            placeholder="Xpect Group"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">PAYE Reference</label>
          <input
            type="text"
            value={value.payeReference}
            onChange={e => onChange({ payeReference: e.target.value })}
            className={inputCls}
            placeholder="123/AB45678"
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
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Pay Period (Month)</label>
          <select
            value={value.month}
            onChange={e => {
              const m = parseInt(e.target.value, 10);
              const payPeriod = m && value.year ? `${MONTH_NAMES[m]} ${value.year}` : value.payPeriod;
              onChange({ month: m, payPeriod });
            }}
            className={inputCls}
          >
            {MONTH_NAMES.slice(1).map((name, i) => (
              <option key={i} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Pay Period (Year)</label>
          <select
            value={value.year}
            onChange={e => {
              const y = parseInt(e.target.value, 10);
              const payPeriod = value.month && y ? `${MONTH_NAMES[value.month]} ${y}` : value.payPeriod;
              onChange({ year: y, payPeriod });
            }}
            className={inputCls}
          >
            {[value.year - 2, value.year - 1, value.year, value.year + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Pay Date</label>
          <input
            type="text"
            value={value.payDate}
            onChange={e => onChange({ payDate: e.target.value })}
            className={inputCls}
            placeholder="31 Jan 2026"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Payslip Number</label>
          <input
            type="text"
            value={value.payslipNumber}
            onChange={e => onChange({ payslipNumber: e.target.value })}
            className={inputCls}
            placeholder="PS-2026-001"
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyInformationForm;
