import React, { useState, useEffect, useMemo } from 'react';
import { financeNavigate } from '../financeNavStore';
import { useFinance } from '../../../context/FinanceContext';
import api from '../../../services/api';
import type { Invoice } from '../../finance-payroll/types';
import InvoiceStatsCards, { type InvoiceStats } from './InvoiceStatsCards';
import InvoiceTableActions from './InvoiceTableActions';
import InvoiceFilters from './InvoiceFilters';
import InvoiceTable, { type InvoiceTableRow } from './InvoiceTable';
import InvoicePagination from './InvoicePagination';

const InvoiceListPage: React.FC = () => {
  const { invoices, refreshInvoices, updateInvoice, deleteInvoice, loading } = useFinance();
  const [sortValue, setSortValue] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    refreshInvoices();
  }, [refreshInvoices]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [searchValue, sortValue]);

  const tableRows = useMemo((): InvoiceTableRow[] => {
    return invoices.map(inv => ({
      id: inv.id,
      invoiceNo: inv.invoiceNumber,
      clientName: inv.billTo?.clientName || 'Unknown',
      clientPhone: inv.billTo?.phone || '',
      issuedDate: inv.issueDate,
      dueDate: inv.dueDate,
      amount: inv.payableAmount ?? inv.totalAmount ?? 0,
      status: (inv.status || 'Pending') as 'Paid' | 'Pending' | 'Overdue' | 'Sent',
    }));
  }, [invoices]);

  const filteredRows = useMemo(() => {
    let rows = tableRows;
    if (searchValue.trim()) {
      const q = searchValue.toLowerCase().trim();
      rows = rows.filter(
        r =>
          r.invoiceNo.toLowerCase().includes(q) ||
          r.clientName.toLowerCase().includes(q) ||
          r.clientPhone.toLowerCase().includes(q)
      );
    }
    if (sortValue === 'invoiceNo') {
      rows = [...rows].sort((a, b) => a.invoiceNo.localeCompare(b.invoiceNo));
    } else if (sortValue === 'date') {
      rows = [...rows].sort((a, b) => a.issuedDate.localeCompare(b.issuedDate));
    } else if (sortValue === 'amount') {
      rows = [...rows].sort((a, b) => a.amount - b.amount);
    } else if (sortValue === 'status') {
      rows = [...rows].sort((a, b) => a.status.localeCompare(b.status));
    }
    return rows;
  }, [tableRows, searchValue, sortValue]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const stats = useMemo((): InvoiceStats => {
    const paid = tableRows.filter(r => r.status === 'Paid');
    const overdue = tableRows.filter(r => r.status === 'Overdue');
    const pending = tableRows.filter(r => r.status === 'Pending');
    const paidAmount = paid.reduce((sum, r) => sum + r.amount, 0);
    return {
      totalInvoices: tableRows.length || '—',
      paidAmount: tableRows.length ? `£${paidAmount.toFixed(2)}` : '—',
      overdueCount: overdue.length || '—',
      pendingCount: pending.length || '—',
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await deleteInvoice(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete invoice');
    }
  };

  const handleDownloadInvoice = (id: string) => {
    const url = `${window.location.origin}/finance-management/invoice/view/${id}?print=true`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSend = async (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv?.billTo?.email?.trim()) {
      alert('Client email is required to send the invoice.');
      return;
    }
    try {
      await api.finance.invoices.send(id);
      await refreshInvoices();
      alert('Invoice sent successfully to ' + inv.billTo?.email);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send invoice');
    }
  };

  const handleBulkMarkAsPaid = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      for (const id of selectedIds) {
        await updateInvoice(id, { status: 'Paid' });
      }
      await refreshInvoices();
      setSelectedIds(new Set());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark as paid');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected invoice(s)?`)) return;
    setBulkLoading(true);
    try {
      for (const id of selectedIds) {
        await deleteInvoice(id);
      }
      setSelectedIds(new Set());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete invoices');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Invoice No', 'Client', 'Issued Date', 'Due Date', 'Amount', 'Status'];
    const rows = filteredRows.map(r => [
      r.invoiceNo,
      r.clientName,
      r.issuedDate,
      r.dueDate,
      `£${r.amount.toFixed(2)}`,
      r.status,
    ]);
    const escape = (s: string) =>
      s.includes(',') || s.includes('"') || s.includes('\n') ? `"${String(s).replace(/"/g, '""')}"` : s;
    const csv = [headers.map(escape).join(','), ...rows.map(row => row.map(c => escape(String(c))).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <nav className="flex items-center gap-2 text-sm text-[#4c669a] mb-2">
          <span>Home</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Finance & Payroll</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Invoice</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#0d121b] font-semibold">Invoice List</span>
        </nav>
        <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-bold font-black">Invoice</h1>
      </div>

      <InvoiceStatsCards stats={stats} />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-[#0d121b] text-lg font-bold">Invoice List</h2>
          <InvoiceTableActions
            onAddInvoice={() => financeNavigate('invoice-create')}
            onExportCsv={handleExportCsv}
            sortValue={sortValue}
            onSortChange={setSortValue}
            selectedCount={selectedIds.size}
            onBulkMarkAsPaid={handleBulkMarkAsPaid}
            onBulkDelete={handleBulkDelete}
            bulkLoading={bulkLoading}
          />
        </div>

        <InvoiceFilters
          pageSize={pageSize}
          onPageSizeChange={size => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          searchValue={searchValue}
          onSearchChange={v => {
            setSearchValue(v);
            setCurrentPage(1);
          }}
        />

        <InvoiceTable
          rows={paginatedRows}
          loading={loading}
          rowIndexStart={(currentPage - 1) * pageSize}
          selectedIds={selectedIds}
          allSelected={paginatedRows.length > 0 && paginatedRows.every(r => selectedIds.has(r.id))}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onView={id => financeNavigate('invoice-view', id)}
          onEdit={id => financeNavigate('invoice-edit', id)}
          onSend={handleSend}
          onDownload={handleDownloadInvoice}
          onDelete={handleDelete}
          onInvoiceNoClick={id => financeNavigate('invoice-view', id)}
        />

        <InvoicePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={size => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
};

export default InvoiceListPage;
