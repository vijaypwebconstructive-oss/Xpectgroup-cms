import React from 'react';

interface InvoiceFiltersProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  pageSize,
  onPageSizeChange,
  searchValue,
  onSearchChange,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <select
      value={pageSize}
      onChange={e => onPageSizeChange(Number(e.target.value))}
      className="h-9 px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20"
    >
      <option value={10}>10 entries</option>
      <option value={25}>25 entries</option>
      <option value={50}>50 entries</option>
      <option value={100}>100 entries</option>
    </select>
    <input
      type="text"
      placeholder="Search..."
      value={searchValue}
      onChange={e => onSearchChange(e.target.value)}
      className="h-9 px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 min-w-[180px]"
    />
  </div>
);

export default InvoiceFilters;
