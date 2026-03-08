export type ProspectStatus =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Quotation Sent'
  | 'Converted'
  | 'Lost';

export interface Prospect {
  id: string;
  clientName: string;
  company: string;
  industryType: string;
  email: string;
  contactNumber: string;
  address: string;
  notes: string;
  status: ProspectStatus;
  createdAt?: string;
}
