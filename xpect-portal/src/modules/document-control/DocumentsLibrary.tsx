import React, { useState, useMemo } from 'react';
import { MOCK_DOCUMENTS, daysUntilDate } from './mockData';
import { PolicyDocument, DocCategory, DocStatus, ReviewFrequency } from './types';

interface Props {
  onSelectDoc: (id: string) => void;
  onCreateDoc: () => void;
  onNavigateApprovals: () => void;
  onNavigateReviews: () => void;
}

export const addedDocuments: PolicyDocument[] = [];

const CATEGORIES: DocCategory[] = [
  'Health & Safety', 'Environmental', 'Quality', 'Work Instructions', 'Forms', 'Insurance',
];

const DEPARTMENTS = ['Operations', 'Compliance', 'Quality Assurance', 'Finance', 'HR', 'Management'];

const OWNERS = [
  'Patricia Nwachukwu', 'Tom Briggs', 'Richard Hammond',
  'Amanda Foster', 'Claire Ashton', 'David Chen',
];

const statusBadge = (doc: PolicyDocument): { label: string; cls: string } => {
  if (doc.status === 'draft')    return { label: 'Draft',    cls: 'bg-gray-100 text-gray-600 border border-gray-200' };
  if (doc.status === 'rejected') return { label: 'Rejected', cls: 'bg-red-100 text-red-700 border border-red-200' };
  if (doc.status === 'pending')  return { label: 'Pending',  cls: 'bg-blue-100 text-blue-700 border border-blue-200' };
  if (doc.status === 'expired')  return { label: 'Expired',  cls: 'bg-red-100 text-red-700 border border-red-200' };
  const days = daysUntilDate(doc.nextReviewDate);
  if (days <= 0)  return { label: 'Overdue',     cls: 'bg-red-100 text-red-700 border border-red-200' };
  if (days <= 30) return { label: 'Review Soon', cls: 'bg-amber-100 text-amber-700 border border-amber-200' };
  return { label: 'Approved', cls: 'bg-green-100 text-green-700 border border-green-200' };
};

