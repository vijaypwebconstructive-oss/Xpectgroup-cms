import mongoose from 'mongoose';

const BillBySchema = new mongoose.Schema({
  companyLogoBase64: { type: String, default: '' },
  companyName: { type: String, default: '' },
  companyAddress: { type: String, default: '' },
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

const InvoiceSettingsSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, default: 'default' },
  billBy: { type: BillBySchema, default: () => ({}) },
  invoicePrefix: { type: String, default: 'INV-YYYY' },
  defaultVatPercent: { type: Number, default: 20 },
  defaultServiceCharges: { type: Number, default: 0 },
  defaultPaymentTermsDays: { type: Number, default: 14 },
  defaultNotes: { type: String, default: '' },
  defaultFooter: { type: String, default: '' },
  defaultServiceItems: { type: [ServiceItemSchema], default: [] },
  defaultServiceDetails: { type: [ServiceDetailsSchema], default: () => [] },
}, { timestamps: true });

const InvoiceSettings = mongoose.model('InvoiceSettings', InvoiceSettingsSchema);
export default InvoiceSettings;
