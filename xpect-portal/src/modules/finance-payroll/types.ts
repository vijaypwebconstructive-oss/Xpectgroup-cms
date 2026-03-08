export interface SalarySlip {
  id: string;
  payrollId: string;
  cleanerId: string;
  workerName: string;
  month: number;
  year: number;
  payPeriod: string;
  salaryAmount: number;
  paymentStatus: 'Paid';
  slipNumber: string;
  pdfPath: string;
}

export interface PayrollRecord {
  id: string;
  workerId: string;
  workerName: string;
  month: number;
  year: number;
  payType?: 'Hourly' | 'Monthly';
  hoursWorked?: number;
  hourlyRate?: number;
  monthlySalary?: number | null;
  totalSalary: number;
  paymentStatus: 'Pending' | 'Paid';
  paymentDate: string | null;
  siteId?: string;
  siteName?: string;
  role?: string;
}

export interface PaymentDocument {
  id: string;
  type: 'Invoice' | 'Payment Receipt' | 'Contract' | 'Bank Confirmation';
  fileName: string;
  fileUrl: string;
  uploadDate: string;
}

export interface SiteContract {
  id: string;
  siteId: string;
  clientId: string;
  siteName: string;
  clientName: string;
  contractValue: number;
  billingPeriod: 'Monthly' | 'Quarterly' | 'Yearly';
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  lastBillingDate: string | null;
  paymentDate?: string | null;
  paymentDocuments?: PaymentDocument[];
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  issueDate?: string;
  expiryDate?: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
  billBy?: InvoiceBillBy;
  billTo?: InvoiceBillTo;
  serviceItems?: InvoiceServiceItem[];
  subtotal?: number;
  discount?: number;
  vat?: number;
  serviceCharges?: number;
  totalAmount?: number;
  payableAmount?: number;
  notes?: string;
  footer?: string;
  clientName?: string;
  clientEmail?: string;
  serviceAddress?: string;
  serviceDescription?: string;
  numCleaners?: number;
  hoursPerVisit?: number;
  visitsPerWeek?: number;
  hourlyRate?: number;
  totalPrice?: number;
}

export interface InvoiceBillBy {
  companyName: string;
  companyAddress: string;
  email: string;
  phone: string;
}

export interface InvoiceBillTo {
  clientName: string;
  clientAddress: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface InvoiceServiceItem {
  serviceDescription: string;
  siteLocation: string;
  quantity: string;
  rate: string;
  discount: string;
  amount: string;
}

export interface InvoiceServiceDetails {
  siteLocation: string;
  siteType: string;
  supervisorName: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  servicePeriod: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Sent';
  billBy: InvoiceBillBy;
  billTo: InvoiceBillTo;
  serviceItems: InvoiceServiceItem[];
  subtotal: number;
  discount: number;
  vat: number;
  serviceCharges: number;
  totalAmount: number;
  payableAmount: number;
  serviceDetails?: InvoiceServiceDetails | InvoiceServiceDetails[];
  notes?: string;
  footer?: string;
  clientId?: string;
}
