import React, { useState } from 'react';
import { Industry } from './types';
import { useClientsSites, contractHealth, daysUntil } from '../../context/ClientsSitesContext';

interface ClientsListProps {
  onSelectClient:       (clientId: string) => void;
  onNavigateSites:      () => void;
  onNavigateAllocation: () => void;
}

const STATUS_BADGE = {
  Valid:    'bg-green-100 text-green-700 border border-green-200',
  Expiring: 'bg-amber-100 text-amber-700 border border-amber-200',
  Expired:  'bg-red-100 text-red-700 border border-red-200',
};
const STATUS_LABEL = { Valid: 'Active', Expiring: 'Expiring Soon', Expired: 'Expired' };

const INDUSTRIES: Industry[] = ['Office', 'School', 'Healthcare', 'Construction', 'Retail', 'Hospitality'];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });

const today = () => new Date().toISOString().split('T')[0];

// Map Add Client form doc keys to ClientDetail DOC_DEFINITIONS keys
const FORM_TO_DOC_KEY: Record<string, string> = {
  contractDoc: 'contract',
  insuranceCert: 'insurance',
  riskAssessment: 'risk',
  slaDocument: 'sla',
  healthSafety: 'healthSafety',
  gdprAgreement: 'gdpr',
};

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('Failed to read file'));
    r.readAsDataURL(file);
  });

interface ClientForm {
  name: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  contractStart: string;
  contractEnd: string;
  insuranceExpiry: string;
  notes: string;
  contractDoc: string;
  insuranceCert: string;
  riskAssessment: string;
  slaDocument: string;
  healthSafety: string;
  gdprAgreement: string;
}

const emptyForm: ClientForm = {
  name: '',
  industry: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  contractStart: today(),
  contractEnd: '',
  insuranceExpiry: '',
  notes: '',
  contractDoc: '',
  insuranceCert: '',
  riskAssessment: '',
  slaDocument: '',
  healthSafety: '',
  gdprAgreement: '',
};