const formatDate = (d: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const today = () => new Date().toISOString().split('T')[0];

const addMonths = (date: string, months: number): string => {
  if (!date) return '';
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
};

const StatCard: React.FC<{ label: string; value: number; icon: string; iconBg: string }> = ({ label, value, icon, iconBg }) => (
  <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-3 p-2 flex items-start gap-3 flex-col">
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
    </div>
    <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide mt-0.5">{label}</p>
    <p className="text-xl sm:text-[30px] font-bold text-[#0d121b]">{value}</p>
  </div>
);

interface DocForm {
  title: string;
  category: DocCategory | '';
  department: string;
  owner: string;
  description: string;
  effectiveDate: string;
  reviewFrequencyMonths: ReviewFrequency;
  file: File | null;
}

const emptyForm: DocForm = {
  title: '', category: '', department: '', owner: '', description: '',
  effectiveDate: today(), reviewFrequencyMonths: 12, file: null,
};

const DocumentsLibrary: React.FC<Props> = ({ onSelectDoc, onCreateDoc: _onCreateDoc, onNavigateApprovals, onNavigateReviews }) => {
  void _onCreateDoc;
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState<DocCategory | ''>('');
  const [statusFilter, setStatus]   = useState<DocStatus | ''>('');
  const [docsList, setDocsList]     = useState<PolicyDocument[]>([...addedDocuments, ...MOCK_DOCUMENTS]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm]               = useState<DocForm>({ ...emptyForm });
  const [formErrors, setFormErrors]   = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg]   = useState('');

  const setField = (key: keyof DocForm, val: string | number | File | null) => {
    setForm(f => ({ ...f, [key]: val }));
    setFormErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const flash = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.title.trim())      e.title       = 'Document title is required.';
    if (!form.category)          e.category    = 'Category is required.';
    if (!form.department)        e.department  = 'Department is required.';
    if (!form.owner.trim())      e.owner       = 'Document owner is required.';
    if (!form.effectiveDate)     e.effectiveDate = 'Effective date is required.';
    return e;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    const nextNum = MOCK_DOCUMENTS.length + addedDocuments.length + 1;
    const todayStr = new Date().toISOString().split('T')[0];

    const newDoc: PolicyDocument = {
      id: `doc-${String(nextNum).padStart(3, '0')}`,
      title: form.title.trim(),
      category: form.category as DocCategory,
      owner: form.owner.trim(),
      department: form.department,
      version: '1.0',
      status: 'pending',
      effectiveDate: form.effectiveDate,
      lastReviewDate: form.effectiveDate,
      nextReviewDate: addMonths(form.effectiveDate, form.reviewFrequencyMonths),
      reviewFrequencyMonths: form.reviewFrequencyMonths,
      description: form.description.trim(),
      fileName: form.file ? form.file.name : undefined,
      fileSize: form.file
        ? (form.file.size < 1024 * 1024
            ? `${(form.file.size / 1024).toFixed(0)} KB`
            : `${(form.file.size / (1024 * 1024)).toFixed(1)} MB`)
        : undefined,
      submittedBy: form.owner.trim(),
      submittedDate: todayStr,
      versionHistory: [{
        version: '1.0',
        date: todayStr,
        uploadedBy: form.owner.trim(),
        notes: 'Initial submission — pending approval.',
        approvalStatus: 'pending',
      }],
    };

    addedDocuments.unshift(newDoc);
    setDocsList([newDoc, ...docsList]);
    setForm({ ...emptyForm });
    setFormErrors({});
    setIsModalOpen(false);
    flash(`"${newDoc.title}" created and submitted for approval.`);
  };

  const openModal = () => {
    setForm({ ...emptyForm });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const docs = useMemo(() => {
    let list = [...docsList];
    if (search)       list = list.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.owner.toLowerCase().includes(search.toLowerCase()));
    if (category)     list = list.filter(d => d.category === category);
    if (statusFilter) list = list.filter(d => d.status === statusFilter);
    return list;
  }, [search, category, statusFilter, docsList]);

  const stats = useMemo(() => ({
    total:    docsList.length,
    approved: docsList.filter(d => d.status === 'approved').length,
    pending:  docsList.filter(d => d.status === 'pending').length,
    overdue:  docsList.filter(d => {
      if (d.status !== 'approved') return false;
      return daysUntilDate(d.nextReviewDate) <= 30;
    }).length,
  }), [docsList]);

  const fieldCls = (key: string) =>
    `w-full px-3 py-2.5 bg-[#f6f7fb] border rounded-xl text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 ${
      formErrors[key] ? 'border-red-300 focus:ring-red-300/30' : 'border-[#e7ebf3]'
    }`;

  return (
    <div className="min-h-full bg-[#f6f7fb]">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] sm:px-8 px-4 sm:py-6 py-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[#0d121b]">Document Control</h1>
            <p className="text-base text-[#4c669a] mt-1">ISO 9001 Policy & Document Management</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onNavigateReviews}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">event</span>
              Review Calendar
            </button>
            <button
              onClick={onNavigateApprovals}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
              Approvals
              {stats.pending > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {stats.pending}
                </span>
              )}
            </button>
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Document
            </button>
          </div>
        </div>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="sm:mx-8 mx-4 mt-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-3 animate-in slide-in-from-top-2 duration-300">
          <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
          <p className="text-sm font-semibold text-green-700">{successMsg}</p>
        </div>
      )}

      <div className="sm:px-8 px-4 sm:py-6 py-3 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Documents"   value={stats.total}    icon="folder_managed" iconBg="bg-blue-50 text-blue-600" />
          <StatCard label="Approved"          value={stats.approved} icon="verified"        iconBg="bg-green-50 text-green-600" />
          <StatCard label="Pending Approval"  value={stats.pending}  icon="pending_actions" iconBg="bg-amber-50 text-amber-600" />
          <StatCard label="Review Overdue"    value={stats.overdue}  icon="warning"         iconBg="bg-red-50 text-red-600" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6b7a99]">search</span>
            <input type="text" placeholder="Search documents or owner…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value as DocCategory | '')}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 min-w-full sm:min-w-[160px]">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatus(e.target.value as DocStatus | '')}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 min-w-full sm:min-w-[140px]">
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
          {(search || category || statusFilter) && (
            <button onClick={() => { setSearch(''); setCategory(''); setStatus(''); }}
              className="text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">close</span>Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e7ebf3] bg-[#f6f7fb]">
                  {['Document Title', 'Category', 'Version', 'Owner', 'Approval Status', 'Last Review', 'Next Review Due', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {docs.length === 0
                  ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center">
                        <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">folder_open</span>
                        <p className="text-[#6b7a99] font-medium">No documents found</p>
                        <p className="text-xs text-[#6b7a99] mt-1">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  )
                  : docs.map(doc => {
                    const badge = statusBadge(doc);
                    return (
                      <tr key={doc.id} onClick={() => onSelectDoc(doc.id)} className="cursor-pointer hover:bg-[#f6f7fb] transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">description</span>
                            <span className="font-semibold text-[#0d121b] max-w-[220px] truncate">{doc.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 min-w-[150px]">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#f0f2f7] text-[#2e4150]">{doc.category}</span>
                        </td>
                        <td className="px-4 py-4 text-[#0d121b] font-mono font-medium">v{doc.version}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#2e4150] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {doc.owner.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[#0d121b]">{doc.owner}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
                        </td>
                        <td className="px-4 py-4 text-[#6b7a99] whitespace-nowrap">{formatDate(doc.lastReviewDate)}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {doc.nextReviewDate ? (
                            <span className={`text-sm font-medium ${
                              daysUntilDate(doc.nextReviewDate) <= 0 ? 'text-red-600' :
                              daysUntilDate(doc.nextReviewDate) <= 30 ? 'text-amber-600' : 'text-[#6b7a99]'
                            }`}>{formatDate(doc.nextReviewDate)}</span>
                          ) : <span className="text-[#6b7a99]">—</span>}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-semibold text-[#2e4150] hover:underline">View</span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {docs.length > 0 && (
            <div className="px-4 py-3 border-t border-[#e7ebf3] bg-[#f6f7fb] text-xs text-[#6b7a99]">
              Showing {docs.length} of {docsList.length} documents
            </div>
          )}
        </div>
      </div>

      {/* New Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7ebf3] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2e4150] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[18px]">post_add</span>
                </div>
                <h2 className="text-lg font-bold text-[#0d121b]">New Document</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f6f9] transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px] text-[#4c669a]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Document Title <span className="text-red-500">*</span></label>
                <input type="text" placeholder="e.g. Health & Safety Policy" value={form.title}
                  onChange={e => setField('title', e.target.value)} className={fieldCls('title')} />
                {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
              </div>

              {/* Category + Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Category <span className="text-red-500">*</span></label>
                  <select value={form.category} onChange={e => setField('category', e.target.value)} className={fieldCls('category')}>
                    <option value="">Select category…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {formErrors.category && <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Department <span className="text-red-500">*</span></label>
                  <select value={form.department} onChange={e => setField('department', e.target.value)} className={fieldCls('department')}>
                    <option value="">Select department…</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {formErrors.department && <p className="text-xs text-red-500 mt-1">{formErrors.department}</p>}
                </div>
              </div>

              {/* Owner */}
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Document Owner <span className="text-red-500">*</span></label>
                <select value={form.owner} onChange={e => setField('owner', e.target.value)} className={fieldCls('owner')}>
                  <option value="">Select owner…</option>
                  {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                {formErrors.owner && <p className="text-xs text-red-500 mt-1">{formErrors.owner}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Description</label>
                <textarea rows={3} placeholder="Brief description of this document's purpose…" value={form.description}
                  onChange={e => setField('description', e.target.value)} className={`${fieldCls('description')} resize-none`} />
              </div>

              {/* Effective Date + Review Frequency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Effective Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.effectiveDate} onChange={e => setField('effectiveDate', e.target.value)} className={fieldCls('effectiveDate')} />
                  {formErrors.effectiveDate && <p className="text-xs text-red-500 mt-1">{formErrors.effectiveDate}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Review Frequency</label>
                  <select value={form.reviewFrequencyMonths} onChange={e => setField('reviewFrequencyMonths', Number(e.target.value))} className={fieldCls('reviewFrequencyMonths')}>
                    <option value={6}>Every 6 months</option>
                    <option value={12}>Every 12 months</option>
                    <option value={24}>Every 24 months</option>
                  </select>
                </div>
              </div>

              {form.effectiveDate && (
                <div className="p-3 bg-[#f6f7fb] rounded-xl border border-[#e7ebf3] text-sm text-[#6b7a99]">
                  <span className="material-symbols-outlined text-[16px] align-middle mr-1">event_available</span>
                  Next review due: <span className="font-semibold text-[#0d121b]">
                    {new Date(addMonths(form.effectiveDate, form.reviewFrequencyMonths)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}

              {/* File Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-2">Upload Document</label>
                {form.file ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <span className="material-symbols-outlined text-green-500 text-[22px]">description</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0d121b] truncate">{form.file.name}</p>
                      <p className="text-[10px] text-[#6b7a99]">
                        {form.file.size < 1024 * 1024
                          ? `${(form.file.size / 1024).toFixed(0)} KB`
                          : `${(form.file.size / (1024 * 1024)).toFixed(1)} MB`}
                      </p>
                    </div>
                    <button type="button" onClick={() => setField('file', null)} className="text-[#6b7a99] hover:text-red-500 shrink-0">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="p-6 border-2 border-dashed border-[#e7ebf3] rounded-xl text-center hover:border-[#2e4150]/40 hover:bg-[#f6f7fb] transition-all">
                      <span className="material-symbols-outlined text-[32px] text-[#e7ebf3] block mb-1">upload_file</span>
                      <p className="text-sm font-semibold text-[#0d121b]">Click to select a file</p>
                      <p className="text-xs text-[#6b7a99] mt-0.5">PDF, Word, or Excel — max 25 MB</p>
                    </div>
                    <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" className="hidden"
                      onChange={e => { if (e.target.files?.[0]) setField('file', e.target.files[0]); e.target.value = ''; }} />
                  </label>
                )}
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-blue-500 shrink-0 mt-0.5">info</span>
                <span>New documents are submitted with <strong>Pending Approval</strong> status and will appear in the Approvals queue for review.</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e7ebf3] shrink-0">
              <button onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#6b7a99] bg-white hover:bg-[#f6f7fb] transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Submit for Approval
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsLibrary;
