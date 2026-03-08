/**
 * Shared types for the unified PayslipTemplate component.
 * Used by: PayslipViewPage, PDF generation (backend), email attachments.
 */

export interface PayslipTemplateCompany {
  companyLogoBase64?: string;
  companyName: string;
  companyAddress: string;
  payeReference: string;
  payPeriod: string;
  payDate: string;
  payslipNumber: string;
}

export interface PayslipTemplateEmployee {
  employeeId: string;
  employeeName: string;
  department: string;
  jobTitle: string;
  niNumber: string;
  taxCode: string;
}

export interface PayslipTemplateEarningsRow {
  description: string;
  hours: string;
  rate: string;
  amount: string;
}

export interface PayslipTemplateDeductionsRow {
  description: string;
  amount: string;
}

export interface PayslipTemplateLeaveRow {
  leaveType: string;
  entitled: string;
  used: string;
  balance: string;
}

export interface PayslipTemplateYTD {
  grossPayYTD: string;
  taxPaidYTD: string;
  niPaidYTD: string;
  pensionYTD: string;
}

export interface PayslipTemplateData {
  payType: 'Hourly' | 'Monthly';
  company: PayslipTemplateCompany;
  employee: PayslipTemplateEmployee;
  earningsRows: PayslipTemplateEarningsRow[];
  deductionsRows: PayslipTemplateDeductionsRow[];
  grossPay: string;
  totalDeductions: string;
  netPay: string;
  netPayInWords: string;
  ytdSummary: PayslipTemplateYTD;
  leaveRows: PayslipTemplateLeaveRow[];
  notes: string;
}
