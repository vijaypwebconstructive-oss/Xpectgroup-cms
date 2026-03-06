import express from 'express';
import RiskAssessment from '../models/RiskAssessment.js';
import RAMS from '../models/RAMS.js';
import Chemical from '../models/Chemical.js';
import SDS from '../models/SDS.js';

const router = express.Router();

// ── Risk Assessments ─────────────────────────────────────────────────────────

router.get('/risk-assessments', async (req, res) => {
  try {
    const docs = await RiskAssessment.find().sort({ createdAt: -1 }).lean();
    const list = docs.map(doc => toRiskAssessmentRecord(doc));
    res.json(list);
  } catch (error) {
    console.error('Error fetching risk assessments:', error);
    res.status(500).json({ error: 'Failed to fetch risk assessments', message: error.message });
  }
});

router.get('/risk-assessments/:id', async (req, res) => {
  try {
    const doc = await RiskAssessment.findOne({ id: req.params.id }).lean();
    if (!doc) return res.status(404).json({ error: 'Risk assessment not found' });
    res.json(toRiskAssessmentRecord(doc));
  } catch (error) {
    console.error('Error fetching risk assessment:', error);
    res.status(500).json({ error: 'Failed to fetch risk assessment', message: error.message });
  }
});

router.post('/risk-assessments', async (req, res) => {
  try {
    const body = req.body;
    if (!body.title) {
      return res.status(400).json({ error: 'Validation error', message: 'title is required' });
    }
    const daysFromNow = (days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };
    const doc = await RiskAssessment.create({
      title: body.title,
      taskType: body.taskType || 'General',
      riskLevel: body.riskLevel || 'Low',
      createdBy: body.createdBy || '—',
      lastReviewDate: body.lastReviewDate || daysFromNow(0),
      nextReviewDate: body.nextReviewDate || daysFromNow(365),
      approvalStatus: body.approvalStatus || 'approved',
      approvedBy: body.approvedBy,
      approvalDate: body.approvalDate,
      taskDescription: body.taskDescription || '—',
      equipmentUsed: body.equipmentUsed || [],
      workArea: body.workArea || '—',
      hazards: body.hazards || [],
      requiredPPE: body.requiredPPE || [],
      complianceRequirements: body.complianceRequirements || [],
      siteId: body.siteId,
      sector: body.sector,
    });
    res.status(201).json(toRiskAssessmentRecord(doc));
  } catch (error) {
    console.error('Error creating risk assessment:', error);
    res.status(500).json({ error: 'Failed to create risk assessment', message: error.message });
  }
});

router.patch('/risk-assessments/:id', async (req, res) => {
  try {
    const updates = {};
    if (Array.isArray(req.body.hazards)) updates.hazards = req.body.hazards;
    if (Array.isArray(req.body.requiredPPE)) updates.requiredPPE = req.body.requiredPPE;
    if (Array.isArray(req.body.complianceRequirements)) updates.complianceRequirements = req.body.complianceRequirements;
    const doc = await RiskAssessment.findOneAndUpdate({ id: req.params.id }, { $set: updates }, { new: true }).lean();
    if (!doc) return res.status(404).json({ error: 'Risk assessment not found' });
    res.json(toRiskAssessmentRecord(doc));
  } catch (error) {
    console.error('Error updating risk assessment:', error);
    res.status(500).json({ error: 'Failed to update risk assessment', message: error.message });
  }
});

router.delete('/risk-assessments/:id', async (req, res) => {
  try {
    const result = await RiskAssessment.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Risk assessment not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting risk assessment:', error);
    res.status(500).json({ error: 'Failed to delete risk assessment', message: error.message });
  }
});

function toRiskAssessmentRecord(doc) {
  return {
    id: doc.id,
    title: doc.title,
    taskType: doc.taskType,
    riskLevel: doc.riskLevel,
    createdBy: doc.createdBy,
    lastReviewDate: doc.lastReviewDate,
    nextReviewDate: doc.nextReviewDate,
    approvalStatus: doc.approvalStatus,
    approvedBy: doc.approvedBy,
    approvalDate: doc.approvalDate,
    taskDescription: doc.taskDescription,
    equipmentUsed: doc.equipmentUsed || [],
    workArea: doc.workArea,
    hazards: doc.hazards || [],
    requiredPPE: doc.requiredPPE || [],
    complianceRequirements: doc.complianceRequirements || [],
    siteId: doc.siteId,
    sector: doc.sector,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
  };
}

