import React, { useState, useRef, useEffect } from 'react';

interface QuotationTableActionsProps {
  onAddQuotation?: () => void;
  onExportCsv?: () => void;
  sortValue?: string;
  onSortChange?: (value: string) => void;
  selectedCount?: number;
  onBulkMarkAsSent?: () => void;
  onBulkDelete?: () => void;
  bulkLoading?: boolean;
}

const QuotationTableActions: React.FC<QuotationTableActionsProps> = ({
  onAddQuotation,
  onExportCsv,
  sortValue = '',
  onSortChange,
  selectedCount = 0,
  onBulkMarkAsSent,
  onBulkDelete,
  bulkLoading = false,
}) => {
  const [bulkOpen, setBulkOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBulkOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {onAddQuotation && (
          <button
            type="button"
            onClick={onAddQuotation}
            className="flex items-center gap-2 px-4 py-2 bg-[#2e4150] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Quotation
          </button>
        )}
        {onExportCsv && (
          <button
            type="button"
            onClick={onExportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e7ebf3] text-[#4c669a] rounded-lg text-sm font-semibold hover:bg-[#f2f6f9] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export As CSV
          </button>
        )}
        {selectedCount > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setBulkOpen(o => !o)}
              disabled={bulkLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e7ebf3] text-[#4c669a] rounded-lg text-sm font-semibold hover:bg-[#f2f6f9] transition-colors disabled:opacity-60"
            >
              Bulk Actions
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            {bulkOpen && (
              <div className="absolute top-full left-0 mt-1 py-1 bg-white border border-[#e7ebf3] rounded-lg shadow-lg z-10 min-w-[200px]">
                {onBulkMarkAsSent && (
                  <button
                    type="button"
                    onClick={() => {
                      onBulkMarkAsSent();
                      setBulkOpen(false);
                    }}
                    disabled={bulkLoading}
                    className="w-full text-left px-4 py-2 text-sm text-[#0d121b] hover:bg-[#f6f7fb] disabled:opacity-60"
                  >
                    Mark as Sent
                  </button>
                )}
                {onBulkDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      onBulkDelete();
                      setBulkOpen(false);
                    }}
                    disabled={bulkLoading}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[#f6f7fb] disabled:opacity-60"
                  >
                    Delete Selected
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {onSortChange && (
          <select
            value={sortValue}
            onChange={e => onSortChange(e.target.value)}
            className="h-9 px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 min-w-[140px]"
          >
            <option value="">Sort by</option>
            <option value="quotationNo">Quotation No</option>
            <option value="client">Client</option>
            <option value="amount">Amount</option>
            <option value="status">Status</option>
          </select>
        )}
      </div>
    </div>
  );
};

export default QuotationTableActions;
