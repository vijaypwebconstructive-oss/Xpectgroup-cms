/**
 * Seed Clients, Sites, and Worker Assignments with mock data.
 * Run: node backend/scripts/seedClientsSites.js
 * Requires MongoDB to be running and MONGODB_URI to be set.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from '../models/Client.js';
import Site from '../models/Site.js';
import WorkerAssignment from '../models/WorkerAssignment.js';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xpect-portal';

const daysFromNow = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const seedClients = async () => {
  const count = await Client.countDocuments();
  if (count > 0) {
    console.log('Clients already seeded, skipping.');
    return;
  }
  await Client.insertMany([
    { id: 'cli-001', name: 'Pinnacle Office Solutions', industry: 'Office', contactPerson: 'Richard Hammond', email: 'r.hammond@pinnacle-office.co.uk', phone: '+44 161 400 1234', contractStart: '2024-01-01', contractEnd: daysFromNow(180), insuranceExpiry: daysFromNow(200), address: 'Pinnacle House, 88 King Street, Manchester, M2 4WQ', notes: 'Preferred morning cleans.' },
    { id: 'cli-002', name: 'Greenfield Academy Trust', industry: 'School', contactPerson: 'Amanda Foster', email: 'a.foster@greenfield-academy.sch.uk', phone: '+44 161 550 9900', contractStart: '2023-09-01', contractEnd: daysFromNow(22), insuranceExpiry: daysFromNow(90), address: '15 School Lane, Salford, M6 8PQ', notes: 'DBS enhanced checks required.' },
    { id: 'cli-003', name: 'NorthWest Healthcare NHS', industry: 'Healthcare', contactPerson: 'Dr. Patricia Nwachukwu', email: 'p.nwachukwu@nwhealthcare.nhs.uk', phone: '+44 161 276 5500', contractStart: '2023-04-01', contractEnd: daysFromNow(365), insuranceExpiry: daysFromNow(-5), address: 'NW Healthcare Hub, Oxford Road, Manchester, M13 9WL', notes: 'Biohazard training mandatory.' },
    { id: 'cli-004', name: 'Bridgewater Construction Group', industry: 'Construction', contactPerson: 'Tom Briggs', email: 't.briggs@bridgewater-construction.co.uk', phone: '+44 161 834 7711', contractStart: '2024-03-15', contractEnd: daysFromNow(290), insuranceExpiry: daysFromNow(310), address: 'Unit 7, Trafford Park, Manchester, M17 1HH', notes: 'PPE mandatory on site.' },
  ]);
  console.log('Seeded 4 clients.');
};

const seedSites = async () => {
  const count = await Site.countDocuments();
  if (count > 0) {
    console.log('Sites already seeded, skipping.');
    return;
  }
  await Site.insertMany([
    { id: 'site-001', clientId: 'cli-001', name: 'Pinnacle HQ — Level 1–3', address: '88 King Street, Manchester', postcode: 'M2 4WQ', riskLevel: 'Low', requiredTrainings: ['Manual Handling', 'COSHH Awareness', 'Fire Safety'], emergencyContact: 'Richard Hammond', emergencyPhone: '+44 7700 100001', accessInstructions: 'Key fob from reception.', activeWorkers: 4 },
    { id: 'site-002', clientId: 'cli-001', name: 'Pinnacle Annex Building', address: '90 King Street, Manchester', postcode: 'M2 4WR', riskLevel: 'Low', requiredTrainings: ['Manual Handling', 'Fire Safety'], emergencyContact: 'Richard Hammond', emergencyPhone: '+44 7700 100001', accessInstructions: 'Ask security desk.', activeWorkers: 2 },
    { id: 'site-003', clientId: 'cli-002', name: 'Greenfield Primary Campus', address: '15 School Lane, Salford', postcode: 'M6 8PQ', riskLevel: 'Medium', requiredTrainings: ['Enhanced DBS', 'Child Safeguarding', 'Manual Handling', 'COSHH Awareness'], emergencyContact: 'Amanda Foster', emergencyPhone: '+44 7700 100002', accessInstructions: 'Sign in at main office.', activeWorkers: 3 },
    { id: 'site-004', clientId: 'cli-002', name: 'Greenfield Secondary Block', address: '17 School Lane, Salford', postcode: 'M6 8PQ', riskLevel: 'Medium', requiredTrainings: ['Enhanced DBS', 'Child Safeguarding', 'Fire Safety'], emergencyContact: 'Amanda Foster', emergencyPhone: '+44 7700 100002', accessInstructions: 'Key from main office.', activeWorkers: 2 },
    { id: 'site-005', clientId: 'cli-003', name: 'NW Healthcare — A&E Wing', address: 'Oxford Road, Manchester', postcode: 'M13 9WL', riskLevel: 'High', requiredTrainings: ['Biohazard Handling', 'Clinical Waste', 'Infection Control', 'COSHH Awareness', 'Manual Handling'], emergencyContact: 'Dr. Patricia Nwachukwu', emergencyPhone: '+44 7700 100003', accessInstructions: 'Swipe card from facilities.', activeWorkers: 5 },
  ]);
  console.log('Seeded 5 sites.');
};

const seedAssignments = async () => {
  const count = await WorkerAssignment.countDocuments();
  if (count > 0) {
    console.log('Assignments already seeded, skipping.');
    return;
  }
  await WorkerAssignment.insertMany([
    { id: 'wa-001', workerId: 'mock-s-001', workerName: 'James Thornton', workerInitials: 'JT', workerAvatarColor: 'bg-blue-500', siteId: 'site-001', siteName: 'Pinnacle HQ — Level 1–3', clientId: 'cli-001', completedTrainings: ['Manual Handling', 'COSHH Awareness', 'Fire Safety'], complianceStatus: 'Compliant', assignedSince: '2024-02-01', role: 'Senior Cleaner' },
    { id: 'wa-002', workerId: 'mock-s-002', workerName: 'Sarah Mitchell', workerInitials: 'SM', workerAvatarColor: 'bg-pink-500', siteId: 'site-001', siteName: 'Pinnacle HQ — Level 1–3', clientId: 'cli-001', completedTrainings: ['Manual Handling', 'Fire Safety'], complianceStatus: 'Expiring', assignedSince: '2024-03-15', role: 'Cleaner' },
    { id: 'wa-003', workerId: 'mock-s-003', workerName: 'David Okafor', workerInitials: 'DO', workerAvatarColor: 'bg-emerald-500', siteId: 'site-002', siteName: 'Pinnacle Annex Building', clientId: 'cli-001', completedTrainings: ['Manual Handling'], complianceStatus: 'Expiring', assignedSince: '2024-04-01', role: 'Cleaner' },
    { id: 'wa-004', workerId: 'mock-s-004', workerName: 'Emma Clarke', workerInitials: 'EC', workerAvatarColor: 'bg-violet-500', siteId: 'site-002', siteName: 'Pinnacle Annex Building', clientId: 'cli-001', completedTrainings: ['Manual Handling', 'Fire Safety'], complianceStatus: 'Compliant', assignedSince: '2023-12-01', role: 'Supervisor' },
    { id: 'wa-005', workerId: 'mock-s-005', workerName: 'Ryan Patel', workerInitials: 'RP', workerAvatarColor: 'bg-orange-500', siteId: 'site-003', siteName: 'Greenfield Primary Campus', clientId: 'cli-002', completedTrainings: ['Enhanced DBS', 'Child Safeguarding', 'Manual Handling'], complianceStatus: 'Compliant', assignedSince: '2024-01-10', role: 'Cleaner' },
    { id: 'wa-006', workerId: 'mock-s-006', workerName: 'Priya Singh', workerInitials: 'PS', workerAvatarColor: 'bg-rose-500', siteId: 'site-003', siteName: 'Greenfield Primary Campus', clientId: 'cli-002', completedTrainings: ['Manual Handling'], complianceStatus: 'Non-Compliant', assignedSince: '2024-05-01', role: 'Cleaner' },
    { id: 'wa-007', workerId: 'w-007', workerName: 'Luke Henderson', workerInitials: 'LH', workerAvatarColor: 'bg-sky-500', siteId: 'site-004', siteName: 'Greenfield Secondary Block', clientId: 'cli-002', completedTrainings: ['Enhanced DBS', 'Child Safeguarding', 'Fire Safety'], complianceStatus: 'Compliant', assignedSince: '2024-02-20', role: 'Cleaner' },
    { id: 'wa-008', workerId: 'w-008', workerName: 'Amara Osei', workerInitials: 'AO', workerAvatarColor: 'bg-teal-500', siteId: 'site-005', siteName: 'NW Healthcare — A&E Wing', clientId: 'cli-003', completedTrainings: ['Biohazard Handling', 'Clinical Waste', 'Infection Control', 'COSHH Awareness', 'Manual Handling'], complianceStatus: 'Compliant', assignedSince: '2023-11-01', role: 'Senior Cleaner' },
  ]);
  console.log('Seeded 8 assignments.');
};

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    await seedClients();
    await seedSites();
    await seedAssignments();
    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
