import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const PPEInventorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `inv-${randomUUID().slice(0, 8)}`,
  },
  ppeType: { type: String, required: true },
  availableQuantity: { type: Number, default: 0 },
  minimumStockLevel: { type: Number, default: 0 },
  lastRestocked: { type: String, default: '' },
  stockStatus: { type: String, enum: ['Normal', 'Low Stock', 'Out of Stock'], default: 'Normal' },
  unit: { type: String, default: 'units' },
}, { timestamps: true });

const PPEInventory = mongoose.model('PPEInventory', PPEInventorySchema);
export default PPEInventory;
