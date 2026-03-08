import React from 'react';

interface InvoicePaginationProps {
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const InvoicePagination: React.FC<InvoicePaginationProps> = ({
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3 py-4">
    <div className="flex items-center gap-2">
      <span className="text-sm text-[#4c669a]">Show</span>
      <select
        value={pageSize}
        onChange={e => onPageSizeChange?.(Number(e.target.value))}
        className="h-9 px-2 py-1 bg-white border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20"
      >
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
      <span className="text-sm text-[#4c669a]">entries</span>
    </div>
    <div className="flex items-center gap-1">
    {onPageChange && (
      <>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[#e7ebf3] text-[#4c669a] hover:bg-[#f2f6f9] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="px-3 py-1.5 text-sm text-[#4c669a]">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[#e7ebf3] text-[#4c669a] hover:bg-[#f2f6f9] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </>
    )}
    </div>
  </div>
);

export default InvoicePagination;
