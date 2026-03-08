import React from 'react';

interface Props {
  mode: 'create' | 'edit' | 'template';
  onReset?: () => void;
  onCancel?: () => void;
  onPreview: () => void;
  onGenerate: () => void;
  generateLabel?: string;
  submitLoading?: boolean;
}

const FormActionButtons: React.FC<Props> = ({
  mode,
  onReset,
  onCancel,
  onPreview,
  onGenerate,
  generateLabel = 'Generate Payslip',
  submitLoading = false,
}) => {
  const btnBase = 'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90';
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
      {(mode === 'create' || mode === 'template') && onReset && (
        <button
          type="button"
          onClick={onReset}
          className={`${btnBase} border border-[#e7ebf3] bg-white text-[#4c669a] hover:bg-[#f2f6f9]`}
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Reset Form
        </button>
      )}
      {(mode === 'edit' || mode === 'template') && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className={`${btnBase} border border-[#e7ebf3] bg-white text-[#4c669a] hover:bg-[#f2f6f9]`}
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
          Cancel
        </button>
      )}
      {mode !== 'template' && (
        <button
          type="button"
          onClick={onPreview}
          className={`${btnBase} border border-[#2e4150] bg-white text-[#2e4150] hover:bg-[#f2f6f9]`}
        >
          <span className="material-symbols-outlined text-[18px]">preview</span>
          Preview Payslip
        </button>
      )}
      <button type="button" onClick={onGenerate} disabled={submitLoading} className={`${btnBase} bg-[#2e4150] text-white disabled:opacity-60 disabled:cursor-not-allowed`}>
        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
        {generateLabel}
      </button>
    </div>
  );
};

export default FormActionButtons;
