import React from 'react';

interface Props {
  mode: 'create' | 'edit' | 'template';
  onReset: () => void;
  onCancel?: () => void;
  onPreview: () => void;
  onGenerate: () => void;
  onSendInvoice?: () => void;
  submitLoading?: boolean;
  sendLoading?: boolean;
  generateLabel?: string;
}

const InvoiceFormActionButtons: React.FC<Props> = ({ mode, onReset, onCancel, onPreview, onGenerate, onSendInvoice, submitLoading = false, sendLoading = false, generateLabel }) => {
  const btnBase = 'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90';
  const showPreview = mode !== 'template';
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
      {(mode === 'edit' || mode === 'template') && onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className={`${btnBase} border border-[#e7ebf3] bg-white text-[#4c669a] hover:bg-[#f2f6f9]`}
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
          Cancel
        </button>
      ) : null}
      {(mode === 'create' || mode === 'template') && (
        <button
          type="button"
          onClick={onReset}
          className={`${btnBase} border border-[#e7ebf3] bg-white text-[#4c669a] hover:bg-[#f2f6f9]`}
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Reset Form
        </button>
      )}
      {showPreview && (
        <button
          type="button"
          onClick={onPreview}
          className={`${btnBase} border border-[#2e4150] bg-white text-[#2e4150] hover:bg-[#f2f6f9]`}
        >
          <span className="material-symbols-outlined text-[18px]">preview</span>
          Preview Invoice
        </button>
      )}
      {mode === 'edit' && onSendInvoice && (
        <button
          type="button"
          onClick={onSendInvoice}
          disabled={sendLoading}
          className={`${btnBase} border border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
          {sendLoading ? 'Sending…' : 'Send Invoice'}
        </button>
      )}
      <button
        type="button"
        onClick={onGenerate}
        disabled={submitLoading}
        className={`${btnBase} bg-[#2e4150] text-white disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        <span className="material-symbols-outlined text-[18px]">description</span>
        {submitLoading ? 'Saving…' : (generateLabel || (mode === 'edit' ? 'Update Invoice' : 'Generate Invoice'))}
      </button>
    </div>
  );
};

export default InvoiceFormActionButtons;
