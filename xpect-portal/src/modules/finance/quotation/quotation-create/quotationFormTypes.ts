export interface QuotationCompanyInfo {
  companyLogoBase64?: string;
  companyName: string;
  companyAddress: string;
  email: string;
  phone: string;
}

export interface QuotationInfo {
  quotationNumber: string;
  issueDate: string;
  expiryDate: string;
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

export interface QuotationFormData {
  company: QuotationCompanyInfo;
  quotationInfo: QuotationInfo;
  billBy: BillByInfo;
  billTo: BillToInfo;
  serviceItems: ServiceItemRow[];
  subtotal: string;
  discount: string;
  vat: string;
  serviceCharges: string;
  totalAmount: string;
  payableAmount: string;
  notes: string;
  footer: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
}

export const DEFAULT_QUOTATION_SERVICE_ITEMS: ServiceItemRow[] = [
  { serviceDescription: 'Office Cleaning', siteLocation: 'Main Office', quantity: '20', rate: '120', discount: '0', amount: '2400.00' },
  { serviceDescription: 'Healthcare Facility Cleaning', siteLocation: 'Clinic A', quantity: '20', rate: '150', discount: '0', amount: '3000.00' },
];

export const DEFAULT_QUOTATION_FORM_DATA: QuotationFormData = {
  company: {
    companyName: 'SparkClean Facility Services Ltd',
    companyAddress: '24 Kingsway Business Park, London, UK',
    email: 'info@sparkclean.co.uk',
    phone: '+44 20 1234 5678',
  },
  quotationInfo: {
    quotationNumber: '',
    issueDate: '',
    expiryDate: '',
  },
  billBy: {
    companyName: 'SparkClean Facility Services Ltd',
    companyAddress: '24 Kingsway Business Park, London, UK',
    email: 'info@sparkclean.co.uk',
    phone: '+44 20 1234 5678',
  },
  billTo: {
    clientName: '',
    clientAddress: '',
    contactPerson: '',
    email: '',
    phone: '',
  },
  serviceItems: DEFAULT_QUOTATION_SERVICE_ITEMS,
  subtotal: '5400.00',
  discount: '0.00',
  vat: '1080.00',
  serviceCharges: '0.00',
  totalAmount: '6480.00',
  payableAmount: '5400.00',
  notes: 'Cleaning services will be performed according to the service agreement.',
  footer: 'This quotation is valid for 30 days. Thank you for your business.',
  status: 'Draft',
};
