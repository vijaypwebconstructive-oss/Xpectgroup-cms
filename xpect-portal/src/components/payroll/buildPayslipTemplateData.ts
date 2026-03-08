import type { PayrollRecord } from '../../modules/finance-payroll/types';
import type { PayslipTemplateData } from './payslipTemplateTypes';

const MONTH_NAMES = [
  '',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export interface PayslipSettingsLike {
  payType?: 'Hourly' | 'Monthly';
  company?: {
    companyLogoBase64?: string;
    companyName?: string;
    companyAddress?: string;
    payeReference?: string;
  };
  earningsRows?: Array<{ description: string; hours: string; rate: string; amount: string }>;
  deductionsRows?: Array<{ description: string; amount: string }>;
  leaveRows?: Array<{ leaveType: string; entitled: string; used: string; balance: string }>;
  ytdSummary?: { grossPayYTD?: string; taxPaidYTD?: string; niPaidYTD?: string; pensionYTD?: string };
  notes?: string;
}

const DEFAULT_SETTINGS: PayslipSettingsLike = {
  payType: 'Hourly',
  company: {
    companyName: 'Xpect Group',
    companyAddress: 'Address Line 1, City, Postcode',
    payeReference: '123/AB45678',
  },
  earningsRows: [
    { description: 'Basic Pay', hours: '160', rate: '10.00', amount: '1600.00' },
    { description: 'Overtime Pay', hours: '0', rate: '15.00', amount: '0.00' },
    { description: 'Holiday Pay', hours: '0', rate: '10.00', amount: '0.00' },
    { description: 'Bonus', hours: '0', rate: '0.00', amount: '0.00' },
    { description: 'Allowance', hours: '0', rate: '0.00', amount: '0.00' },
  ],
  deductionsRows: [
    { description: 'PAYE Tax', amount: '150.00' },
    { description: 'National Insurance', amount: '85.00' },
    { description: 'Pension Contribution', amount: '75.00' },
    { description: 'Student Loan', amount: '0.00' },
    { description: 'Other Deductions', amount: '0.00' },
  ],
  leaveRows: [
    { leaveType: 'Annual Leave', entitled: '28', used: '5', balance: '23' },
    { leaveType: 'Sick Leave', entitled: '10', used: '0', balance: '10' },
  ],
  ytdSummary: {
    grossPayYTD: '19200.00',
    taxPaidYTD: '1800.00',
    niPaidYTD: '1020.00',
    pensionYTD: '900.00',
  },
};

/**
 * Build PayslipTemplateData from a payroll record and optional template settings.
 * Used by PayslipViewPage and for consistency with PDF/email outputs.
 */
export function buildPayslipTemplateData(
  payroll: PayrollRecord | null,
  settings: PayslipSettingsLike | null = null
): PayslipTemplateData {
  const s = settings || DEFAULT_SETTINGS;
  const payType = (payroll?.payType === 'Monthly' ? 'Monthly' : s.payType) || 'Hourly';
  const isMonthly = payType === 'Monthly';

  const monthLabel = payroll ? MONTH_NAMES[payroll.month] || String(payroll.month) : 'January';
  const year = payroll?.year ?? new Date().getFullYear();
  const payPeriod = `${monthLabel} ${year}`;
  const payDate = payroll?.paymentDate || '—';
  const payslipNumber = payroll ? `PS-${payroll.id}` : 'PS-2026-001';

  const company = s.company || DEFAULT_SETTINGS.company!;
  const totalSalary = payroll?.totalSalary ?? 0;
  const grossPay = totalSalary.toFixed(2);

  // Build earnings rows: use template structure, override Basic Pay with payroll data
  const earningsTemplate = s.earningsRows || DEFAULT_SETTINGS.earningsRows!;
  const earningsRows = earningsTemplate.map((row, i) => {
    if (i === 0 && row.description === 'Basic Pay' && payroll) {
      if (isMonthly) {
        const amt = payroll.monthlySalary ?? payroll.totalSalary ?? 0;
        return {
          description: 'Basic Pay',
          hours: '—',
          rate: '—',
          amount: amt.toFixed(2),
        };
      }
      return {
        description: 'Basic Pay',
        hours: String(payroll.hoursWorked ?? 160),
        rate: (payroll.hourlyRate ?? 0).toFixed(2),
        amount: (payroll.totalSalary ?? 0).toFixed(2),
      };
    }
    return { ...row };
  });

  const deductionsRows = s.deductionsRows || DEFAULT_SETTINGS.deductionsRows!;
  const totalDeductions = deductionsRows
    .reduce((sum, r) => sum + (parseFloat(String(r.amount).replace(/,/g, '')) || 0), 0)
    .toFixed(2);
  const netPay = (parseFloat(grossPay) - parseFloat(totalDeductions)).toFixed(2);

  const ytd = s.ytdSummary || DEFAULT_SETTINGS.ytdSummary!;

  return {
    payType,
    company: {
      companyLogoBase64: company.companyLogoBase64,
      companyName: company.companyName || 'Xpect Group',
      companyAddress: company.companyAddress || 'Address Line 1, City, Postcode',
      payeReference: company.payeReference || '123/AB45678',
      payPeriod,
      payDate,
      payslipNumber,
    },
    employee: {
      employeeId: payroll?.workerId || '—',
      employeeName: payroll?.workerName || '—',
      department: 'Operations',
      jobTitle: payroll?.role || 'Cleaner',
      niNumber: '',
      taxCode: '',
    },
    earningsRows,
    deductionsRows,
    grossPay,
    totalDeductions,
    netPay,
    netPayInWords: numberToWords(parseFloat(netPay)),
    ytdSummary: {
      grossPayYTD: ytd.grossPayYTD || '0.00',
      taxPaidYTD: ytd.taxPaidYTD || '0.00',
      niPaidYTD: ytd.niPaidYTD || '0.00',
      pensionYTD: ytd.pensionYTD || '0.00',
    },
    leaveRows: s.leaveRows || DEFAULT_SETTINGS.leaveRows!,
    notes: s.notes || '',
  };
}

/** Simple number-to-words for net pay (e.g. "1290.00" -> "One thousand two hundred ninety pounds only") */
function numberToWords(n: number): string {
  if (n <= 0 || !isFinite(n)) return 'Zero pounds only';
  const int = Math.floor(n);
  const frac = Math.round((n - int) * 100);
  const ones = [
    '',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const toWords = (x: number): string => {
    if (x === 0) return '';
    if (x < 20) return ones[x];
    if (x < 100) return tens[Math.floor(x / 10)] + (x % 10 ? ' ' + ones[x % 10] : '');
    if (x < 1000) return ones[Math.floor(x / 100)] + ' hundred' + (x % 100 ? ' ' + toWords(x % 100) : '');
    if (x < 1000000) return toWords(Math.floor(x / 1000)) + ' thousand' + (x % 1000 ? ' ' + toWords(x % 1000) : '');
    return String(x);
  };

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const main = cap(toWords(int).trim() || 'zero');
  const pence = frac > 0 ? ` and ${frac}/100` : '';
  return `${main} pounds${pence} only`;
}
