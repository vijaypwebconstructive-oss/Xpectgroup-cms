import { Incident, CorrectiveAction } from './types';

const daysFromNow = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const daysAgoDateTime = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

// ── Mutable incidents array (IncidentCreate pushes to this) ───────────────────

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-001',
    date: daysAgoDateTime(2),
    site: 'St. Mary\'s Hospital — Ward B',
    worker: 'James Okafor',
    type: 'Accident',
    severity: 'High',
    status: 'Investigating',
    investigator: 'Patricia Nwachukwu',
    description: 'Worker slipped on wet floor in the sluice room after mopping. Fell and struck left shoulder against metal trolley. Taken to A&E by colleague. Wet floor sign was not deployed prior to mopping.',
    injuryOccurred: true,
    injuryDescription: 'Left shoulder contusion, possible soft tissue injury. X-ray required.',
    medicalTreatmentRequired: true,
    propertyDamage: undefined,
    immediateActionTaken: 'Area cordoned off. Worker assisted to A&E. Incident manager notified. Wet floor sign policy reviewed on site.',
    supervisorNotified: true,
    investigationNotes: 'Initial investigation indicates wet floor sign was not used. Trolley was positioned in usual pathway. Worker did not report fatigue. CCTV footage being reviewed.',
    rootCause: 'Procedure not followed',
    witnessNotes: 'Claire Mensah (co-worker): "James had just finished mopping and turned to get more supplies. He slipped immediately — the sign wasn\'t out yet."',
    hasPhotos: true,
  },
  {
    id: 'INC-002',
    date: daysAgoDateTime(8),
    site: 'Meridian Tower — Floors 12-18',
    worker: 'Sandra Osei',
    type: 'Near Miss',
    severity: 'Medium',
    status: 'Corrective Action',
    investigator: 'Tom Briggs',
    description: 'Chemical spray bottle (multi-surface cleaner) was found unlabelled and stored next to a water bottle in the cleaning cupboard on floor 14. Near miss — no exposure occurred. Discovered during routine check.',
    injuryOccurred: false,
    propertyDamage: undefined,
    immediateActionTaken: 'Unlabelled bottle safely disposed of. Cleaning cupboard fully audited. All bottles labelled correctly.',
    supervisorNotified: true,
    investigationNotes: 'Root cause identified as insufficient labelling procedure. Team briefing conducted. COSHH awareness refresher scheduled.',
    rootCause: 'Procedure not followed',
    witnessNotes: 'No witnesses — discovered by supervisor during audit.',
    hasPhotos: false,
  },
  {
    id: 'INC-003',
    date: daysAgoDateTime(15),
    site: 'Westside Primary School',
    worker: 'Amanda Foster',
    type: 'Client Complaint',
    severity: 'Low',
    status: 'Closed',
    investigator: 'Richard Hammond',
    description: 'Headteacher reported that cleaner left a mop and bucket in the main corridor during school hours (08:40), creating a trip hazard for pupils and staff.',
    injuryOccurred: false,
    propertyDamage: undefined,
    immediateActionTaken: 'Manager apologised to client. Equipment removed immediately. Briefing held with Amanda Foster.',
    supervisorNotified: true,
    investigationNotes: 'Amanda started shift earlier than expected due to school event. Not aware of the 08:30 cut-off rule. Rule has been added to site RAMS.',
    rootCause: 'Lack of training',
    witnessNotes: 'Headteacher Mr. P. Sharma observed equipment left in corridor at 08:40.',
    hasPhotos: false,
    closedDate: daysFromNow(-5),
    closedBy: 'Richard Hammond',
  },
  {
    id: 'INC-004',
    date: daysAgoDateTime(3),
    site: 'Greenfield Industrial Unit 7',
    worker: 'Marcus Obi',
    type: 'Accident',
    severity: 'Critical',
    status: 'Investigating',
    investigator: 'Patricia Nwachukwu',
    description: 'Worker suffered chemical splash to both eyes while dissolving Actichlor Plus chlorine tablets. Not wearing eye protection at time of incident. Immediately rinsed at eyewash station. Transported to hospital for ophthalmic assessment.',
    injuryOccurred: true,
    injuryDescription: 'Chemical burn to both eyes (corneal exposure). RIDDOR reportable — hospital admission required.',
    medicalTreatmentRequired: true,
    propertyDamage: undefined,
    immediateActionTaken: 'Immediate eyewash for 15+ minutes. Called 999. Area secured. RIDDOR notification prepared. All Actichlor use suspended pending investigation.',
    supervisorNotified: true,
    investigationNotes: 'RIDDOR reportable incident. Worker confirmed not wearing eye protection "because it was a quick job". SDS was available but not read. Supervisor was not present. Investigation ongoing.',
    rootCause: 'Human error',
    witnessNotes: 'Kwame Asante (co-worker): "Marcus was in a rush. He said he\'d just do a quick mix. I told him to get his goggles but he\'d already started."',
    hasPhotos: true,
  },
  {
    id: 'INC-005',
    date: daysAgoDateTime(21),
    site: 'Hartley & Co Headquarters',
    worker: 'Tom Briggs',
    type: 'Property Damage',
    severity: 'Medium',
    status: 'Closed',
    investigator: 'Tom Briggs',
    description: 'High-pressure window washer accidentally struck and cracked a glass partition on the 3rd floor reception area. Estimated repair cost £850.',
    injuryOccurred: false,
    propertyDamage: 'Glass partition cracked — estimated repair cost £850. Client notified same day.',
    immediateActionTaken: 'Work stopped. Client informed. Area cordoned off. Insurance claim initiated. Photos taken.',
    supervisorNotified: true,
    investigationNotes: 'Equipment operator had not checked nozzle pressure before use. Pressure set too high for interior use. New SOPs for pressure washing introduced.',
    rootCause: 'Procedure not followed',
    witnessNotes: 'Client representative Ms. D. Hartley witnessed the incident from the reception desk.',
    hasPhotos: true,
    closedDate: daysFromNow(-10),
    closedBy: 'Richard Hammond',
  },
  {
    id: 'INC-006',
    date: daysAgoDateTime(45),
    site: 'NHS Trust East — Main Reception',
    worker: 'Claire Ashton',
    type: 'Environmental Incident',
    severity: 'Medium',
    status: 'Corrective Action',
    investigator: 'Amanda Foster',
    description: 'Approximately 2 litres of floor cleaner concentrate spilled into storm drain outside loading bay entrance. Chemical entered drain before spill kit was deployed.',
    injuryOccurred: false,
    propertyDamage: 'Potential environmental contamination — reported to Environment Agency.',
    immediateActionTaken: 'Spill kit deployed. Drain sealed with drain bung. Environment Agency notified within 1 hour. Photos taken. Site manager informed.',
    supervisorNotified: true,
    investigationNotes: 'Bottle cap was faulty — lid not properly secured. Supplier informed. Batch recall initiated. All staff briefed on checking caps before transport.',
    rootCause: 'Equipment failure',
    witnessNotes: 'Loading bay operative saw spill occur when Claire was transferring stock.',
    hasPhotos: true,
  },
  {
    id: 'INC-007',
    date: daysAgoDateTime(1),
    site: 'Meridian Tower — Floors 12-18',
    worker: 'David Nwosu',
    type: 'Near Miss',
    severity: 'Low',
    status: 'Open',
    description: 'Reported that a vacuum cleaner cable was left stretched across a corridor walkway for approximately 10 minutes while worker answered a phone call. No incidents occurred, but a member of office staff nearly tripped.',
    injuryOccurred: false,
    propertyDamage: undefined,
    immediateActionTaken: 'Cable removed immediately. David reminded of safe working practices.',
    supervisorNotified: false,
    hasPhotos: false,
  },
  {
    id: 'INC-008',
    date: daysAgoDateTime(60),
    site: 'Westside Primary School',
    worker: 'Patricia Nwachukwu',
    type: 'Accident',
    severity: 'Low',
    status: 'Closed',
    investigator: 'Tom Briggs',
    description: 'Worker strained lower back when lifting a full bucket of water estimated to weigh 15kg without using the trolley. Reported pain the following morning.',
    injuryOccurred: true,
    injuryDescription: 'Lower back strain. Self-reported following morning. GP visit advised.',
    medicalTreatmentRequired: false,
    immediateActionTaken: 'Advised worker to rest and see GP. Trolley use reinforced at team briefing.',
    supervisorNotified: true,
    investigationNotes: 'Trolley was available but parked at far end of corridor. Worker chose to carry bucket directly. Manual handling refresher completed.',
    rootCause: 'Lack of training',
    witnessNotes: 'No witnesses to the actual lift.',
    hasPhotos: false,
    closedDate: daysFromNow(-30),
    closedBy: 'Tom Briggs',
  },
];

