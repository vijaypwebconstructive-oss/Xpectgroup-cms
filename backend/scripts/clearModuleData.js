/**
 * Clear Clients & Sites and PPE Invoice data from the database.
 * Run: node backend/scripts/clearModuleData.js
 * Requires MongoDB to be running and MONGODB_URI to be set.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from '../models/Client.js';
import Site from '../models/Site.js';
import WorkerAssignment from '../models/WorkerAssignment.js';
import PPEInvoice from '../models/PPEInvoice.js';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xpect-portal';

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const clientResult = await Client.deleteMany({});
    const siteResult = await Site.deleteMany({});
    const assignmentResult = await WorkerAssignment.deleteMany({});
    const ppeResult = await PPEInvoice.deleteMany({});

    console.log('Cleared:');
    console.log('  - Clients:', clientResult.deletedCount);
    console.log('  - Sites:', siteResult.deletedCount);
    console.log('  - Worker Assignments:', assignmentResult.deletedCount);
    console.log('  - PPE Invoices:', ppeResult.deletedCount);
    console.log('Modules are now fresh.');
  } catch (err) {
    console.error('Clear failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
