import React from "react";

interface Props {
  fileUrl: string;
  onClose: () => void;
}

const PayslipPreviewModal: React.FC<Props> = ({ fileUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">

      {/* Modal Container */}
      <div className="bg-white w-[90%] h-[90%] rounded-xl shadow-lg flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Payslip Preview</h2>
          <button onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1">
          <iframe
            src={fileUrl}
            title="Payslip Preview"
            className="w-full h-full"
          />
        </div>

      </div>
    </div>
  );
};

export default PayslipPreviewModal;