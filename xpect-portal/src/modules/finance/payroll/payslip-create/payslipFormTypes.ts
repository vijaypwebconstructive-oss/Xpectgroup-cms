import type { EarningsRow } from './EarningsTableInput';
import type { DeductionsRow } from './DeductionsTableInput';
import type { LeaveRow } from './LeaveSummaryInput';

export interface YTDSummary {
  grossPayYTD: string;
  taxPaidYTD: string;
  niPaidYTD: string;
  pensionYTD: string;
}

export type PayType = 'Hourly' | 'Monthly';

export interface PayslipFormData {
  payType: PayType;
  company: {
    companyLogoBase64?: string;
    companyName: string;
    companyAddress: string;
    payeReference: string;
    payPeriod: string;
    payDate: string;
    payslipNumber: string;
    month: number;
    year: number;
  };
  employee: {
    employeeId: string;
    employeeName: string;
    department: string;
    jobTitle: string;
    niNumber: string;
    taxCode: string;
  };
  earningsRows: EarningsRow[];
  deductionsRows: DeductionsRow[];
  netPay: string;
  netPayInWords: string;
  ytdSummary: YTDSummary;
  leaveRows: LeaveRow[];
  notes: string;
}

export const DEFAULT_PAYSLIP_FORM_DATA: PayslipFormData = {
  payType: 'Hourly',
  company: {
    companyName: 'Xpect Group',
    companyAddress: 'Address Line 1, City, Postcode',
    payeReference: '123/AB45678',
    payPeriod: 'January 2026',
    payDate: '31 Jan 2026',
    payslipNumber: 'PS-2026-001',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  },
  employee: {
    employeeId: 'EMP-001',
    employeeName: '',
    department: 'Operations',
    jobTitle: 'Cleaner',
    niNumber: '',
    taxCode: '',
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
  netPay: '1290.00',
  netPayInWords: 'One thousand two hundred ninety pounds only',
  ytdSummary: {
    grossPayYTD: '19200.00',
    taxPaidYTD: '1800.00',
    niPaidYTD: '1020.00',
    pensionYTD: '900.00',
  },
  leaveRows: [
    { leaveType: 'Annual Leave', entitled: '28', used: '5', balance: '23' },
    { leaveType: 'Sick Leave', entitled: '10', used: '0', balance: '10' },
  ],
  notes: '',
};
