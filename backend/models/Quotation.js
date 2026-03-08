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

const QuotationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `quo-${randomUUID().slice(0, 8)}`,
  },
  quotationNumber: { type: String, required: true, index: true },
  issueDate: { type: String, default: '' },
  expiryDate: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Accepted', 'Rejected'],
    default: 'Draft',
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
  notes: { type: String, default: '' },
  footer: { type: String, default: '' },
  // Legacy fields for backward compatibility
  clientName: { type: String, default: '' },
  clientEmail: { type: String, default: '' },
  serviceAddress: { type: String, default: '' },
  serviceDescription: { type: String, default: '' },
  numCleaners: { type: Number, default: 1 },
  hoursPerVisit: { type: Number, default: 2 },
  visitsPerWeek: { type: Number, default: 5 },
  hourlyRate: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
}, {
  timestamps: true,
});

QuotationSchema.index({ status: 1 });
QuotationSchema.index({ issueDate: -1 });

const Quotation = mongoose.model('Quotation', QuotationSchema);
export default Quotation;
