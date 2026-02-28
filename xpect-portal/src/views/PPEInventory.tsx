import React, { useState } from 'react';
import { PPEInventoryRecord, PPEStockStatus, PPEItemType } from '../types';
import { MOCK_PPE_INVENTORY, PPE_ITEM_ICONS, PPE_ITEM_COLORS, ALL_PPE_TYPES } from './ppeData';

interface PPEInventoryProps {
  onBack: () => void;
}

const STOCK_STYLES: Record<PPEStockStatus, { badge: string; dot: string; bar: string }> = {
  'Normal':       { badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500',  bar: 'bg-green-500' },
  'Low Stock':    { badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400',  bar: 'bg-amber-400' },
  'Out of Stock': { badge: 'bg-red-100 text-red-700',      dot: 'bg-red-500',    bar: 'bg-red-500' },
};

const UNITS = ['pairs', 'units', 'boxes', 'sets', 'rolls', 'packs'];

const CONDITION_OPTIONS = ['New', 'Good', 'Used'];

const today = () => new Date().toISOString().split('T')[0];

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

interface AddPPEForm {
  mode: 'new' | 'restock';
  existingId: string;
  ppeType: string;
  quantity: string;
  unit: string;
  supplier: string;
  purchaseDate: string;
  expiryDate: string;
  condition: string;
  storageLocation: string;
  minimumStock: string;
  notes: string;
}

const emptyForm: AddPPEForm = {
  mode: 'new',
  existingId: '',
  ppeType: '',
  quantity: '',
  unit: 'units',
  supplier: '',
  purchaseDate: today(),
  expiryDate: '',
  condition: 'New',
  storageLocation: '',
  minimumStock: '10',
  notes: '',
};

const PPEInventory: React.FC<PPEInventoryProps> = ({ onBack }) => {
  const [inventory, setInventory]         = useState<PPEInventoryRecord[]>(MOCK_PPE_INVENTORY);
  const [adjustId, setAdjustId]           = useState<string | null>(null);
  const [adjustQty, setAdjustQty]         = useState('');
  const [adjustMode, setAdjustMode]       = useState<'add' | 'set'>('add');
  const [addStockId, setAddStockId]       = useState<string | null>(null);
  const [addStockQty, setAddStockQty]     = useState('');
  const [successMsg, setSuccessMsg]       = useState('');

  // Add PPE modal state
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [form, setForm]                   = useState<AddPPEForm>(emptyForm);
  const [formErrors, setFormErrors]       = useState<Record<string, string>>({});

  const outOfStock = inventory.filter(i => i.stockStatus === 'Out of Stock').length;
  const lowStock   = inventory.filter(i => i.stockStatus === 'Low Stock').length;
  const normal     = inventory.filter(i => i.stockStatus === 'Normal').length;

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const getStockStatus = (qty: number, min: number): PPEStockStatus => {
    if (qty === 0) return 'Out of Stock';
    if (qty < min) return 'Low Stock';
    return 'Normal';
  };

  const handleAddStock = (id: string) => {
    const qty = parseInt(addStockQty, 10);
    if (isNaN(qty) || qty <= 0) return;
    setInventory(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newQty = item.availableQuantity + qty;
      return { ...item, availableQuantity: newQty, lastRestocked: new Date().toISOString().split('T')[0], stockStatus: getStockStatus(newQty, item.minimumStockLevel) };
    }));
    setAddStockId(null);
    setAddStockQty('');
    flash('Stock added successfully.');
  };

  const handleAdjust = (id: string) => {
    const qty = parseInt(adjustQty, 10);
    if (isNaN(qty) || qty < 0) return;
    setInventory(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newQty = adjustMode === 'add' ? item.availableQuantity + qty : qty;
      return { ...item, availableQuantity: newQty, stockStatus: getStockStatus(newQty, item.minimumStockLevel) };
    }));
    setAdjustId(null);
    setAdjustQty('');
    flash('Quantity adjusted.');
  };

  const setField = (k: keyof AddPPEForm, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (formErrors[k]) setFormErrors(prev => { const n = { ...prev }; delete n[k]; return n; });
  };

  const handleSelectExisting = (id: string) => {
    if (id === '') {
      setForm(prev => ({ ...prev, mode: 'new', existingId: '', ppeType: '' }));
    } else {
      const item = inventory.find(i => i.id === id);
      if (item) {
        setForm(prev => ({
          ...prev,
          mode: 'restock',
          existingId: id,
          ppeType: item.ppeType,
          unit: item.unit,
        }));
      }
    }
  };

  const validateForm = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (form.mode === 'new' && !form.ppeType) e.ppeType = 'PPE type is required.';
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) e.quantity = 'Quantity must be a positive number.';
    if (!form.purchaseDate) e.purchaseDate = 'Purchase date is required.';
    if (form.expiryDate && form.purchaseDate && form.expiryDate < form.purchaseDate) e.expiryDate = 'Expiry date cannot be earlier than purchase date.';
    if (form.mode === 'new' && !form.unit) e.unit = 'Unit is required.';
    if (form.mode === 'restock' && !form.existingId) e.existingId = 'Please select an item to restock.';
    return e;
  };

  const handleModalSubmit = () => {
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});

    const qty = parseInt(form.quantity, 10);

    if (form.mode === 'restock' && form.existingId) {
      setInventory(prev => prev.map(item => {
        if (item.id !== form.existingId) return item;
        const newQty = item.availableQuantity + qty;
        return {
          ...item,
          availableQuantity: newQty,
          lastRestocked: form.purchaseDate,
          stockStatus: getStockStatus(newQty, item.minimumStockLevel),
        };
      }));
      flash(`Restocked ${form.ppeType} — added ${qty} ${form.unit}.`);
    } else {
      const newItem: PPEInventoryRecord = {
        id: `inv-${Date.now()}`,
        ppeType: form.ppeType as PPEItemType,
        availableQuantity: qty,
        minimumStockLevel: parseInt(form.minimumStock, 10) || 10,
        lastRestocked: form.purchaseDate,
        stockStatus: getStockStatus(qty, parseInt(form.minimumStock, 10) || 10),
        unit: form.unit,
      };
      setInventory(prev => [...prev, newItem]);
      flash(`Added new PPE item — ${form.ppeType}.`);
    }

    setForm(emptyForm);
    setIsModalOpen(false);
  };

  const openModal = () => {
    setForm(emptyForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Back + Add PPE button */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-[#4c669a] text-sm font-bold hover:text-[#0d121b] transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Records
        </button>
        <button
          onClick={openModal}
          className="flex items-center justify-center gap-2 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-all px-[30px] py-[15px] h-10 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Add PPE</span>
        </button>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 animate-in fade-in duration-300">
          <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
          <p className="text-green-800 text-sm font-bold">{successMsg}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Normal',       value: normal,     icon: 'inventory',                 iconColor: 'text-[#2e4150]' },
          { label: 'Low Stock',    value: lowStock,   icon: 'production_quantity_limits', iconColor: 'text-amber-500' },
          { label: 'Out of Stock', value: outOfStock, icon: 'remove_shopping_cart',       iconColor: 'text-red-600'   },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm sm:p-4 p-3 flex flex-col gap-3 items-start ">
            <span className={`material-symbols-outlined text-[22px] sm:text-[30px] p-2 w-fit rounded-[12px] sm:p-3 bg-[#f2f6f9] ${c.iconColor}`}>{c.icon}</span>
            <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">{c.label}</p>
            <p className="text-xl sm:text-3xl font-black text-[#000] font-bold">{c.value}</p>
              
            {/* <div className="flex flex-col gap-1 sm:gap-2 justify-between items-left">
            

            </div> */}
          </div>
        ))}
      </div>

      {/* Out of stock alert */}
      {outOfStock > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-red-500 text-[22px]">warning</span>
          <div className="flex-1">
            <p className="text-red-800 text-sm font-bold">{outOfStock} item{outOfStock > 1 ? 's are' : ' is'} out of stock</p>
            <p className="text-red-600 text-xs">Restock immediately to ensure worker safety compliance.</p>
          </div>
        </div>
      )}

      {/* Inventory table */}
      <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e7ebf3] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-[#0d121b] text-base font-semibold font-black">PPE Stock Inventory</h2>
            <span className="bg-[#f2f6f9] text-[#4c669a] text-xs font-bold px-2.5 py-1 rounded-full">{inventory.length} items</span>
          </div>
          <span className="text-xs text-[#4c669a]">Last updated: <span className="font-bold text-[#0d121b]">Today</span></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#e7ebf3] bg-[#f8fafc]">
                <th className="text-left px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">PPE Item</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Available Qty</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Min. Stock Level</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Stock Level</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Last Restocked</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7ebf3]">
              {inventory.map(item => {
                const st = STOCK_STYLES[item.stockStatus];
                const icon = PPE_ITEM_ICONS[item.ppeType];
                const itemColor = PPE_ITEM_COLORS[item.ppeType];
                const stockPct = item.minimumStockLevel > 0
                  ? Math.min(100, Math.round((item.availableQuantity / (item.minimumStockLevel * 3)) * 100))
                  : 100;
                return (
                  <React.Fragment key={item.id}>
                    <tr className="hover:bg-[#f8fafc] transition-colors group">
                      {/* PPE Item */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${itemColor}`}>
                          <span className="material-symbols-outlined text-[16px]">{icon}</span>
                          {item.ppeType}
                        </span>
                      </td>
                      {/* Available qty */}
                      <td className="px-4 py-4">
                        <span className={`text-sm font-bold ${item.availableQuantity === 0 ? 'text-red-600' : item.availableQuantity < item.minimumStockLevel ? 'text-amber-600' : 'text-[#0d121b]'}`}>
                          {item.availableQuantity}
                        </span>
                        <span className="text-[#4c669a] text-xs font-semibold ml-1">{item.unit}</span>
                      </td>
                      {/* Min stock */}
                      <td className="px-4 py-4 text-sm font-semibold text-[#4c669a]">
                        {item.minimumStockLevel} {item.unit}
                      </td>
                      {/* Stock level bar */}
                      <td className="px-4 py-4 w-40">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full bg-[#e7ebf3] overflow-hidden">
                            <div className={`h-full rounded-full ${st.bar} transition-all duration-500`} style={{ width: `${stockPct}%` }} />
                          </div>
                          <span className="text-xs font-bold text-[#4c669a] w-8">{stockPct}%</span>
                        </div>
                      </td>
                      {/* Last restocked */}
                      <td className="px-4 py-4 text-sm text-[#4c669a] font-medium whitespace-nowrap">{formatDate(item.lastRestocked)}</td>
                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black capitalize font-semibold tracking-wide ${st.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full font-semibold ${st.dot}`} />
                          {item.stockStatus}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setAddStockId(item.id); setAddStockQty(''); setAdjustId(null); }}
                            className="text-[#4c669a] text-xs font-black font-semibold capitalize tracking-wide transition-colors cursor-pointer hover:text-green-700"
                          >
                            Add Stock
                          </button>
                          <span className="text-[#e7ebf3]">|</span>
                          <button
                            onClick={() => { setAdjustId(item.id); setAdjustQty(item.availableQuantity.toString()); setAdjustMode('set'); setAddStockId(null); }}
                            className="text-[#4c669a] text-xs font-black font-semibold capitalize tracking-wide transition-colors cursor-pointer hover:text-[#0d121b]"
                          >
                            Adjust
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline Add Stock form */}
                    {addStockId === item.id && (
                      <tr className="bg-green-50">
                        <td colSpan={7} className="px-5 py-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-bold text-green-800">Add stock for {item.ppeType}:</span>
                            <input
                              type="number"
                              min={1}
                              className="w-24 h-9 rounded-lg border border-green-300 px-3 text-sm text-[#0d121b] outline-none bg-white"
                              placeholder="Qty"
                              value={addStockQty}
                              onChange={e => setAddStockQty(e.target.value)}
                            />
                            <span className="text-sm text-green-700 font-semibold">{item.unit}</span>
                            <button
                              onClick={() => handleAddStock(item.id)}
                              className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-all cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setAddStockId(null)}
                              className="px-4 py-1.5 rounded-lg border border-green-300 text-green-700 text-xs font-bold hover:bg-green-100 transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Inline Adjust form */}
                    {adjustId === item.id && (
                      <tr className="bg-blue-50">
                        <td colSpan={7} className="px-5 py-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-bold text-blue-800">Adjust quantity for {item.ppeType}:</span>
                            <div className="flex gap-1">
                              {(['set', 'add'] as const).map(m => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setAdjustMode(m)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${adjustMode === m ? 'bg-[#2e4150] text-white border-[#2e4150]' : 'bg-white text-[#4c669a] border-blue-200 hover:border-[#2e4150]/30'}`}
                                >
                                  {m === 'set' ? 'Set to' : 'Add'}
                                </button>
                              ))}
                            </div>
                            <input
                              type="number"
                              min={0}
                              className="w-24 h-9 rounded-lg border border-blue-300 px-3 text-sm text-[#0d121b] outline-none bg-white"
                              placeholder={adjustMode === 'set' ? 'New qty' : 'Add qty'}
                              value={adjustQty}
                              onChange={e => setAdjustQty(e.target.value)}
                            />
                            <button
                              onClick={() => handleAdjust(item.id)}
                              className="px-4 py-1.5 rounded-lg bg-[#2e4150] text-white text-xs font-bold hover:bg-[#2e4150]/90 transition-all cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setAdjustId(null)}
                              className="px-4 py-1.5 rounded-lg border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-[#e7ebf3] bg-[#f8fafc] flex items-center justify-between">
          <p className="text-xs text-[#4c669a]">
            Showing <span className="font-bold text-[#0d121b]">{inventory.length}</span> PPE item types
          </p>
        </div>
      </div>

      {/* Add PPE Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7ebf3]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px] text-[#2e4150]">inventory_2</span>
                <h2 className="text-lg font-bold text-[#0d121b]">
                  {form.mode === 'restock' ? 'Restock PPE Item' : 'Add New PPE Item'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f6f9] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] text-[#4c669a]">close</span>
              </button>
            </div>

            {/* Mode tabs */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex gap-2 p-1 bg-[#f2f6f9] rounded-xl">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, mode: 'new', existingId: '', ppeType: '' }))}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                    form.mode === 'new' ? 'bg-white text-[#0d121b] shadow-sm' : 'text-[#4c669a] hover:text-[#0d121b]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  Add New Item
                </button>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, mode: 'restock', ppeType: '' }))}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                    form.mode === 'restock' ? 'bg-white text-[#0d121b] shadow-sm' : 'text-[#4c669a] hover:text-[#0d121b]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">inventory</span>
                  Restock Existing
                </button>
              </div>
            </div>

            {/* Form body */}
            <div className="px-6 py-4 space-y-4">

              {form.mode === 'restock' && (
                <div>
                  <label className="block text-sm font-semibold text-[#0d121b] mb-1">Select Existing Item <span className="text-red-500">*</span></label>
                  <select
                    value={form.existingId}
                    onChange={e => handleSelectExisting(e.target.value)}
                    className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none cursor-pointer ${formErrors.existingId ? 'border-red-400' : 'border-[#c7d2e0]'}`}
                  >
                    <option value="">Choose item to restock…</option>
                    {inventory.map(i => (
                      <option key={i.id} value={i.id}>{i.ppeType} — {i.availableQuantity} {i.unit} in stock</option>
                    ))}
                  </select>
                  {formErrors.existingId && <p className="text-red-500 text-xs mt-1">{formErrors.existingId}</p>}
                </div>
              )}

              {form.mode === 'new' && (
                <div>
                  <label className="block text-sm font-semibold text-[#0d121b] mb-1">PPE Item Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter PPE item name"
                    value={form.ppeType}
                    onChange={e => setField('ppeType', e.target.value)}
                    className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none ${formErrors.ppeType ? 'border-red-400' : 'border-[#c7d2e0]'}`}
                  />
                  {formErrors.ppeType && <p className="text-red-500 text-xs mt-1">{formErrors.ppeType}</p>}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0d121b] mb-1">Quantity <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Enter quantity"
                    value={form.quantity}
                    onChange={e => setField('quantity', e.target.value)}
                    className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none ${formErrors.quantity ? 'border-red-400' : 'border-[#c7d2e0]'}`}
                  />
                  {formErrors.quantity && <p className="text-red-500 text-xs mt-1">{formErrors.quantity}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0d121b] mb-1">Unit <span className="text-red-500">*</span></label>
                  <select
                    value={form.unit}
                    onChange={e => setField('unit', e.target.value)}
                    disabled={form.mode === 'restock'}
                    className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none cursor-pointer ${formErrors.unit ? 'border-red-400' : 'border-[#c7d2e0]'} ${form.mode === 'restock' ? 'opacity-60' : ''}`}
                  >
                    {UNITS.map(u => (
                      <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
                    ))}
                  </select>
                  {formErrors.unit && <p className="text-red-500 text-xs mt-1">{formErrors.unit}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0d121b] mb-1">Supplier / Vendor</label>
                <input
                  type="text"
                  placeholder="Enter supplier name"
                  value={form.supplier}
                  onChange={e => setField('supplier', e.target.value)}
                  className="w-full h-10 rounded-xl border border-[#c7d2e0] px-3 text-sm text-[#0d121b] bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0d121b] mb-1">Purchase Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={form.purchaseDate}
                    onChange={e => setField('purchaseDate', e.target.value)}
                    className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none cursor-pointer ${formErrors.purchaseDate ? 'border-red-400' : 'border-[#c7d2e0]'}`}
                  />
                  {formErrors.purchaseDate && <p className="text-red-500 text-xs mt-1">{formErrors.purchaseDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0d121b] mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={e => setField('expiryDate', e.target.value)}
                    className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none cursor-pointer ${formErrors.expiryDate ? 'border-red-400' : 'border-[#c7d2e0]'}`}
                  />
                  {formErrors.expiryDate && <p className="text-red-500 text-xs mt-1">{formErrors.expiryDate}</p>}
                </div>
              </div>

              {form.mode === 'new' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0d121b] mb-1">Condition / Status</label>
                      <select
                        value={form.condition}
                        onChange={e => setField('condition', e.target.value)}
                        className="w-full h-10 rounded-xl border border-[#c7d2e0] px-3 text-sm text-[#0d121b] bg-white outline-none cursor-pointer"
                      >
                        {CONDITION_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0d121b] mb-1">Min. Stock Level</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="e.g. 10"
                        value={form.minimumStock}
                        onChange={e => setField('minimumStock', e.target.value)}
                        className="w-full h-10 rounded-xl border border-[#c7d2e0] px-3 text-sm text-[#0d121b] bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">Storage Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Warehouse A — Shelf 3"
                      value={form.storageLocation}
                      onChange={e => setField('storageLocation', e.target.value)}
                      className="w-full h-10 rounded-xl border border-[#c7d2e0] px-3 text-sm text-[#0d121b] bg-white outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#0d121b] mb-1">Remarks / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Any additional notes…"
                  value={form.notes}
                  onChange={e => setField('notes', e.target.value)}
                  className="w-full rounded-xl border border-[#c7d2e0] px-3 py-2 text-sm text-[#0d121b] bg-white outline-none resize-none"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e7ebf3]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-full border border-[#c7d2e0] text-[#4c669a] text-sm font-bold hover:bg-[#f2f6f9] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalSubmit}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {form.mode === 'restock' ? 'inventory' : 'add_circle'}
                </span>
                {form.mode === 'restock' ? 'Restock Item' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PPEInventory;