const ClientsList: React.FC<ClientsListProps> = ({ onSelectClient }) => {
  const { clients, sites, assignments, loading, error, addClient } = useClientsSites();
  const [search, setSearch]                   = useState('');
  const [industryFilter, setIndustryFilter]   = useState('');
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [form, setForm]                       = useState<ClientForm>(emptyForm);
  const [formDocFiles, setFormDocFiles]       = useState<Record<string, File>>({});
  const [formErrors, setFormErrors]           = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg]           = useState('');
  const [saving, setSaving]                   = useState(false);

  const setField = (k: keyof ClientForm, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (formErrors[k]) setFormErrors(prev => { const n = { ...prev }; delete n[k]; return n; });
  };

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Company name is required.';
    if (!form.industry.trim()) e.industry = 'Type is required.';
    if (!form.contactPerson.trim()) e.contactPerson = 'Contact person is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.phone.trim()) e.phone = 'Phone is required.';
    if (!form.address.trim()) e.address = 'Address is required.';
    if (!form.contractStart) e.contractStart = 'Contract start date is required.';
    if (!form.contractEnd) e.contractEnd = 'Contract end date is required.';
    else if (form.contractStart && form.contractEnd < form.contractStart) e.contractEnd = 'Contract end must be after start date.';
    if (!form.insuranceExpiry) e.insuranceExpiry = 'Insurance expiry is required.';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    setSaving(true);
    try {
      const documents: { key: string; name: string; size: number; type: string; uploadedAt: string; dataUrl: string }[] = [];
      for (const [formKey, file] of Object.entries(formDocFiles)) {
        const docKey = FORM_TO_DOC_KEY[formKey];
        if (!docKey || !file) continue;
        try {
          const dataUrl = await fileToDataUrl(file);
          documents.push({
            key: docKey,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            dataUrl,
          });
        } catch {
          // Skip file if conversion fails
        }
      }
      const newClient = await addClient({
        name: form.name.trim(),
        industry: form.industry.trim(),
        contactPerson: form.contactPerson.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        contractStart: form.contractStart,
        contractEnd: form.contractEnd,
        insuranceExpiry: form.insuranceExpiry,
        address: form.address.trim(),
        notes: form.notes.trim() || undefined,
        documents: documents.length ? documents : undefined,
      });
      setForm(emptyForm);
      setFormDocFiles({});
      setIsModalOpen(false);
      flash(`Client "${newClient.name}" added successfully.`);
    } catch {
      setFormErrors({ submit: 'Failed to save client. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const openModal = () => {
    setForm(emptyForm);
    setFormDocFiles({});
    setFormErrors({});
    setIsModalOpen(true);
  };

  const enriched = clients.map(c => ({
    ...c,
    health:      contractHealth(c),
    siteCount:   sites.filter(s => s.clientId === c.id).length,
    workerCount: assignments.filter(a => a.clientId === c.id).length,
    daysLeft:    Math.min(daysUntil(c.contractEnd), daysUntil(c.insuranceExpiry)),
  }));

  const filtered = enriched.filter(c => {
    const q = search.toLowerCase();
    return (
      (!q || c.name.toLowerCase().includes(q) || c.contactPerson.toLowerCase().includes(q)) &&
      (!industryFilter || c.industry === industryFilter)
    );
  });

  const totalClients  = clients.length;
  const totalSites    = sites.length;
  const expiringSoon  = enriched.filter(c => c.health === 'Expiring').length;
  const nonCompliant  = assignments.filter(a => a.complianceStatus === 'Non-Compliant').length;

  const docField = (label: string, key: keyof ClientForm, icon: string) => (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-[#c7d2e0] bg-[#fafbfd] hover:border-[#2e4150]/40 transition-colors">
      <span className="material-symbols-outlined text-[22px] text-[#4c669a]">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0d121b]">{label}</p>
        {form[key] ? (
          <p className="text-xs text-green-600 font-semibold truncate">{form[key]}</p>
        ) : (
          <p className="text-xs text-[#4c669a]">No file selected</p>
        )}
      </div>
      <label className="px-3 py-1.5 rounded-lg bg-[#f2f6f9] text-[#4c669a] text-xs font-bold hover:bg-[#e7ebf3] transition-colors cursor-pointer">
        Browse
        <input
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              setField(key, file.name);
              setFormDocFiles(prev => ({ ...prev, [key]: file }));
            }
            e.target.value = '';
          }}
        />
      </label>
      {form[key] && (
        <button
          type="button"
          onClick={() => { setField(key, ''); setFormDocFiles(prev => { const n = { ...prev }; delete n[key]; return n; }); }}
          className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-screen sm:w-full sm:max-w-full">

      {/* Success toast */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 animate-in fade-in duration-300">
          <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
          <p className="text-green-800 text-sm font-bold">{successMsg}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Clients',  value: totalClients, icon: 'handshake',     iconColor: 'text-[#2e4150]' },
          { label: 'Active Sites',   value: totalSites,   icon: 'location_city', iconColor: 'text-[#2e4150]' },
          { label: 'Expiring Soon',  value: expiringSoon, icon: 'schedule',      iconColor: 'text-amber-500' },
          { label: 'Non-Compliant',  value: nonCompliant, icon: 'warning',       iconColor: 'text-red-600'   },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm sm:p-4 p-3 flex flex-col gap-3 items-start">
                          <span className={`material-symbols-outlined text-[22px] sm:text-[30px] p-2 w-fit rounded-[12px] sm:p-3 bg-[#f2f6f9] ${s.iconColor}`}>{s.icon}</span>
                          <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">{s.label}</p>
                          <p className=" font-bold text-[#000] sm:text-[30px] text-xl">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">

        {/* Search + filter bar */}
        <div className="flex items-start gap-3 sm:px-5 px-3 sm:py-4 py-3 border-b border-[#e7ebf3] flex-wrap">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            <div className="flex items-center h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 flex-1 min-w-[180px] focus-within:border-[#2e4150]/40 transition-all">
              <span className="material-symbols-outlined text-[#9aa5be] text-[18px] mr-2">search</span>
              <input
                className="bg-transparent border-none text-[#0d121b] placeholder:text-[#9aa5be] text-sm outline-none w-full"
                placeholder="Search company name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              value={industryFilter}
              onChange={e => setIndustryFilter(e.target.value)}
              className="h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 text-sm text-[#0d121b] outline-none cursor-pointer font-semibold"
            >
              <option value="">All Industries</option>
              {INDUSTRIES.map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 rounded-full bg-[#2e4150] text-white text-xs font-bold hover:bg-[#2e4150]/90 transition-all px-4 h-9 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add Client
          </button>
        </div>

        {/* Table header with record count */}
        <div className="px-5 py-3 border-b border-[#e7ebf3] flex items-center gap-3">
          <h2 className="text-[#0d121b] text-sm sm:text-base font-black font-semibold">Client Records</h2>
          <span className="bg-[#f2f6f9] text-[#4c669a] text-xs font-bold px-2.5 py-1 rounded-full">{filtered.length} records</span>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="px-5 py-14 text-center">
            <span className="material-symbols-outlined text-[#4c669a] text-4xl animate-spin block mb-2">progress_activity</span>
            <p className="text-[#4c669a] text-sm font-semibold">Loading clients…</p>
          </div>
        )}
        {error && !loading && (
          <div className="px-5 py-14 text-center">
            <span className="material-symbols-outlined text-red-500 text-[48px] block mb-2">error</span>
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          </div>
        )}
        {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-[#e7ebf3] bg-[#f8fafc]">
                <th className="text-left px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Client Company Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Industry Type</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Total Sites</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Active Workers</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Contract End</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Compliance Status</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7ebf3]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <span className="material-symbols-outlined text-[#c7c7c7] text-5xl block mb-2">search_off</span>
                    <p className="text-[#4c669a] text-sm font-semibold">No clients match your search</p>
                  </td>
                </tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="hover:bg-[#f8fafc] transition-colors group">
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-[#0d121b]">{c.name}</p>
                    <p className="text-xs text-[#4c669a] mt-0.5">{c.contactPerson}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#0d121b] font-medium">{c.industry}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#0d121b]">{c.siteCount}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#0d121b]">{c.workerCount}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#0d121b] whitespace-nowrap">
                    {formatDate(c.contractEnd)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold font-black uppercase tracking-wide ${STATUS_BADGE[c.health]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.health === 'Valid' ? 'bg-green-500' : c.health === 'Expiring' ? 'bg-amber-400' : 'bg-red-500'}`} />
                      {STATUS_LABEL[c.health]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">
                    <button
                      onClick={() => onSelectClient(c.id)}
                      className="text-[#4c669a] text-xs font-black capitalize tracking-wide transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e7ebf3] bg-[#f8fafc] flex items-center justify-between">
          <p className="text-xs text-[#4c669a]">
            Showing <span className="font-bold text-[#0d121b]">{filtered.length}</span> of <span className="font-bold text-[#0d121b]">{clients.length}</span> clients
          </p>
        </div>
      </div>

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7ebf3] sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px] text-[#2e4150]">domain_add</span>
                <h2 className="text-lg font-bold text-[#0d121b]">Add New Client</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f6f9] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] text-[#4c669a]">close</span>
              </button>
            </div>

            {/* Form body */}
            <div className="px-6 py-5 space-y-5">

              {/* Section: Company Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#2e4150]">business</span>
                  <h3 className="text-sm font-bold text-[#0d121b] uppercase tracking-wide">Company Details</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0d121b] mb-1">Company Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter company name"
                    value={form.name}
                    onChange={e => setField('name', e.target.value)}
                    className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none ${formErrors.name ? 'border-red-400' : 'border-[#c7d2e0]'}`}
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">Type <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Enter business type (e.g. Healthcare, Office, Retail)"
                      value={form.industry}
                      onChange={e => setField('industry', e.target.value)}
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none ${formErrors.industry ? 'border-red-400' : 'border-[#c7d2e0]'}`}
                    />
                    {formErrors.industry && <p className="text-red-500 text-xs mt-1">{formErrors.industry}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">Phone <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      placeholder="+44 xxx xxx xxxx"
                      value={form.phone}
                      onChange={e => setField('phone', e.target.value)}
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none ${formErrors.phone ? 'border-red-400' : 'border-[#c7d2e0]'}`}
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0d121b] mb-1">Address <span className="text-red-500">*</span></label>
                  <textarea
                    rows={2}
                    placeholder="Full company address"
                    value={form.address}
                    onChange={e => setField('address', e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-sm text-[#0d121b] bg-white outline-none resize-none ${formErrors.address ? 'border-red-400' : 'border-[#c7d2e0]'}`}
                  />
                  {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                </div>
              </div>

              <hr className="border-[#e7ebf3]" />

              {/* Section: Contact Person */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#2e4150]">person</span>
                  <h3 className="text-sm font-bold text-[#0d121b] uppercase tracking-wide">Contact Person</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">Contact Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Full name"
                      value={form.contactPerson}
                      onChange={e => setField('contactPerson', e.target.value)}
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none ${formErrors.contactPerson ? 'border-red-400' : 'border-[#c7d2e0]'}`}
                    />
                    {formErrors.contactPerson && <p className="text-red-500 text-xs mt-1">{formErrors.contactPerson}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      placeholder="email@company.co.uk"
                      value={form.email}
                      onChange={e => setField('email', e.target.value)}
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none ${formErrors.email ? 'border-red-400' : 'border-[#c7d2e0]'}`}
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>
                </div>
              </div>

              <hr className="border-[#e7ebf3]" />

              {/* Section: Contract & Insurance */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#2e4150]">description</span>
                  <h3 className="text-sm font-bold text-[#0d121b] uppercase tracking-wide">Contract & Insurance</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">Contract Start <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={form.contractStart}
                      onChange={e => setField('contractStart', e.target.value)}
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none cursor-pointer ${formErrors.contractStart ? 'border-red-400' : 'border-[#c7d2e0]'}`}
                    />
                    {formErrors.contractStart && <p className="text-red-500 text-xs mt-1">{formErrors.contractStart}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">Contract End <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={form.contractEnd}
                      onChange={e => setField('contractEnd', e.target.value)}
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none cursor-pointer ${formErrors.contractEnd ? 'border-red-400' : 'border-[#c7d2e0]'}`}
                    />
                    {formErrors.contractEnd && <p className="text-red-500 text-xs mt-1">{formErrors.contractEnd}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0d121b] mb-1">Insurance Expiry <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={form.insuranceExpiry}
                      onChange={e => setField('insuranceExpiry', e.target.value)}
                      className={`w-full h-10 rounded-xl border px-3 text-sm text-[#0d121b] bg-white outline-none cursor-pointer ${formErrors.insuranceExpiry ? 'border-red-400' : 'border-[#c7d2e0]'}`}
                    />
                    {formErrors.insuranceExpiry && <p className="text-red-500 text-xs mt-1">{formErrors.insuranceExpiry}</p>}
                  </div>
                </div>
              </div>

              <hr className="border-[#e7ebf3]" />

              {/* Section: Documents */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#2e4150]">folder_open</span>
                  <h3 className="text-sm font-bold text-[#0d121b] uppercase tracking-wide">Client Documents</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {docField('Contract Document', 'contractDoc', 'article')}
                  {docField('Insurance Certificate', 'insuranceCert', 'verified_user')}
                  {docField('Risk Assessment', 'riskAssessment', 'assignment_late')}
                  {docField('SLA Document', 'slaDocument', 'handshake')}
                  {docField('Health & Safety Policy', 'healthSafety', 'health_and_safety')}
                  {docField('GDPR / Data Agreement', 'gdprAgreement', 'shield')}
                </div>
              </div>

              <hr className="border-[#e7ebf3]" />

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-[#0d121b] mb-1">Notes</label>
                <textarea
                  rows={3}
                  placeholder="Any additional notes or instructions…"
                  value={form.notes}
                  onChange={e => setField('notes', e.target.value)}
                  className="w-full rounded-xl border border-[#c7d2e0] px-3 py-2 text-sm text-[#0d121b] bg-white outline-none resize-none"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e7ebf3] sticky bottom-0 bg-white rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-full border border-[#c7d2e0] text-[#4c669a] text-sm font-bold hover:bg-[#f2f6f9] transition-all cursor-pointer"
              >
                Cancel
              </button>
              {formErrors.submit && <p className="text-red-500 text-xs mr-auto">{formErrors.submit}</p>}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                {saving ? 'Saving…' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsList;
