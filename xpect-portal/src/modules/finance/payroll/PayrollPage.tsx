import React, { useState, useEffect, useMemo } from 'react';
import { financeNavigate } from '../financeNavStore';
import { useFinance } from '../../../context/FinanceContext';
import api from '../../../services/api';
import type { SalarySlip } from '../../finance-payroll/types';
import PayrollStatsCards from './PayrollStatsCards';
import PayrollActionsBar from './PayrollActionsBar';
import PayrollTable from './PayrollTable';
import PayrollPagination from './PayrollPagination';

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PayrollPage: React.FC = () => {
  const { payrollRecords, salarySlips, refreshPayroll, refreshSalarySlips, updatePayroll, deletePayroll, loading } = useFinance();
  const [sortValue, setSortValue] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    refreshPayroll();
    refreshSalarySlips();
  }, [refreshPayroll, refreshSalarySlips]);

  // Clear selection when search or sort changes (Option A)
  useEffect(() => {
    setSelectedIds(new Set());
  }, [searchQuery, sortValue]);

  const payrollIdToSlip = useMemo(() => {
    const map = new Map<string, SalarySlip>();
    for (const s of salarySlips) {
      map.set(s.payrollId, s);
    }
    return map;
  }, [salarySlips]);

  const tableRows = useMemo(() => {
    return payrollRecords.map(p => {
      const payType = (p.payType === 'Monthly' ? 'Monthly' : 'Hourly') as 'Hourly' | 'Monthly';
      return {
        id: p.id,
        employeeId: p.workerId || '',
        cleanerName: p.workerName || 'Unknown',
        role: p.role || 'Cleaner',
        siteName: p.siteName || '',
        payType,
        period: `${MONTHS[p.month] || p.month} ${p.year}`,
        hoursWorked: String(p.hoursWorked ?? 0),
        hourlyRate: (p.hourlyRate ?? 0).toFixed(2),
        monthlySalary: (p.monthlySalary ?? 0).toFixed(2),
        totalPayable: (p.totalSalary ?? 0).toFixed(2),
        paymentStatus: (p.paymentStatus || 'Pending') as 'Pending' | 'Paid',
        salarySlip: payrollIdToSlip.get(p.id) ?? null,
      };
    });
  }, [payrollRecords, payrollIdToSlip]);

  const filteredRows = useMemo(() => {
    let rows = tableRows;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      rows = rows.filter(r =>
        r.cleanerName.toLowerCase().includes(q) ||
        r.period.toLowerCase().includes(q) ||
        r.employeeId.toLowerCase().includes(q) ||
        (r.siteName && r.siteName.toLowerCase().includes(q))
      );
    }
    if (sortValue === 'name') {
      rows = [...rows].sort((a, b) => a.cleanerName.localeCompare(b.cleanerName));
    } else if (sortValue === 'period') {
      rows = [...rows].sort((a, b) => a.period.localeCompare(b.period));
    } else if (sortValue === 'status') {
      rows = [...rows].sort((a, b) => a.paymentStatus.localeCompare(b.paymentStatus));
    }
    return rows;
  }, [tableRows, searchQuery, sortValue]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const stats = useMemo(() => {
    const paid = tableRows.filter(r => r.paymentStatus === 'Paid').length;
    const pending = tableRows.filter(r => r.paymentStatus === 'Pending').length;
    const totalSalary = tableRows.reduce((sum, r) => sum + parseFloat(r.totalPayable || '0'), 0);
    return {
      totalPayroll: tableRows.length ? `£${totalSalary.toFixed(2)}` : '—',
      employees: tableRows.length || '—',
      processed: paid || '—',
      pending: pending || '—',
    };
  }, [tableRows]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedRows.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleDownloadPayslip = (slipId: string) => {
    window.open(api.finance.salarySlips.getDownloadUrl(slipId), '_blank');
  };

  const handleSendPayslip = async (slipId: string) => {
    try {
      await api.finance.salarySlips.send(slipId);
      await refreshSalarySlips();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send payslip');
    }
  };

  const handleBulkMarkAsPaid = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const paymentDate = new Date().toISOString().split('T')[0];
      for (const id of selectedIds) {
        await updatePayroll(id, { paymentStatus: 'Paid', paymentDate });
      }
      await refreshPayroll();
      await refreshSalarySlips();
      setSelectedIds(new Set());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark as paid');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkSendPayslip = async () => {
    const rowsWithSlips = filteredRows.filter(r => selectedIds.has(r.id) && r.salarySlip);
    if (rowsWithSlips.length === 0) {
      alert('No selected rows have a payslip. Mark them as Paid first.');
      return;
    }
    setBulkLoading(true);
    try {
      for (const r of rowsWithSlips) {
        if (r.salarySlip) await api.finance.salarySlips.send(r.salarySlip.id);
      }
      setSelectedIds(new Set());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send payslips');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this payroll record?')) return;
    try {
      await deletePayroll(id);
      await refreshSalarySlips();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete payroll record');
    }
  };

  const handleExportCsv = () => {
    const headers = ['Employee ID', 'Cleaner Name', 'Role', 'Site', 'Pay Type', 'Period', 'Hours Worked', 'Hourly Rate', 'Monthly Salary', 'Total Payable', 'Payment Status'];
    const rows = filteredRows.map(r => [
      r.employeeId,
      r.cleanerName,
      r.role,
      r.siteName,
      r.payType,
      r.period,
      r.hoursWorked,
      `£${r.hourlyRate}`,
      `£${r.monthlySalary}`,
      `£${r.totalPayable}`,
      r.paymentStatus,
    ]);
    const escape = (s: string) => (s.includes(',') || s.includes('"') || s.includes('\n') ? `"${String(s).replace(/"/g, '""')}"` : s);
    const csv = [headers.map(escape).join(','), ...rows.map(row => row.map(c => escape(String(c))).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkMarkAndSend = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const paymentDate = new Date().toISOString().split('T')[0];
      for (const id of selectedIds) {
        await updatePayroll(id, { paymentStatus: 'Paid', paymentDate });
      }
      await refreshPayroll();
      await refreshSalarySlips();
      const slipsAfter = await api.finance.salarySlips.getAll();
      for (const id of selectedIds) {
        const slip = slipsAfter.find((s: SalarySlip) => s.payrollId === id);
        if (slip) await api.finance.salarySlips.send(slip.id);
      }
      setSelectedIds(new Set());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark as paid and send payslips');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div>
        <nav className="flex items-center gap-2 text-sm text-[#4c669a] mb-2">
          <span>Home</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Payroll</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#0d121b] font-semibold">Payroll List</span>
        </nav>
        <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-bold font-black">Payroll</h1>
      </div>

      {/* Stats Cards */}
      <PayrollStatsCards {...stats} />

      {/* Payroll List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-[#0d121b] text-lg font-bold">Payroll List</h2>
          <PayrollActionsBar
            onAddPayrollSlip={() => financeNavigate('payslip-create')}
            onExportCsv={handleExportCsv}
            sortValue={sortValue}
            onSortChange={setSortValue}
            selectedCount={selectedIds.size}
            onBulkMarkAsPaid={handleBulkMarkAsPaid}
            onBulkSendPayslip={handleBulkSendPayslip}
            onBulkMarkAndSend={handleBulkMarkAndSend}
            bulkLoading={bulkLoading}
          />
        </div>

        {/* Table controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
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
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 min-w-[180px]"
          />
        </div>

        {/* Table */}
        <PayrollTable
          rows={paginatedRows}
          loading={loading}
          rowIndexStart={(currentPage - 1) * pageSize}
          selectedIds={selectedIds}
          allSelected={paginatedRows.length > 0 && paginatedRows.every(r => selectedIds.has(r.id))}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onView={id => financeNavigate('payslip-view', id)}
          onEdit={id => financeNavigate('payslip-edit', id)}
          onDelete={handleDelete}
          onDownloadPayslip={handleDownloadPayslip}
          onSendPayslip={handleSendPayslip}
        />

        {/* Pagination */}
        <PayrollPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
};

export default PayrollPage;
