export interface InvoiceCompanyInfo {
  companyLogoBase64?: string;
  companyName: string;
  companyAddress: string;
  email: string;
  phone: string;
}

export interface InvoiceInfo {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  servicePeriod: string;
}

export interface BillByInfo {
  companyName: string;
  companyAddress: string;
  email: string;
  phone: string;
}

export interface BillToInfo {
  clientName: string;
  clientAddress: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface ServiceItemRow {
  serviceDescription: string;
  siteLocation: string;
  quantity: string;
  rate: string;
  discount: string;
  amount: string;
}

export interface ServiceDetailsInfo {
  siteLocation: string;
  siteType: string;
  supervisorName: string;
}

/** Array of service details for multi-row support */
export type ServiceDetailsRows = ServiceDetailsInfo[];

export interface InvoiceFormData {
  company: InvoiceCompanyInfo;
  invoiceInfo: InvoiceInfo;
  billBy: BillByInfo;
  billTo: BillToInfo;
  clientId?: string;
  serviceItems: ServiceItemRow[];
  subtotal: string;
  discount: string;
  vat: string;
  serviceCharges: string;
  totalAmount: string;
  payableAmount: string;
  serviceDetails: ServiceDetailsRows;
  notes: string;
  footer: string;
}

export const DEFAULT_SERVICE_ITEMS: ServiceItemRow[] = [
  { serviceDescription: 'Office Cleaning', siteLocation: 'Main Office', quantity: '20', rate: '120', discount: '0', amount: '2400.00' },
  { serviceDescription: 'Healthcare Facility Cleaning', siteLocation: 'Clinic A', quantity: '20', rate: '150', discount: '0', amount: '3000.00' },
];

export const DEFAULT_INVOICE_FORM_DATA: InvoiceFormData = {
  company: {
    companyName: 'SparkClean Facility Services Ltd',
    companyAddress: '24 Kingsway Business Park, London, UK',
    email: 'info@sparkclean.co.uk',
    phone: '+44 20 1234 5678',
  },
  invoiceInfo: {
    invoiceNumber: 'INV-2026-001',
    issueDate: '01 Feb 2026',
    dueDate: '15 Feb 2026',
    servicePeriod: '01 Jan 2026 – 31 Jan 2026',
  },
  billBy: {
    companyName: 'SparkClean Facility Services Ltd',
    companyAddress: '24 Kingsway Business Park, London, UK',
    email: 'info@sparkclean.co.uk',
    phone: '+44 20 1234 5678',
  },
  billTo: {
    clientName: 'Acme Corp',
    clientAddress: '123 Business Avenue, Manchester, UK',
    contactPerson: 'John Smith',
    email: 'accounts@acmecorp.co.uk',
    phone: '+44 161 123 4567',
  },
  serviceItems: DEFAULT_SERVICE_ITEMS,
  subtotal: '5400.00',
  discount: '0.00',
  vat: '1080.00',
  serviceCharges: '0.00',
  totalAmount: '6480.00',
  payableAmount: '5400.00',
  serviceDetails: [
    { siteLocation: '123 Business Avenue, Manchester', siteType: 'Office', supervisorName: 'Sarah Johnson' },
  ],
  notes: 'Cleaning services were performed according to the service contract agreement.',
  footer: 'This invoice is computer generated and does not require a signature.',
};
