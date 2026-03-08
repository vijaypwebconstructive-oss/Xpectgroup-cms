import React from 'react';

interface DocumentSummaryProps {
  subtotal?: number;
  discount?: number;
  vat?: number;
  serviceCharges?: number;
  totalAmount?: number;
  payableAmount?: number;
  showPayableAmount?: boolean;
}

const DocumentSummary: React.FC<DocumentSummaryProps> = ({
  subtotal = 4785,
  discount = 0,
  vat = 957,
  serviceCharges = 0,
  totalAmount = 5742,
  payableAmount,
  showPayableAmount = true,
}) => {
  const finalPayable = payableAmount ?? totalAmount ?? 0;

  return (
    <div className="mt-6 flex justify-end">
      <div className="w-full max-w-[280px] border border-[#e7ebf3] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-[#e7ebf3]">
              <td className="px-4 py-2 text-[#6b7a99]">Subtotal</td>
              <td className="px-4 py-2 text-right font-medium text-[#0d121b]">£{Number(subtotal).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr className="border-b border-[#e7ebf3]">
              <td className="px-4 py-2 text-[#6b7a99]">Discount</td>
              <td className="px-4 py-2 text-right font-medium text-[#0d121b]">£{Number(discount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr className="border-b border-[#e7ebf3]">
              <td className="px-4 py-2 text-[#6b7a99]">VAT (20%)</td>
              <td className="px-4 py-2 text-right font-medium text-[#0d121b]">£{Number(vat).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr className="border-b border-[#e7ebf3]">
              <td className="px-4 py-2 text-[#6b7a99]">Service Charges</td>
              <td className="px-4 py-2 text-right font-medium text-[#0d121b]">£{Number(serviceCharges).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr className="border-b border-[#e7ebf3]">
              <td className="px-4 py-2 text-[#6b7a99]">Total Amount</td>
              <td className="px-4 py-2 text-right font-medium text-[#0d121b]">£{Number(totalAmount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
            </tr>
            {showPayableAmount && (
              <tr className="bg-[#f6f7fb]">
                <td className="px-4 py-3 font-bold text-[#0d121b]">Payable Amount</td>
                <td className="px-4 py-3 text-right font-bold text-[#0d121b]">£{Number(finalPayable).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentSummary;
