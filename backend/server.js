import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import cors from 'cors';
import dotenv from 'dotenv';
import cleanerRoutes from './routes/cleaners.js';
import documentRoutes from './routes/documents.js';
import invitationRoutes from './routes/invitations.js';
import adminRoutes from './routes/admin.js';
import activityRoutes from './routes/activity.js';
import trainingRoutes from './routes/training.js';
import ppeRoutes from './routes/ppe.js';
import riskCoshhRoutes from './routes/riskCoshh.js';
import clientsSitesRoutes from './routes/clientsSites.js';
import policyDocumentsRoutes from './routes/policyDocuments.js';
import incidentsRoutes from './routes/incidents.js';
import systemUsersRoutes from './routes/systemUsers.js';
import trainingRecordsRoutes from './routes/trainingRecords.js';
import financeRoutes from './routes/finance.js';
import payslipSettingsRoutes from './routes/payslipSettings.js';
import invoiceSettingsRoutes from './routes/invoiceSettings.js';
import prospectsRoutes from './routes/prospects.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xpect-portal';

// Middleware - allow multiple frontend origins (different ports for dev)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/cleaners', cleanerRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/ppe', ppeRoutes);
app.use('/api/risk-coshh', riskCoshhRoutes);
app.use('/api/clients-sites', clientsSitesRoutes);
app.use('/api/policy-documents', policyDocumentsRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/users', systemUsersRoutes);
app.use('/api/training-records', trainingRecordsRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/payslip-settings', payslipSettingsRoutes);
app.use('/api/invoice-settings', invoiceSettingsRoutes);
app.use('/api/prospects', prospectsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 API available at: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`\n💡 Keep this terminal open while using the application!\n`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if MongoDB is running');
    console.error('   2. Verify MONGODB_URI in .env file is correct');
    console.error('   3. For Atlas: Check network access and credentials\n');
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

export default app;