// ── Corrective Actions ────────────────────────────────────────────────────────

export const MOCK_ACTIONS: CorrectiveAction[] = [
  // INC-001 actions
  {
    id: 'CA-001',
    incidentId: 'INC-001',
    description: 'Retrain all site cleaners on wet floor sign procedure — sign must be placed BEFORE mopping begins.',
    assignedTo: 'Patricia Nwachukwu',
    dueDate: daysFromNow(7),
    status: 'In Progress',
  },
  {
    id: 'CA-002',
    incidentId: 'INC-001',
    description: 'Update INC-001 site RAMS to include mandatory wet floor sign deployment step in mopping procedure.',
    assignedTo: 'Tom Briggs',
    dueDate: daysFromNow(5),
    status: 'Open',
  },
  {
    id: 'CA-003',
    incidentId: 'INC-001',
    description: 'Review trolley placement in sluice room — reposition to eliminate pathway obstruction.',
    assignedTo: 'Richard Hammond',
    dueDate: daysFromNow(3),
    status: 'Completed',
    completedDate: daysFromNow(-1),
  },

  // INC-002 actions
  {
    id: 'CA-004',
    incidentId: 'INC-002',
    description: 'Implement mandatory chemical labelling check at start and end of every shift. Supervisor to sign off.',
    assignedTo: 'Tom Briggs',
    dueDate: daysFromNow(14),
    status: 'In Progress',
  },
  {
    id: 'CA-005',
    incidentId: 'INC-002',
    description: 'Conduct COSHH awareness refresher session for all Meridian Tower cleaning staff.',
    assignedTo: 'Amanda Foster',
    dueDate: daysFromNow(-3),
    status: 'Open',
  },

  // INC-003 actions (closed)
  {
    id: 'CA-006',
    incidentId: 'INC-003',
    description: 'Add school operating hours and strict equipment clearance deadlines to Westside Primary School site RAMS.',
    assignedTo: 'Richard Hammond',
    dueDate: daysFromNow(-8),
    status: 'Completed',
    completedDate: daysFromNow(-6),
  },
  {
    id: 'CA-007',
    incidentId: 'INC-003',
    description: 'Conduct site induction refresher with Amanda Foster — school schedule and rules.',
    assignedTo: 'Richard Hammond',
    dueDate: daysFromNow(-7),
    status: 'Completed',
    completedDate: daysFromNow(-5),
  },

  // INC-004 actions
  {
    id: 'CA-008',
    incidentId: 'INC-004',
    description: 'RIDDOR notification submission to HSE within 15 days — document and file submission confirmation.',
    assignedTo: 'Patricia Nwachukwu',
    dueDate: daysFromNow(10),
    status: 'In Progress',
  },
  {
    id: 'CA-009',
    incidentId: 'INC-004',
    description: 'Mandatory PPE compliance retraining — eye protection for ALL chemical handling tasks with zero exceptions.',
    assignedTo: 'Tom Briggs',
    dueDate: daysFromNow(5),
    status: 'Open',
  },
  {
    id: 'CA-010',
    incidentId: 'INC-004',
    description: 'Supervisor must be present for ALL Actichlor Plus use going forward. Amend COSHH assessment accordingly.',
    assignedTo: 'Richard Hammond',
    dueDate: daysFromNow(3),
    status: 'Open',
  },

  // INC-006 actions
  {
    id: 'CA-011',
    incidentId: 'INC-006',
    description: 'Supply all staff with spill kit training refresher and update chemical transport procedure.',
    assignedTo: 'Amanda Foster',
    dueDate: daysFromNow(14),
    status: 'In Progress',
  },
  {
    id: 'CA-012',
    incidentId: 'INC-006',
    description: 'Source and install drain bungs at all external loading bay areas across NHS sites.',
    assignedTo: 'Claire Ashton',
    dueDate: daysFromNow(-7),
    status: 'Open',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export const getIncidentById      = (id: string) => MOCK_INCIDENTS.find(i => i.id === id);
export const getActionsByIncident = (id: string) => MOCK_ACTIONS.filter(a => a.incidentId === id);

export const daysUntil = (dateStr: string): number => {
  if (!dateStr) return Infinity;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr).getTime() - now.getTime()) / 86_400_000);
};
