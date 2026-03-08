import React, { useState, useEffect, useMemo } from 'react';
import { financeNavigate } from '../financeNavStore';
import { useFinance } from '../../../context/FinanceContext';
import type { Quotation } from '../../finance-payroll/types';
import QuotationStatsCards, { type QuotationStats } from './QuotationStatsCards';
import QuotationTableActions from './QuotationTableActions';
import QuotationFilters from './QuotationFilters';
import QuotationTable, { type QuotationTableRow } from './QuotationTable';
import QuotationPagination from './QuotationPagination';

const QuotationListPage: React.FC = () => {
  const { quotations, refreshQuotations, updateQuotation, deleteQuotation, loading } = useFinance();
  const [sortValue, setSortValue] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    refreshQuotations();
  }, [refreshQuotations]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [searchValue, sortValue]);

  const tableRows = useMemo((): QuotationTableRow[] => {
    return quotations.map((q: Quotation) => ({
      id: q.id,
      quotationNo: q.quotationNumber || '—',
      clientName: q.billTo?.clientName || q.clientName || 'Unknown',
      clientEmail: q.billTo?.email || q.clientEmail || '',
      totalPrice: q.payableAmount ?? q.totalAmount ?? q.totalPrice ?? 0,
      status: (q.status || 'Draft') as 'Draft' | 'Sent' | 'Accepted' | 'Rejected',
    }));
  }, [quotations]);

  const filteredRows = useMemo(() => {
    let rows = tableRows;
    if (searchValue.trim()) {
      const q = searchValue.toLowerCase().trim();
      rows = rows.filter(
        r =>
          r.quotationNo.toLowerCase().includes(q) ||
          r.clientName.toLowerCase().includes(q) ||
          r.clientEmail.toLowerCase().includes(q)
      );
    }
    if (sortValue === 'quotationNo') {
      rows = [...rows].sort((a, b) => a.quotationNo.localeCompare(b.quotationNo));
    } else if (sortValue === 'client') {
      rows = [...rows].sort((a, b) => a.clientName.localeCompare(b.clientName));
    } else if (sortValue === 'amount') {
      rows = [...rows].sort((a, b) => a.totalPrice - b.totalPrice);
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

  const stats = useMemo((): QuotationStats => {
    const draft = tableRows.filter(r => r.status === 'Draft');
    const sent = tableRows.filter(r => r.status === 'Sent');
    const accepted = tableRows.filter(r => r.status === 'Accepted');
    const rejected = tableRows.filter(r => r.status === 'Rejected');
    const totalValue = tableRows.reduce((sum, r) => sum + r.totalPrice, 0);
    return {
      totalQuotations: tableRows.length || '—',
      totalValue: tableRows.length ? `£${totalValue.toFixed(2)}` : '—',
      draftCount: draft.length || '—',
      sentCount: sent.length || '—',
      acceptedCount: accepted.length || '—',
      rejectedCount: rejected.length || '—',
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

  const handleDownloadQuotation = (id: string) => {
    const url = `${window.location.origin}/finance-management/quotation/view/${id}?print=true`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quotation?')) return;
    try {
      await deleteQuotation(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete quotation');
    }
  };

  const handleBulkMarkAsSent = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      for (const id of selectedIds) {
        await updateQuotation(id, { status: 'Sent' });
      }
      await refreshQuotations();
      setSelectedIds(new Set());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark as sent');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected quotation(s)?`)) return;
    setBulkLoading(true);
    try {
      for (const id of selectedIds) {
        await deleteQuotation(id);
      }
      setSelectedIds(new Set());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete quotations');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Quotation No', 'Client', 'Email', 'Total Price', 'Status'];
    const rows = filteredRows.map(r => [
      r.quotationNo,
      r.clientName,
      r.clientEmail,
      `£${r.totalPrice.toFixed(2)}`,
      r.status,
    ]);
    const escape = (s: string) =>
      s.includes(',') || s.includes('"') || s.includes('\n') ? `"${String(s).replace(/"/g, '""')}"` : s;
    const csv = [headers.map(escape).join(','), ...rows.map(row => row.map(c => escape(String(c))).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotations-export-${new Date().toISOString().slice(0, 10)}.csv`;
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
          <span>Quotation</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#0d121b] font-semibold">Quotation List</span>
        </nav>
        <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-bold font-black">Quotation</h1>
      </div>

      <QuotationStatsCards stats={stats} />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-[#0d121b] text-lg font-bold">Quotation List</h2>
          <QuotationTableActions
            onAddQuotation={() => financeNavigate('quotation-create')}
            onExportCsv={handleExportCsv}
            sortValue={sortValue}
            onSortChange={setSortValue}
            selectedCount={selectedIds.size}
            onBulkMarkAsSent={handleBulkMarkAsSent}
            onBulkDelete={handleBulkDelete}
            bulkLoading={bulkLoading}
          />
        </div>

        <QuotationFilters
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

        <QuotationTable
          rows={paginatedRows}
          loading={loading}
          rowIndexStart={(currentPage - 1) * pageSize}
          selectedIds={selectedIds}
          allSelected={paginatedRows.length > 0 && paginatedRows.every(r => selectedIds.has(r.id))}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onView={id => financeNavigate('quotation-view', id)}
          onEdit={id => financeNavigate('quotation-edit', id)}
          onDownload={handleDownloadQuotation}
          onDelete={handleDelete}
          onQuotationNoClick={id => financeNavigate('quotation-view', id)}
        />

        <QuotationPagination
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

export default QuotationListPage;
