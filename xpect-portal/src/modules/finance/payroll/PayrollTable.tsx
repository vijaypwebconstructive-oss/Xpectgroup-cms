import React from 'react';

export interface PayrollTableRow {
  id: string;
  employeeId: string;
  cleanerName: string;
  role: string;
  siteName: string;
  payType: 'Hourly' | 'Monthly';
  period: string;
  hoursWorked: string;
  hourlyRate: string;
  monthlySalary: string;
  totalPayable: string;
  paymentStatus: 'Pending' | 'Paid';
  salarySlip: { id: string } | null;
}

interface PayrollTableProps {
  rows: PayrollTableRow[];
  loading?: boolean;
  rowIndexStart?: number;
  selectedIds: Set<string>;
  allSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDownloadPayslip?: (slipId: string) => void;
  onSendPayslip?: (slipId: string) => void;
}

const PayrollTable: React.FC<PayrollTableProps> = ({
  rows,
  loading = false,
  rowIndexStart = 0,
  selectedIds,
  allSelected,
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onEdit,
  onDelete,
  onDownloadPayslip,
  onSendPayslip,
}) => (
  <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px]">
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
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">#</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Employee ID</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Cleaner Name</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Role</th>
            {/* <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Site</th> */}
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Pay Type</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Period</th>
            {/* <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Hours Worked</th> */}
            {/* <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Hourly Rate</th> */}
            {/* <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Monthly Salary</th> */}
            {/* <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Total Payable</th> */}
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Payment Status</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Payslip</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={15} className="px-4 py-8 text-center text-[#6b7a99] text-sm">
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={15} className="px-4 py-8 text-center text-[#6b7a99] text-sm">
                No payroll records found.
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
                    aria-label={`Select ${row.cleanerName}`}
                  />
                </td>
                <td className="px-4 py-3 text-sm text-[#0d121b]">{rowIndexStart + idx + 1}</td>
                <td className="px-4 py-3 text-sm text-[#4c669a]">{row.employeeId}</td>
                <td className="px-4 py-3 text-sm font-medium text-[#0d121b]">{row.cleanerName}</td>
                <td className="px-4 py-3 text-sm text-[#4c669a]">{row.role}</td>
                {/* <td className="px-4 py-3 text-sm text-[#4c669a]">{row.siteName}</td> */}
                <td className="px-4 py-3 text-sm text-[#4c669a]">{row.payType}</td>
                <td className="px-4 py-3 text-sm text-[#4c669a]">{row.period}</td>
                {/* <td className="px-4 py-3 text-sm text-[#4c669a]">{row.payType === 'Hourly' ? row.hoursWorked : '—'}</td> */}
                {/* <td className="px-4 py-3 text-sm text-[#4c669a]">{row.payType === 'Hourly' ? `£${row.hourlyRate}` : '—'}</td> */}
                {/* <td className="px-4 py-3 text-sm text-[#4c669a]">{row.payType === 'Monthly' ? `£${row.monthlySalary}` : '—'}</td> */}
                {/* <td className="px-4 py-3 text-sm font-semibold text-[#0d121b]">£{row.totalPayable}</td> */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                      row.paymentStatus === 'Paid'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {row.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {row.salarySlip ? (
                    <div className="flex items-center gap-1">
                      {onDownloadPayslip && (
                        <button
                          type="button"
                          onClick={() => onDownloadPayslip(row.salarySlip!.id)}
                          className="p-1.5 rounded-lg text-[#4c669a] hover:bg-[#f2f6f9] hover:text-[#2e4150] transition-colors"
                          title="Download payslip"
                          aria-label="Download payslip"
                        >
                          <span className="material-symbols-outlined text-[20px]">download</span>
                        </button>
                      )}
                      {onSendPayslip && (
                        <button
                          type="button"
                          onClick={() => onSendPayslip(row.salarySlip!.id)}
                          className="p-1.5 rounded-lg text-[#4c669a] hover:bg-[#f2f6f9] hover:text-[#2e4150] transition-colors"
                          title="Send payslip to cleaner"
                          aria-label="Send payslip"
                        >
                          <span className="material-symbols-outlined text-[20px]">send</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-[#6b7a99] text-sm">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {onView && (
                      <button
                        type="button"
                        onClick={() => onView(row.id)}
                        className="text-[#4c669a] hover:text-[#2e4150] text-sm font-medium"
                      >
                        View
                      </button>
                    )}
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(row.id)}
                        className="text-[#4c669a] hover:text-[#2e4150] text-sm font-medium"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(row.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
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

export default PayrollTable;
