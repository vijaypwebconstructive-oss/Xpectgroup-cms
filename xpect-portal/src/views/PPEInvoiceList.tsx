import React, { useState } from 'react';
import { PPEInvoiceRecord, PPEInvoiceEmailStatus } from '../types';
import { usePPEInvoice } from '../context/PPEInvoiceContext';
import { useClientsSites } from '../context/ClientsSitesContext';
import api from '../services/api';

interface PPEInvoiceListProps {
  onAddRecord: () => void;
}

const EMAIL_STATUS_STYLES: Record<PPEInvoiceEmailStatus, { badge: string; label: string }> = {
  PENDING: { badge: 'bg-amber-100 text-amber-700', label: 'Pending' },
  SENT: { badge: 'bg-green-100 text-green-700', label: 'Sent' },
};

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d || '—'; }
};

const PREVIEWABLE_EXT = /\.(pdf|png|jpg|jpeg)$/i;
const PREVIEWABLE_MIME = /^(application\/pdf|image\/(png|jpeg|jpg))/i;
const isPreviewable = (record: PPEInvoiceRecord): boolean => {
  if (!record.invoiceFileData) return false;
  const ext = record.invoiceFile ? PREVIEWABLE_EXT.test(record.invoiceFile) : false;
  const mime = record.invoiceFileData.startsWith('data:') && PREVIEWABLE_MIME.test(record.invoiceFileData.split(';')[0]);
  return ext || mime;
};
const isPdf = (record: PPEInvoiceRecord): boolean => {
  if (!record.invoiceFileData) return false;
  const lower = record.invoiceFile?.toLowerCase() ?? '';
  return lower.endsWith('.pdf') || record.invoiceFileData.startsWith('data:application/pdf');
};

