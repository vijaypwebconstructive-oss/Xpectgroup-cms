import React from 'react';

interface Props {
  subtotal: string;
  discount: string;
  vat: string;
  serviceCharges: string;
  totalAmount: string;
  payableAmount: string;
  onSubtotalChange: (v: string) => void;
  onDiscountChange: (v: string) => void;
  onVatChange: (v: string) => void;
  onServiceChargesChange: (v: string) => void;
  onTotalAmountChange: (v: string) => void;
  onPayableAmountChange: (v: string) => void;
}

const InvoiceSummaryCard: React.FC<Props> = ({
  subtotal,
  discount,
  vat,
  serviceCharges,
  totalAmount,
  payableAmount,
  onSubtotalChange,
  onDiscountChange,
  onVatChange,
  onServiceChargesChange,
  onTotalAmountChange,
  onPayableAmountChange,
}) => {
  const inputCls = 'w-full px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20';

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-[#6b7a99] uppercase tracking-wide">Invoice Summary</h2>
      <div className="flex justify-end">
        <div className="w-full max-w-[320px] bg-[#f6f7fb] rounded-xl border border-[#e7ebf3] p-4 space-y-3">
          <div className="flex justify-between items-center gap-4">
            <span className="text-sm text-[#6b7a99]">Subtotal</span>
            <input type="text" value={subtotal} onChange={e => onSubtotalChange(e.target.value)} className={`${inputCls} w-28 text-right`} />
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-sm text-[#6b7a99]">Discount</span>
            <input type="text" value={discount} onChange={e => onDiscountChange(e.target.value)} className={`${inputCls} w-28 text-right`} />
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-sm text-[#6b7a99]">VAT (20%)</span>
            <input type="text" value={vat} onChange={e => onVatChange(e.target.value)} className={`${inputCls} w-28 text-right`} />
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-sm text-[#6b7a99]">Service Charges</span>
            <input type="text" value={serviceCharges} onChange={e => onServiceChargesChange(e.target.value)} className={`${inputCls} w-28 text-right`} />
          </div>
          <div className="flex justify-between items-center gap-4 pt-2 border-t border-[#e7ebf3]">
            <span className="text-sm font-semibold text-[#0d121b]">Total Amount</span>
            <input type="text" value={totalAmount} onChange={e => onTotalAmountChange(e.target.value)} className={`${inputCls} w-28 text-right font-semibold`} />
          </div>
          <div className="flex justify-between items-center gap-4 bg-[#2e4150] mt-2 px-4 py-3 rounded-lg">
            <span className="text-sm font-bold text-white">Payable Amount</span>
            <input
              type="text"
              value={payableAmount}
              onChange={e => onPayableAmountChange(e.target.value)}
              className="w-28 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-sm font-bold text-white text-right placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummaryCard;
