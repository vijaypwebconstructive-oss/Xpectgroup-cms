import React, { useState } from 'react';
import { usePPEInvoice } from '../context/PPEInvoiceContext';
import { useClientsSites } from '../context/ClientsSitesContext';
import { navigateToUrl } from '../utils/routing';
import api from '../services/api';

interface PPEAddRecordProps {
  onBack: () => void;
}

const PPEAddRecord: React.FC<PPEAddRecordProps> = ({ onBack }) => {
  const { addPPEInvoiceRecord, updatePPEInvoiceRecord } = usePPEInvoice();
  const { clients: allClients } = useClientsSites();
  const [form, setForm] = useState({
    clientId: '',
    clientName: '',
    issueDate: new Date().toISOString().split('T')[0],
    invoiceFile: '',
    invoiceFileData: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);

  const selectedClient = allClients.find(c => c.id === form.clientId);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.clientId) e.clientId = 'Please select a client.';
    if (!form.issueDate) e.issueDate = 'Please enter the issue date.';
    if (!form.invoiceFile && !savedRecordId) e.invoiceFile = 'Please upload an invoice.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleClientChange = (clientId: string) => {
    const client = allClients.find(c => c.id === clientId);
    setForm(prev => ({
      ...prev,
      clientId,
      clientName: client?.name || '',
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setForm(prev => ({
        ...prev,
        invoiceFile: file.name,
        invoiceFileData: data,
      }));
      setErrors(prev => ({ ...prev, invoiceFile: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setErrors({});
    setSaving(true);
    setMessage(null);
    try {
      const newRecord = await addPPEInvoiceRecord({
        clientId: form.clientId,
        clientName: form.clientName,
        issueDate: form.issueDate,
        invoiceFile: form.invoiceFile,
        invoiceFileData: form.invoiceFileData,
        emailStatus: 'PENDING',
      });
      setSavedRecordId(newRecord.id);
      navigateToUrl('/ppe');
      onBack();
    } catch {
      setMessage('Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!validate()) return;
    if (!selectedClient?.email) {
      setMessage('No email on file for this client.');
      return;
    }
    if (!form.invoiceFileData) {
      setMessage('Please upload an invoice file to send.');
      return;
    }
    setSending(true);
    setMessage(null);
    try {
      await api.ppe.sendInvoice({
        email: selectedClient.email,
        clientName: form.clientName,
        invoiceFilename: form.invoiceFile,
        invoiceBase64: form.invoiceFileData,
      });
      if (savedRecordId) {
        await updatePPEInvoiceRecord(savedRecordId, { emailStatus: 'SENT' });
      } else {
        await addPPEInvoiceRecord({
          clientId: form.clientId,
          clientName: form.clientName,
          issueDate: form.issueDate,
          invoiceFile: form.invoiceFile,
          invoiceFileData: form.invoiceFileData,
          emailStatus: 'SENT',
        });
      }
      navigateToUrl('/ppe');
      onBack();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send invoice.';
      setMessage(msg);
    } finally {
      setSending(false);
    }
  };

  const handleCancel = () => {
    navigateToUrl('/ppe');
    onBack();
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-[#e7ebf3]">
        <h2 className="text-[#0d121b] text-lg font-bold font-black">Add PPE Record</h2>
        <p className="text-[#4c669a] text-sm mt-1">Create a PPE invoice record for a client.</p>
      </div>

      <form className="p-6 space-y-5" onSubmit={e => e.preventDefault()}>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[#0d121b]">Client <span className="text-red-500">*</span></label>
          <select
            value={form.clientId}
            onChange={e => handleClientChange(e.target.value)}
            className={`w-full h-11 rounded-lg border px-4 text-sm text-[#0d121b] outline-none focus:border-[#2e4150] transition-colors cursor-pointer ${
              errors.clientId ? 'border-red-300 bg-red-50' : 'border-[#e7ebf3] bg-[#f6f6f8]'
            }`}
          >
            <option value="">Select a client…</option>
            {allClients.map(c => (
              <option key={c.id} value={c.id}>{c.name} — {c.contactPerson}</option>
            ))}
          </select>
          {errors.clientId && <p className="text-xs text-red-500">{errors.clientId}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[#0d121b]">Issue Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            value={form.issueDate}
            onChange={e => setForm(prev => ({ ...prev, issueDate: e.target.value }))}
            className={`w-full h-11 rounded-lg border px-4 text-sm text-[#0d121b] outline-none focus:border-[#2e4150] transition-colors ${
              errors.issueDate ? 'border-red-300 bg-red-50' : 'border-[#e7ebf3] bg-[#f6f6f8]'
            }`}
          />
          {errors.issueDate && <p className="text-xs text-red-500">{errors.issueDate}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[#0d121b]">Upload Invoice</label>
          <div
            className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
              form.invoiceFile ? 'border-[#2e4150]/40 bg-[#f2f6f9]' : 'border-[#e7ebf3] hover:border-[#2e4150]/40'
            }`}
            onClick={() => document.getElementById('ppe-invoice-file')?.click()}
          >
            <input
              id="ppe-invoice-file"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileUpload}
            />
            <span className="material-symbols-outlined text-[24px] text-[#4c669a]">cloud_upload</span>
            {form.invoiceFile ? (
              <p className="text-sm font-semibold text-[#0d121b]">{form.invoiceFile}</p>
            ) : (
              <p className="text-xs text-[#4c669a]">Click to upload PDF or document</p>
            )}
          </div>
          {errors.invoiceFile && <p className="text-xs text-red-500">{errors.invoiceFile}</p>}
        </div>

        {message && (
          <div className={`rounded-lg px-4 py-3 text-sm ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-[#2e4150] text-white text-sm font-bold px-6 h-10 cursor-pointer hover:bg-[#2e4150]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">save</span>
            )}
            Save PPE Record
          </button>
          <button
            type="button"
            onClick={handleSendInvoice}
            disabled={sending}
            className="flex items-center gap-2 rounded-full bg-amber-500 text-white text-sm font-bold px-6 h-10 cursor-pointer hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">mail</span>
            )}
            Send Invoice
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-2 rounded-full bg-[#e7ebf3] text-[#0d121b] text-sm font-bold px-6 h-10 cursor-pointer hover:bg-[#dce1eb] transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PPEAddRecord;
