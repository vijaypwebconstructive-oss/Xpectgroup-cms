import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const ChemicalSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `chem-${randomUUID().slice(0, 8)}`,
  },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  hazardType: { type: String, required: true },
  hazardSymbols: { type: [String], default: [] },
  storageLocation: { type: String, required: true },
  ppeRequired: { type: [String], default: [] },
  sdsAvailable: { type: Boolean, default: false },
  sdsId: { type: String },
  firstAidMeasures: { type: String, required: true },
  spillResponse: { type: String, required: true },
  disposalMethod: { type: String, required: true },
  handlingInstructions: { type: String, default: '' },
  maxExposureLimit: { type: String },
}, {
  timestamps: true,
});

const Chemical = mongoose.model('Chemical', ChemicalSchema);
export default Chemical;
