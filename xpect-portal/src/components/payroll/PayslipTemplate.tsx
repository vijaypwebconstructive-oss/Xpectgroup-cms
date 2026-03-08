import React from 'react';
import type { PayslipTemplateData } from './payslipTemplateTypes';

export interface PayslipTemplateProps {
  data: PayslipTemplateData;
  /** Wrapper className for print styling (e.g. border, padding). Default: payslip card styles. */
  className?: string;
  /** When true, hides content that should not print (e.g. back button). Used by parent. */
  printMode?: boolean;
}

/**
 * Unified payslip layout used by:
 * - Payslip module view (PayslipViewPage)
 * - PDF download (backend mirrors this layout)
 * - Email attachments (PDF)
 */
const PayslipTemplate: React.FC<PayslipTemplateProps> = ({ data, className = '', printMode = false }) => {
  const {
    company,
    employee,
    payType,
    earningsRows,
    deductionsRows,
    grossPay,
    totalDeductions,
    netPay,
    netPayInWords,
    ytdSummary,
    leaveRows,
    notes,
  } = data;

  const formatCurrency = (val: string) => {
    const n = parseFloat(String(val).replace(/,/g, '')) || 0;
    return n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div
      className={`bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6 sm:p-8 print:shadow-none print:border print:rounded-none print:p-6 ${className}`}
      id="payslip-content"
    >
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-6 pb-4 border-b-2 border-[#2e4150]">
        <div className="space-y-1">
          {company.companyLogoBase64 ? (
            <img src={company.companyLogoBase64} alt="Company" className="h-12 w-auto print:h-10" />
          ) : (
            <img src="/logo.webp" alt="Company" className="h-12 w-auto print:h-10" />
          )}
          <p className="text-lg font-bold text-[#0d121b]">{company.companyName}</p>
          <p className="text-sm text-[#4c669a]">{company.companyAddress}</p>
          <p className="text-sm text-[#4c669a]">PAYE Reference: {company.payeReference}</p>
        </div>
        <div className="text-right">
          <h1 className="text-xl font-black font-bold text-[#0d121b] tracking-wide uppercase">Payslip</h1>
          <div className="mt-3 space-y-1 text-sm">
            <p>
              <span className="font-semibold text-[#6b7a99]">Pay Period:</span>{' '}
              <span className="text-[#0d121b]">{company.payPeriod}</span>
            </p>
            <p>
              <span className="font-semibold text-[#6b7a99]">Pay Date:</span>{' '}
              <span className="text-[#0d121b]">{company.payDate}</span>
            </p>
            <p>
              <span className="font-semibold text-[#6b7a99]">Payslip Number:</span>{' '}
              <span className="text-[#0d121b]">{company.payslipNumber}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Employee Information */}
      <div className="mt-6">
        <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide mb-2">Employee Information</h2>
        <div className="bg-white rounded-xl border border-[#e7ebf3] overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-[#e7ebf3]">
                <td className="px-4 py-3 w-1/3 font-semibold text-[#6b7a99] bg-[#f6f7fb]">Employee ID</td>
                <td className="px-4 py-3 text-[#0d121b]">{employee.employeeId}</td>
              </tr>
              <tr className="border-b border-[#e7ebf3]">
                <td className="px-4 py-3 font-semibold text-[#6b7a99] bg-[#f6f7fb]">Employee Name</td>
                <td className="px-4 py-3 text-[#0d121b]">{employee.employeeName}</td>
              </tr>
              <tr className="border-b border-[#e7ebf3]">
                <td className="px-4 py-3 font-semibold text-[#6b7a99] bg-[#f6f7fb]">Department</td>
                <td className="px-4 py-3 text-[#0d121b]">{employee.department}</td>
              </tr>
              <tr className="border-b border-[#e7ebf3]">
                <td className="px-4 py-3 font-semibold text-[#6b7a99] bg-[#f6f7fb]">Job Title</td>
                <td className="px-4 py-3 text-[#0d121b]">{employee.jobTitle}</td>
              </tr>
              <tr className="border-b border-[#e7ebf3]">
                <td className="px-4 py-3 font-semibold text-[#6b7a99] bg-[#f6f7fb]">National Insurance Number</td>
                <td className="px-4 py-3 text-[#0d121b]">{employee.niNumber || '—'}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-[#6b7a99] bg-[#f6f7fb]">Tax Code</td>
                <td className="px-4 py-3 text-[#0d121b]">{employee.taxCode || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Earnings & Deductions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 print:grid-cols-2">
        <div>
          <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide mb-2">Earnings</h2>
          <div className="bg-white rounded-xl border border-[#e7ebf3] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e7ebf3] bg-[#f6f7fb]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">
                    Hours
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">
                    Rate (£)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">
                    Amount (£)
                  </th>
                </tr>
              </thead>
              <tbody>
                {earningsRows.map((row, i) => (
                  <tr key={i} className="border-b border-[#e7ebf3]">
                    <td className="px-4 py-3 text-[#0d121b]">{row.description}</td>
                    <td className="px-4 py-3 text-right font-medium text-[#0d121b]">{row.hours}</td>
                    <td className="px-4 py-3 text-right font-medium text-[#0d121b]">{row.rate}</td>
                    <td className="px-4 py-3 text-right font-medium text-[#0d121b]">{row.amount}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-[#2e4150] bg-[#f6f7fb] font-bold">
                  <td className="px-4 py-3 text-[#0d121b]" colSpan={3}>
                    Gross Pay
                  </td>
                  <td className="px-4 py-3 text-right text-[#0d121b]">£{formatCurrency(grossPay)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide mb-2">Deductions</h2>
          <div className="bg-white rounded-xl border border-[#e7ebf3] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e7ebf3] bg-[#f6f7fb]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">
                    Amount (£)
                  </th>
                </tr>
              </thead>
              <tbody>
                {deductionsRows.map((row, i) => (
                  <tr key={i} className="border-b border-[#e7ebf3]">
                    <td className="px-4 py-3 text-[#0d121b]">{row.description}</td>
                    <td className="px-4 py-3 text-right font-medium text-[#0d121b]">{row.amount}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-[#2e4150] bg-[#f6f7fb] font-bold">
                  <td className="px-4 py-3 text-[#0d121b]">Total Deductions</td>
                  <td className="px-4 py-3 text-right text-[#0d121b]">£{formatCurrency(totalDeductions)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Net Pay Summary */}
      <div className="mt-6">
        <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide mb-2">Net Salary Summary</h2>
        <div className="bg-[#2e4150] rounded-xl border border-[#2e4150] overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-white/20">
                <td className="px-4 py-3 w-1/3 font-semibold text-white/90">Gross Pay</td>
                <td className="px-4 py-3 text-right text-white">£{formatCurrency(grossPay)}</td>
              </tr>
              <tr className="border-b border-white/20">
                <td className="px-4 py-3 font-semibold text-white/90">Total Deductions</td>
                <td className="px-4 py-3 text-right text-white">£{formatCurrency(totalDeductions)}</td>
              </tr>
              <tr>
                <td className="px-4 py-4 font-bold text-white">Net Pay</td>
                <td className="px-4 py-4 text-right font-bold text-white text-lg">£{formatCurrency(netPay)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-white/90 align-top">Net Pay in Words</td>
                <td className="px-4 py-3 text-right text-white">{netPayInWords || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Year To Date Summary */}
      <div className="mt-6">
        <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide mb-2">Year To Date Summary</h2>
        <div className="bg-white rounded-xl border border-[#e7ebf3] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e7ebf3] bg-[#f6f7fb]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">
                  Amount (£)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#e7ebf3]">
                <td className="px-4 py-3 font-semibold text-[#6b7a99] bg-[#f6f7fb]">Gross Pay YTD</td>
                <td className="px-4 py-3 text-right text-[#0d121b]">£{formatCurrency(ytdSummary.grossPayYTD)}</td>
              </tr>
              <tr className="border-b border-[#e7ebf3]">
                <td className="px-4 py-3 font-semibold text-[#6b7a99] bg-[#f6f7fb]">Tax Paid YTD</td>
                <td className="px-4 py-3 text-right text-[#0d121b]">£{formatCurrency(ytdSummary.taxPaidYTD)}</td>
              </tr>
              <tr className="border-b border-[#e7ebf3]">
                <td className="px-4 py-3 font-semibold text-[#6b7a99] bg-[#f6f7fb]">NI Paid YTD</td>
                <td className="px-4 py-3 text-right text-[#0d121b]">£{formatCurrency(ytdSummary.niPaidYTD)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-[#6b7a99] bg-[#f6f7fb]">Pension YTD</td>
                <td className="px-4 py-3 text-right text-[#0d121b]">£{formatCurrency(ytdSummary.pensionYTD)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Summary */}
      {leaveRows.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide mb-2">Leave Summary</h2>
          <div className="bg-white rounded-xl border border-[#e7ebf3] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e7ebf3] bg-[#f6f7fb]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">
                    Leave Type
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">
                    Entitled
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">
                    Used
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaveRows.map((row, i) => (
                  <tr key={i} className="border-b border-[#e7ebf3]">
                    <td className="px-4 py-3 text-[#0d121b]">{row.leaveType}</td>
                    <td className="px-4 py-3 text-center text-[#0d121b]">{row.entitled}</td>
                    <td className="px-4 py-3 text-center text-[#0d121b]">{row.used}</td>
                    <td className="px-4 py-3 text-center font-medium text-[#0d121b]">{row.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="mt-6">
          <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide mb-2">Notes</h2>
          <p className="text-sm text-[#0d121b] bg-[#f6f7fb] rounded-xl border border-[#e7ebf3] px-4 py-3">
            {notes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-[#e7ebf3]">
        <div className="flex flex-wrap justify-between items-end gap-6">
          <div>
            <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1">Employee Signature</p>
            <div className="h-12 border-b border-[#0d121b] w-48" />
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1">Authorized Signature</p>
            <div className="h-12 border-b border-[#0d121b] w-48 ml-auto" />
          </div>
        </div>
        <div className="mt-8 space-y-1 text-xs text-[#6b7a99] text-center">
          <p>This is a computer generated payslip and does not require a signature.</p>
          <p>For any discrepancies please contact HR department within 7 days.</p>
        </div>
      </div>
    </div>
  );
};

export default PayslipTemplate;
