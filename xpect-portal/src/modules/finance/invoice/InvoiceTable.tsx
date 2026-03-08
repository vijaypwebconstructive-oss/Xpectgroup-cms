import React from 'react';

const STATUS_BADGE: Record<string, string> = {
  Paid: 'bg-green-50 text-green-700 border border-green-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  Overdue: 'bg-red-50 text-red-700 border border-red-200',
  Sent: 'bg-blue-50 text-blue-700 border border-blue-200',
};

export interface InvoiceTableRow {
  id: string;
  invoiceNo: string;
  clientName: string;
  clientPhone: string;
  issuedDate: string;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Sent';
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

interface InvoiceTableProps {
  rows: InvoiceTableRow[];
  loading?: boolean;
  rowIndexStart?: number;
  selectedIds: Set<string>;
  allSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onSend?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  onInvoiceNoClick?: (id: string) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  rows,
  loading = false,
  rowIndexStart = 0,
  selectedIds,
  allSelected,
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onEdit,
  onSend,
  onDelete,
  onDownload,
  onInvoiceNoClick,
}) => (
  <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-[#f6f6f8] border-b border-[#e7ebf3]">
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={e => onToggleSelectAll(e.target.checked)}
                className="rounded border-[#e7ebf3] text-[#2e4150] focus:ring-[#2e4150]/20"
                aria-label="Select all"
              />
            </th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Invoice No</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Client</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Issued Date</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Due Date</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Amount</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Status</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-[#6b7a99] text-sm">
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-[#6b7a99] text-sm">
                No invoices found.
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={row.id} className="border-b border-[#e7ebf3] hover:bg-[#f8f9fc] transition-colors">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={() => onToggleSelect(row.id)}
                    className="rounded border-[#e7ebf3] text-[#2e4150] focus:ring-[#2e4150]/20"
                    aria-label={`Select ${row.invoiceNo}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => (onInvoiceNoClick || onView)?.(row.id)}
                    className="text-[#2e4150] hover:text-[#3a5268] font-semibold text-sm text-left"
                  >
                    {row.invoiceNo}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#2e4150] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {getInitials(row.clientName)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0d121b]">{row.clientName}</p>
                      <p className="text-xs text-[#6b7a99]">{row.clientPhone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[#4c669a]">{row.issuedDate}</td>
                <td className="px-4 py-3 text-sm text-[#4c669a]">{row.dueDate}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#0d121b]">
                  £{row.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${STATUS_BADGE[row.status] || ''}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {onView && (
                      <button
                        type="button"
                        onClick={() => onView(row.id)}
                        className="flex items-center gap-1 text-[#4c669a] hover:text-[#2e4150] text-sm font-medium"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        View
                      </button>
                    )}
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(row.id)}
                        className="flex items-center gap-1 text-[#4c669a] hover:text-[#2e4150] text-sm font-medium"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        Edit
                      </button>
                    )}
                    {onSend && (
                      <button
                        type="button"
                        onClick={() => onSend(row.id)}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                      >
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        Send
                      </button>
                    )}
                    {onDownload && (
                      <button
                        type="button"
                        onClick={() => onDownload(row.id)}
                        className="flex items-center gap-1 text-[#4c669a] hover:text-[#2e4150] text-sm font-medium"
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        Download
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(row.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default InvoiceTable;