// ── RAMS ─────────────────────────────────────────────────────────────────────

router.get('/rams', async (req, res) => {
  try {
    const docs = await RAMS.find().sort({ createdAt: -1 }).lean();
    const list = docs.map(doc => toRAMSRecord(doc));
    res.json(list);
  } catch (error) {
    console.error('Error fetching RAMS:', error);
    res.status(500).json({ error: 'Failed to fetch RAMS', message: error.message });
  }
});

router.get('/rams/:id', async (req, res) => {
  try {
    const doc = await RAMS.findOne({ id: req.params.id }).lean();
    if (!doc) return res.status(404).json({ error: 'RAMS not found' });
    const record = toRAMSRecord(doc);
    if (doc.documentData) record.documentData = doc.documentData;
    res.json(record);
  } catch (error) {
    console.error('Error fetching RAMS:', error);
    res.status(500).json({ error: 'Failed to fetch RAMS', message: error.message });
  }
});

router.post('/rams', async (req, res) => {
  try {
    const body = req.body;
    if (!body.siteName || !body.clientName || !body.description || !body.workingHours || !body.supervisor) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'siteName, clientName, description, workingHours, and supervisor are required',
      });
    }
    const doc = await RAMS.create({
      siteName: body.siteName,
      clientName: body.clientName,
      description: body.description,
      workingHours: body.workingHours,
      status: body.status || 'draft',
      lastUpdated: body.lastUpdated || new Date().toISOString().split('T')[0],
      supervisor: body.supervisor,
      workMethod: body.workMethod || [],
      emergencyProcedures: body.emergencyProcedures || [],
      linkedRiskAssessmentIds: body.linkedRiskAssessmentIds || [],
      signedCopyAvailable: !!body.documentData,
      signedDocumentFileName: body.signedDocumentFileName,
      documentAvailable: !!body.documentData,
      documentData: body.documentData,
    });
    res.status(201).json(toRAMSRecord(doc));
  } catch (error) {
    console.error('Error creating RAMS:', error);
    res.status(500).json({ error: 'Failed to create RAMS', message: error.message });
  }
});

router.delete('/rams/:id', async (req, res) => {
  try {
    const result = await RAMS.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'RAMS not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting RAMS:', error);
    res.status(500).json({ error: 'Failed to delete RAMS', message: error.message });
  }
});

function toRAMSRecord(doc) {
  const record = {
    id: doc.id,
    siteName: doc.siteName,
    clientName: doc.clientName,
    description: doc.description,
    workingHours: doc.workingHours,
    status: doc.status,
    lastUpdated: doc.lastUpdated,
    supervisor: doc.supervisor,
    workMethod: doc.workMethod || [],
    emergencyProcedures: doc.emergencyProcedures || [],
    linkedRiskAssessmentIds: doc.linkedRiskAssessmentIds || [],
    signedCopyAvailable: doc.signedCopyAvailable,
    signedDocumentFileName: doc.signedDocumentFileName,
    documentAvailable: !!doc.documentData,
  };
  return record;
}

// ── Chemicals (COSHH) ───────────────────────────────────────────────────────

router.get('/chemicals', async (req, res) => {
  try {
    const docs = await Chemical.find().sort({ createdAt: -1 }).lean();
    const list = docs.map(doc => toChemicalRecord(doc));
    res.json(list);
  } catch (error) {
    console.error('Error fetching chemicals:', error);
    res.status(500).json({ error: 'Failed to fetch chemicals', message: error.message });
  }
});

router.get('/chemicals/:id', async (req, res) => {
  try {
    const doc = await Chemical.findOne({ id: req.params.id }).lean();
    if (!doc) return res.status(404).json({ error: 'Chemical not found' });
    res.json(toChemicalRecord(doc));
  } catch (error) {
    console.error('Error fetching chemical:', error);
    res.status(500).json({ error: 'Failed to fetch chemical', message: error.message });
  }
});

