import express from 'express';
import InvoiceSettings from '../models/InvoiceSettings.js';

const router = express.Router();

const DEFAULT_SERVICE_ITEMS = [
  { serviceDescription: 'Office Cleaning', siteLocation: 'Main Office', quantity: '20', rate: '120', discount: '0', amount: '2400.00' },
  { serviceDescription: 'Healthcare Facility Cleaning', siteLocation: 'Clinic A', quantity: '20', rate: '150', discount: '0', amount: '3000.00' },
];

const DEFAULT_SETTINGS = {
  id: 'default',
  billBy: {
    companyName: 'Xpect Group',
    companyAddress: 'Address Line 1, City, Postcode',
    email: 'info@xpectgroup.co.uk',
    phone: '+44 20 1234 5678',
  },
  invoicePrefix: 'INV-YYYY',
  defaultVatPercent: 20,
  defaultServiceCharges: 0,
  defaultPaymentTermsDays: 14,
  defaultNotes: 'Thank you for your business. Please make payment within the specified terms.',
  defaultFooter: 'This is a computer-generated invoice. For queries contact accounts.',
  defaultServiceItems: DEFAULT_SERVICE_ITEMS,
  defaultServiceDetails: [{ siteLocation: '', siteType: '', supervisorName: '' }],
};

router.get('/', async (req, res) => {
  try {
    let doc = await InvoiceSettings.findOne({ id: 'default' }).lean();
    if (!doc) {
      doc = await InvoiceSettings.create(DEFAULT_SETTINGS);
      doc = doc.toObject();
    }
    res.json(doc);
  } catch (err) {
    console.error('Error fetching invoice settings:', err);
    res.status(500).json({ error: 'Failed to fetch invoice settings', message: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const body = req.body;
    const updates = {
      billBy: body.billBy ?? {},
      invoicePrefix: body.invoicePrefix ?? 'INV-YYYY',
      defaultVatPercent: typeof body.defaultVatPercent === 'number' ? body.defaultVatPercent : 20,
      defaultServiceCharges: typeof body.defaultServiceCharges === 'number' ? body.defaultServiceCharges : 0,
      defaultPaymentTermsDays: typeof body.defaultPaymentTermsDays === 'number' ? body.defaultPaymentTermsDays : 14,
      defaultNotes: body.defaultNotes ?? '',
      defaultFooter: body.defaultFooter ?? '',
      defaultServiceItems: Array.isArray(body.defaultServiceItems) ? body.defaultServiceItems : [],
      defaultServiceDetails: (() => {
        const sd = body.defaultServiceDetails;
        if (!sd) return [];
        if (Array.isArray(sd)) return sd;
        return [sd];
      })(),
    };
    const doc = await InvoiceSettings.findOneAndUpdate(
      { id: 'default' },
      { $set: updates },
      { new: true, upsert: true }
    ).lean();
    res.json(doc);
  } catch (err) {
    console.error('Error updating invoice settings:', err);
    res.status(500).json({ error: 'Failed to update invoice settings', message: err.message });
  }
});

export default router;
