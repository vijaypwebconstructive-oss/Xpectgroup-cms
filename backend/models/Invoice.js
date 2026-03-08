import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const BillBySchema = new mongoose.Schema({
  companyName: { type: String, default: '' },
  companyAddress: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
}, { _id: false });

const BillToSchema = new mongoose.Schema({
  clientName: { type: String, default: '' },
  clientAddress: { type: String, default: '' },
  contactPerson: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
}, { _id: false });

const ServiceItemSchema = new mongoose.Schema({
  serviceDescription: { type: String, default: '' },
  siteLocation: { type: String, default: '' },
  quantity: { type: String, default: '1' },
  rate: { type: String, default: '0' },
  discount: { type: String, default: '0' },
  amount: { type: String, default: '0' },
}, { _id: false });

const ServiceDetailsSchema = new mongoose.Schema({
  siteLocation: { type: String, default: '' },
  siteType: { type: String, default: '' },
  supervisorName: { type: String, default: '' },
}, { _id: false });

const InvoiceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `inv-${randomUUID().slice(0, 8)}`,
  },
  invoiceNumber: { type: String, required: true, index: true },
  issueDate: { type: String, required: true },
  dueDate: { type: String, required: true },
  servicePeriod: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue', 'Sent'],
    default: 'Pending',
    index: true,
  },
  billBy: { type: BillBySchema, default: () => ({}) },
  billTo: { type: BillToSchema, default: () => ({}) },
  serviceItems: { type: [ServiceItemSchema], default: [] },
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  vat: { type: Number, default: 0 },
  serviceCharges: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  payableAmount: { type: Number, default: 0 },
  serviceDetails: { type: [ServiceDetailsSchema], default: () => [] },
  notes: { type: String, default: '' },
  footer: { type: String, default: '' },
  clientId: { type: String, default: '' },
}, {
  timestamps: true,
});

InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ issueDate: -1 });

const Invoice = mongoose.model('Invoice', InvoiceSchema);
export default Invoice;