router.post('/chemicals', async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.manufacturer || !body.hazardType || !body.storageLocation ||
        !body.firstAidMeasures || !body.spillResponse || !body.disposalMethod) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'name, manufacturer, hazardType, storageLocation, firstAidMeasures, spillResponse, disposalMethod are required',
      });
    }
    const doc = await Chemical.create({
      name: body.name,
      manufacturer: body.manufacturer,
      hazardType: body.hazardType,
      hazardSymbols: body.hazardSymbols || [],
      storageLocation: body.storageLocation,
      ppeRequired: body.ppeRequired || [],
      sdsAvailable: body.sdsAvailable || false,
      sdsId: body.sdsId,
      firstAidMeasures: body.firstAidMeasures,
      spillResponse: body.spillResponse,
      disposalMethod: body.disposalMethod,
      handlingInstructions: body.handlingInstructions || '',
      maxExposureLimit: body.maxExposureLimit,
    });
    res.status(201).json(toChemicalRecord(doc));
  } catch (error) {
    console.error('Error creating chemical:', error);
    res.status(500).json({ error: 'Failed to create chemical', message: error.message });
  }
});

function toChemicalRecord(doc) {
  return {
    id: doc.id,
    name: doc.name,
    manufacturer: doc.manufacturer,
    hazardType: doc.hazardType,
    hazardSymbols: doc.hazardSymbols || [],
    storageLocation: doc.storageLocation,
    ppeRequired: doc.ppeRequired || [],
    sdsAvailable: doc.sdsAvailable,
    sdsId: doc.sdsId,
    firstAidMeasures: doc.firstAidMeasures,
    spillResponse: doc.spillResponse,
    disposalMethod: doc.disposalMethod,
    handlingInstructions: doc.handlingInstructions || '',
    maxExposureLimit: doc.maxExposureLimit,
  };
}

// ── SDS Library ──────────────────────────────────────────────────────────────

router.get('/sds', async (req, res) => {
  try {
    const docs = await SDS.find().sort({ createdAt: -1 }).lean();
    const list = docs.map(doc => toSDSRecord(doc));
    res.json(list);
  } catch (error) {
    console.error('Error fetching SDS:', error);
    res.status(500).json({ error: 'Failed to fetch SDS', message: error.message });
  }
});

router.get('/sds/:id', async (req, res) => {
  try {
    const doc = await SDS.findOne({ id: req.params.id }).lean();
    if (!doc) return res.status(404).json({ error: 'SDS not found' });
    const record = toSDSRecord(doc);
    if (doc.documentData) record.documentData = doc.documentData;
    res.json(record);
  } catch (error) {
    console.error('Error fetching SDS:', error);
    res.status(500).json({ error: 'Failed to fetch SDS', message: error.message });
  }
});

router.post('/sds', async (req, res) => {
  try {
    const body = req.body;
    if (!body.chemicalName || !body.manufacturer || !body.revision || !body.issueDate || !body.reviewDate ||
        !body.hazardClassification || !body.ghsSignalWord || !body.documentData) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'chemicalName, manufacturer, revision, issueDate, reviewDate, hazardClassification, ghsSignalWord, documentData are required',
      });
    }
    const doc = await SDS.create({
      chemicalId: body.chemicalId || '',
      chemicalName: body.chemicalName,
      issueDate: body.issueDate,
      reviewDate: body.reviewDate,
      status: body.status || 'valid',
      manufacturer: body.manufacturer,
      fileName: body.fileName,
      fileSize: body.fileSize,
      revision: body.revision,
      hazardClassification: body.hazardClassification,
      ghsSignalWord: body.ghsSignalWord,
      casNumber: body.casNumber,
      emergencyContact: body.emergencyContact,
      storageRequirements: body.storageRequirements,
      language: body.language,
      documentData: body.documentData,
    });
    res.status(201).json(toSDSRecord(doc));
  } catch (error) {
    console.error('Error creating SDS:', error);
    res.status(500).json({ error: 'Failed to create SDS', message: error.message });
  }
});

function toSDSRecord(doc) {
  return {
    id: doc.id,
    chemicalId: doc.chemicalId,
    chemicalName: doc.chemicalName,
    issueDate: doc.issueDate,
    reviewDate: doc.reviewDate,
    status: doc.status,
    manufacturer: doc.manufacturer,
    fileName: doc.fileName,
    fileSize: doc.fileSize,
    revision: doc.revision,
    hazardClassification: doc.hazardClassification,
    ghsSignalWord: doc.ghsSignalWord,
    casNumber: doc.casNumber,
    emergencyContact: doc.emergencyContact,
    storageRequirements: doc.storageRequirements,
    language: doc.language,
  };
}

export default router;