const PPEInvoiceList: React.FC<PPEInvoiceListProps> = ({ onAddRecord }) => {
  const { ppeInvoiceRecords, updatePPEInvoiceRecord, loading, error } = usePPEInvoice();
  const { clients } = useClientsSites();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendMessage, setSendMessage] = useState<string | null>(null);
  const [viewRecord, setViewRecord] = useState<PPEInvoiceRecord | null>(null);
  const [viewError, setViewError] = useState(false);

  const getClientEmail = (clientName: string): string | null => {
    const client = clients.find(c => c.name.trim().toLowerCase() === clientName.trim().toLowerCase());
    return client?.email && client.email.trim() ? client.email : null;
  };

  const handleSend = async (record: PPEInvoiceRecord): Promise<void> => {
    const email = getClientEmail(record.clientName);
    if (!email) {
      setSendMessage('No email on file for this client.');
      setTimeout(() => setSendMessage(null), 3000);
      return;
    }
    if (!record.invoiceFileData) {
      setSendMessage('No invoice file attached to this record.');
      setTimeout(() => setSendMessage(null), 3000);
      return;
    }
    setSendingId(record.id);
    setSendMessage(null);
    try {
      await api.ppe.sendInvoice({
        email,
        clientName: record.clientName,
        invoiceFilename: record.invoiceFile || 'invoice.pdf',
        invoiceBase64: record.invoiceFileData,
      });
      await updatePPEInvoiceRecord(record.id, { emailStatus: 'SENT' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send invoice.';
      setSendMessage(msg);
      setTimeout(() => setSendMessage(null), 4000);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#e7ebf3] flex-wrap">
          <div className="flex items-center gap-3">
            <h2 className="text-[#0d121b] text-base font-semibold font-black">PPE Invoice List</h2>
            <span className="bg-[#e7ebf3] text-[#4c669a] text-xs font-bold px-2.5 py-1 rounded-full">
              {ppeInvoiceRecords.length} records
            </span>
          </div>
          <button
            onClick={onAddRecord}
            className="flex items-center gap-2 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-all px-[30px] py-[15px] h-10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Add PPE Record
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[#e7ebf3] bg-[#f8fafc]">
                <th className="text-left px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Client Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Issue Date</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Invoice File</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Email Status</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7ebf3]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <span className="material-symbols-outlined text-[#4c669a] text-4xl animate-spin block mb-2">progress_activity</span>
                    <p className="text-[#4c669a] text-sm font-semibold">Loading invoices…</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <span className="material-symbols-outlined text-red-500 text-[48px] block mb-2">error</span>
                    <p className="text-red-600 text-sm font-semibold">{error}</p>
                  </td>
                </tr>
              ) : ppeInvoiceRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <span className="material-symbols-outlined text-[#c7c7c7] text-5xl block mb-2">description</span>
                    <p className="text-[#4c669a] text-sm font-semibold">No PPE invoices yet</p>
                    <p className="text-[#9aa5be] text-xs mt-1">Click "Add PPE Record" to create your first invoice record.</p>
                  </td>
                </tr>
              ) : (
                ppeInvoiceRecords.map(record => {
                  const statusStyle = EMAIL_STATUS_STYLES[record.emailStatus];
                  return (
                    <tr key={record.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-[#0d121b]">{record.clientName}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#4c669a] font-medium whitespace-nowrap">
                        {formatDate(record.issueDate)}
                      </td>
                      <td className="px-4 py-4">
                        {record.invoiceFileData ? (
                          <button
                            onClick={() => { setViewRecord(record); setViewError(false); }}
                            className="inline-flex items-center gap-1.5 text-sm text-[#0d121b] hover:text-[#2e4150] transition-colors cursor-pointer group"
                          >
                            <span className="material-symbols-outlined text-[18px] text-[#4c669a]">description</span>
                            <span className="truncate max-w-[180px]">{record.invoiceFile || '—'}</span>
                            <span className="material-symbols-outlined text-[16px] text-[#4c669a] group-hover:text-[#2e4150]" title="View">visibility</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm text-[#4c669a]">
                            <span className="material-symbols-outlined text-[18px]">description</span>
                            {record.invoiceFile || '—'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${statusStyle.badge}`}>
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleSend(record)}
                          disabled={sendingId === record.id || !record.invoiceFileData}
                          className="flex items-center gap-1.5 ml-auto text-amber-600 hover:text-amber-700 text-xs font-semibold font-black capitalize tracking-wide transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendingId === record.id ? (
                            <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                          ) : (
                            <span className="material-symbols-outlined text-[16px]">mail</span>
                          )}
                          Send
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {ppeInvoiceRecords.length > 0 && (
          <div className="px-5 py-3 border-t border-[#e7ebf3] bg-[#f8fafc] flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-[#4c669a]">
              Showing <span className="font-bold text-[#0d121b]">{ppeInvoiceRecords.length}</span> records
            </p>
            {sendMessage && (
              <p className={`text-xs font-medium ${sendMessage.includes('Failed') || sendMessage.includes('No ') ? 'text-red-600' : 'text-green-600'}`}>
                {sendMessage}
              </p>
            )}
          </div>
        )}
      </div>

      {/* PPE Invoice Document Viewer Modal */}
      {viewRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setViewRecord(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ppe-invoice-viewer-title"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7ebf3] shrink-0">
              <h3 id="ppe-invoice-viewer-title" className="text-lg font-bold text-[#0d121b] truncate pr-4">
                {viewRecord.invoiceFile || 'PPE Invoice'}
              </h3>
              <button
                onClick={() => setViewRecord(null)}
                className="p-1.5 rounded-lg hover:bg-[#f6f7fb] transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[24px] text-[#6b7a99]">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[#f8fafc] min-h-[400px]">
              {!viewRecord.invoiceFileData ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-[48px] text-[#c7c7c7] block mb-3">description</span>
                  <p className="text-[#4c669a] font-semibold">Unable to preview document. Please download the file.</p>
                </div>
              ) : viewError || !isPreviewable(viewRecord) ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-[48px] text-[#c7c7c7] block mb-3">description</span>
                  <p className="text-[#4c669a] font-semibold">Unable to preview document. Please download the file.</p>
                </div>
              ) : isPdf(viewRecord) ? (
                <iframe
                  src={viewRecord.invoiceFileData}
                  title={viewRecord.invoiceFile || 'Invoice'}
                  className="w-full min-h-[500px] border border-[#e7ebf3] rounded-lg bg-white"
                  style={{ minHeight: '60vh' }}
                />
              ) : (
                <img
                  src={viewRecord.invoiceFileData}
                  alt={viewRecord.invoiceFile || 'Invoice'}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow"
                  onError={() => setViewError(true)}
                />
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#e7ebf3] flex items-center justify-between gap-3 flex-wrap">
              {viewRecord.invoiceFileData && (
                <a
                  href={viewRecord.invoiceFileData}
                  download={viewRecord.invoiceFile || 'invoice'}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download
                </a>
              )}
              <button
                onClick={() => setViewRecord(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#e7ebf3] text-[#0d121b] text-sm font-bold hover:bg-[#f6f7fb] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PPEInvoiceList;
