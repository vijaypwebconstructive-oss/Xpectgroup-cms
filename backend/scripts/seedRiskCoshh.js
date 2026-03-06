/**
 * Seed Risk & COSHH collections with sample data.
 * Run: node backend/scripts/seedRiskCoshh.js
 * Requires: MongoDB running, MONGODB_URI set
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xpect-portal';

const daysFromNow = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const sampleRiskAssessments = [
  { id: 'ra-001', title: 'General Office Cleaning Risk Assessment', sector: 'Office', taskType: 'Routine Cleaning', riskLevel: 'Low', createdBy: 'Admin', lastReviewDate: '2024-01-15', nextReviewDate: daysFromNow(200), approvalStatus: 'approved', taskDescription: 'Routine cleaning of office areas.', equipmentUsed: ['Mop & bucket', 'Vacuum cleaner'], workArea: 'Office floors', requiredPPE: ['Gloves', 'Safety shoes'], hazards: [{ hazard: 'Slips & trips', harm: 'Fractures', control: 'Wet floor signs', residualRisk: 'Low' }] },
  { id: 'ra-002', title: 'Healthcare Facility Deep Clean', sector: 'Healthcare', taskType: 'Deep Clean', riskLevel: 'High', createdBy: 'Admin', lastReviewDate: '2024-02-01', nextReviewDate: daysFromNow(18), approvalStatus: 'approved', taskDescription: 'Full deep clean of healthcare ward.', equipmentUsed: ['Steam cleaner', 'HEPA vacuum'], workArea: 'Hospital ward', requiredPPE: ['Gloves', 'Eye protection', 'Mask'], hazards: [{ hazard: 'Biological contamination', harm: 'Infection', control: 'Full PPE', residualRisk: 'Medium' }] },
];

const sampleRAMS = [
  { id: 'rams-001', siteName: 'St. Mary\'s Hospital — Ward B', clientName: 'NHS Trust East', description: 'Daily clinical-grade ward clean.', workingHours: 'Monday–Friday, 06:00–08:00', status: 'approved', lastUpdated: '2024-02-10', supervisor: 'Patricia Nwachukwu', workMethod: ['Sign in at reception', 'Don full PPE', 'Begin with patient bathrooms'], emergencyProcedures: ['Fire: Evacuate via nearest exit'], linkedRiskAssessmentIds: ['ra-002'], signedCopyAvailable: false },
  { id: 'rams-002', siteName: 'Meridian Tower — Floors 12-18', clientName: 'Meridian Capital Group', description: 'Nightly office clean.', workingHours: 'Monday–Friday, 19:00–22:00', status: 'approved', lastUpdated: '2024-03-01', supervisor: 'Tom Briggs', workMethod: ['Collect keys', 'Start on floor 18'], emergencyProcedures: ['Fire: Activate alarm'], linkedRiskAssessmentIds: ['ra-001'], signedCopyAvailable: false },
];

const sampleChemicals = [
  { id: 'chem-001', name: 'Jangro Multi-Surface Cleaner', manufacturer: 'Jangro Ltd', hazardType: 'Irritant', hazardSymbols: ['GHS07'], storageLocation: 'Shelf A1', ppeRequired: ['Gloves'], sdsAvailable: true, firstAidMeasures: 'Wash with water.', spillResponse: 'Mop up.', disposalMethod: 'Drain disposal.', handlingInstructions: 'Dilute before use.' },
  { id: 'chem-002', name: 'Dettol Hospital Grade Disinfectant', manufacturer: 'Reckitt Benckiser', hazardType: 'Corrosive', hazardSymbols: ['GHS05'], storageLocation: 'Shelf A2 (locked)', ppeRequired: ['Gloves', 'Eye protection'], sdsAvailable: true, firstAidMeasures: 'Flush eyes with water.', spillResponse: 'Use spill kit.', disposalMethod: 'Hazardous waste.', handlingInstructions: 'Dilute per label.' },
];

const sampleSDS = [
  { id: 'sds-001', chemicalId: 'chem-001', chemicalName: 'Jangro Multi-Surface Cleaner', issueDate: '2023-06-01', reviewDate: daysFromNow(120), status: 'valid', manufacturer: 'Jangro Ltd', fileName: 'Jangro-SDS.pdf', revision: 'Rev. 3' },
  { id: 'sds-002', chemicalId: 'chem-002', chemicalName: 'Dettol Hospital Grade Disinfectant', issueDate: '2023-09-15', reviewDate: daysFromNow(8), status: 'review_soon', manufacturer: 'Reckitt Benckiser', fileName: 'Dettol-SDS.pdf', revision: 'Rev. 7' },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const RiskAssessment = (await import('../models/RiskAssessment.js')).default;
    const RAMS = (await import('../models/RAMS.js')).default;
    const Chemical = (await import('../models/Chemical.js')).default;
    const SDS = (await import('../models/SDS.js')).default;

    const rCount = await RiskAssessment.countDocuments();
    if (rCount === 0) {
      await RiskAssessment.insertMany(sampleRiskAssessments);
      console.log(`Seeded ${sampleRiskAssessments.length} risk assessments`);
    } else {
      console.log('Risk assessments already have data, skipping');
    }

    const ramsCount = await RAMS.countDocuments();
    if (ramsCount === 0) {
      await RAMS.insertMany(sampleRAMS);
      console.log(`Seeded ${sampleRAMS.length} RAMS`);
    } else {
      console.log('RAMS already have data, skipping');
    }

    const chemCount = await Chemical.countDocuments();
    if (chemCount === 0) {
      await Chemical.insertMany(sampleChemicals);
      console.log(`Seeded ${sampleChemicals.length} chemicals`);
    } else {
      console.log('Chemicals already have data, skipping');
    }

    const sdsCount = await SDS.countDocuments();
    if (sdsCount === 0) {
      await SDS.insertMany(sampleSDS);
      console.log(`Seeded ${sampleSDS.length} SDS`);
    } else {
      console.log('SDS already have data, skipping');
    }

    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
