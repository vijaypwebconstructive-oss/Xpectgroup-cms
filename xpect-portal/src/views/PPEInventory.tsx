import React, { useState } from 'react';
import { PPEInventoryRecord, PPEStockStatus } from '../types';
import { MOCK_PPE_INVENTORY, PPE_ITEM_ICONS, PPE_ITEM_COLORS } from './ppeData';

interface PPEInventoryProps {
  onBack: () => void;
}

const STOCK_STYLES: Record<PPEStockStatus, { badge: string; dot: string; bar: string }> = {
  'Normal':       { badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500',  bar: 'bg-green-500' },
  'Low Stock':    { badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400',  bar: 'bg-amber-400' },
  'Out of Stock': { badge: 'bg-red-100 text-red-700',      dot: 'bg-red-500',    bar: 'bg-red-500' },
};

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

const PPEInventory: React.FC<PPEInventoryProps> = ({ onBack }) => {
  const [inventory, setInventory]         = useState<PPEInventoryRecord[]>(MOCK_PPE_INVENTORY);
  const [adjustId, setAdjustId]           = useState<string | null>(null);
  const [adjustQty, setAdjustQty]         = useState('');
  const [adjustMode, setAdjustMode]       = useState<'add' | 'set'>('add');
  const [addStockId, setAddStockId]       = useState<string | null>(null);
  const [addStockQty, setAddStockQty]     = useState('');
  const [successMsg, setSuccessMsg]       = useState('');

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

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1 text-[#4c669a] text-sm font-bold hover:text-[#0d121b] transition-colors cursor-pointer">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Records
      </button>

      {/* Success toast */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 animate-in fade-in duration-300">
          <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
          <p className="text-green-800 text-sm font-bold">{successMsg}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Normal',        value: normal,      color: 'text-green-600', bar: 'bg-green-500', icon: 'inventory',      iconColor: 'text-green-600', pct: Math.round((normal / inventory.length) * 100) },
          { label: 'Low Stock',     value: lowStock,    color: 'text-amber-500', bar: 'bg-amber-400', icon: 'production_quantity_limits', iconColor: 'text-amber-500', pct: Math.round((lowStock / inventory.length) * 100) },
          { label: 'Out of Stock',  value: outOfStock,  color: 'text-red-600',   bar: 'bg-red-500',   icon: 'remove_shopping_cart',  iconColor: 'text-red-600',   pct: Math.round((outOfStock / inventory.length) * 100) },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">{c.label}</p>
              <span className={`material-symbols-outlined text-[22px] ${c.iconColor}`}>{c.icon}</span>
            </div>
            <p className={`text-4xl font-black ${c.color}`}>{c.value} <span className="text-base font-bold">items</span></p>
            <div className="h-1.5 rounded-full bg-[#e7ebf3] overflow-hidden">
              <div className={`h-full rounded-full ${c.bar} transition-all duration-500`} style={{ width: `${c.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Out of stock alert */}
      {outOfStock > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-red-500 text-[22px]">warning</span>
          <div>
            <p className="text-red-800 text-sm font-bold">{outOfStock} item{outOfStock > 1 ? 's are' : ' is'} out of stock</p>
            <p className="text-red-600 text-xs">Restock immediately to ensure worker safety compliance.</p>
          </div>
        </div>
      )}

      {/* Inventory table */}
      <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e7ebf3] flex items-center justify-between">
          <h2 className="text-[#0d121b] text-base font-black">PPE Stock Inventory</h2>
          <span className="text-xs text-[#4c669a]">Last updated: <span className="font-bold text-[#0d121b]">Today</span></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
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
                    <tr className="hover:bg-[#f8fafc] transition-colors">
                      {/* PPE Item */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-bold ${itemColor}`}>
                          <span className="material-symbols-outlined text-[18px]">{icon}</span>
                          {item.ppeType}
                        </span>
                      </td>
                      {/* Available qty */}
                      <td className="px-4 py-4">
                        <span className={`text-2xl font-black ${item.availableQuantity === 0 ? 'text-red-600' : item.availableQuantity < item.minimumStockLevel ? 'text-amber-600' : 'text-[#0d121b]'}`}>
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
                          <div className="flex-1 h-2 rounded-full bg-[#e7ebf3] overflow-hidden">
                            <div className={`h-full rounded-full ${st.bar} transition-all duration-500`} style={{ width: `${stockPct}%` }} />
                          </div>
                          <span className="text-xs font-bold text-[#4c669a] w-8">{stockPct}%</span>
                        </div>
                      </td>
                      {/* Last restocked */}
                      <td className="px-4 py-4 text-sm text-[#4c669a] font-medium">{formatDate(item.lastRestocked)}</td>
                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wide ${st.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {item.stockStatus}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setAddStockId(item.id); setAddStockQty(''); setAdjustId(null); }}
                            className="text-xs font-black text-green-600 hover:text-green-800 uppercase tracking-wide transition-colors cursor-pointer"
                          >
                            Add Stock
                          </button>
                          <span className="text-[#e7ebf3]">|</span>
                          <button
                            onClick={() => { setAdjustId(item.id); setAdjustQty(item.availableQuantity.toString()); setAdjustMode('set'); setAddStockId(null); }}
                            className="text-xs font-black text-[#2e4150] hover:text-[#4c669a] uppercase tracking-wide transition-colors cursor-pointer"
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

        <div className="px-5 py-3 border-t border-[#e7ebf3] bg-[#f8fafc]">
          <p className="text-xs text-[#4c669a]">Showing <span className="font-bold text-[#0d121b]">{inventory.length}</span> PPE item types</p>
        </div>
      </div>
    </div>
  );
};

export default PPEInventory;
