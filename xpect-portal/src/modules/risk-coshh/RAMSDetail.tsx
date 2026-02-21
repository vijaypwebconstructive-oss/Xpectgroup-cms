import React from 'react';
import { getRAMSById, getRiskById } from './mockData';
import { RAMSStatus } from './types';

interface Props {
  ramsId: string;
  onBack: () => void;
  onSelectRisk: (id: string) => void;
}

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const statusBadge = (status: RAMSStatus) => ({
  approved:        { cls: 'bg-green-100 text-green-700 border border-green-200',  label: 'Approved',        icon: 'verified' },
  draft:           { cls: 'bg-gray-100 text-gray-600 border border-gray-200',     label: 'Draft',           icon: 'draft' },
  review_required: { cls: 'bg-amber-100 text-amber-700 border border-amber-200',  label: 'Review Required', icon: 'warning' },
}[status]);

const RAMSDetail: React.FC<Props> = ({ ramsId, onBack, onSelectRisk }) => {
  const rams = getRAMSById(ramsId);

  if (!rams) {
    return (
      <div className="min-h-full bg-[#f6f7fb] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">assignment</span>
          <p className="text-[#6b7a99]">RAMS document not found</p>
          <button onClick={onBack} className="mt-4 text-sm text-[#2e4150] font-semibold hover:underline">← Back</button>
        </div>
      </div>
    );
  }

  const sb = statusBadge(rams.status);

  return (
    <div className="min-h-full bg-[#f6f7fb]">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] px-8 py-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to RAMS
        </button>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-[22px]">assignment</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[#0d121b]">{rams.siteName}</h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-sm text-[#6b7a99]">{rams.clientName}</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sb.cls}`}>
                <span className="material-symbols-outlined text-[14px]">{sb.icon}</span>
                {sb.label}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors">
              <span className="material-symbols-outlined text-[18px]">print</span>
              Print
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Review required warning */}
      {rams.status === 'review_required' && (
        <div className="mx-8 mt-5 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3">
          <span className="material-symbols-outlined text-amber-500 text-[20px]">warning</span>
          <p className="text-sm font-semibold text-amber-700">This RAMS document requires review before it can be used. Please update and re-approve.</p>
        </div>
      )}

      <div className="px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left */}
        <div className="lg:col-span-2 space-y-5">

          {/* Site information */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
            <h2 className="text-base font-bold text-[#0d121b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">location_on</span>
              Site Information
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Site Name',      value: rams.siteName },
                { label: 'Client',         value: rams.clientName },
                { label: 'Supervisor',     value: rams.supervisor },
                { label: 'Working Hours',  value: rams.workingHours },
                { label: 'Last Updated',   value: fmt(rams.lastUpdated) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-[#0d121b]">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#e7ebf3]">
              <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Work Description</p>
              <p className="text-sm text-[#0d121b] leading-relaxed">{rams.description}</p>
            </div>
          </div>

          {/* Step-by-step method */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
            <h2 className="text-base font-bold text-[#0d121b] mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">format_list_numbered</span>
              Step-by-Step Work Method
            </h2>
            <div className="space-y-3">
              {rams.workMethod.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-[#2e4150] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-[#0d121b] leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency procedures */}
          <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-[#0d121b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-red-500">emergency</span>
              Emergency Procedures
            </h2>
            <div className="space-y-3">
              {rams.emergencyProcedures.map((proc, i) => {
                const [heading, ...rest] = proc.split(':');
                return (
                  <div key={i} className="flex gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0 mt-0.5">priority_high</span>
                    <div>
                      <span className="text-sm font-bold text-red-700">{heading}:</span>
                      <span className="text-sm text-[#0d121b]"> {rest.join(':')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-5">

          {/* Upload placeholder */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
            <h2 className="text-base font-bold text-[#0d121b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">upload_file</span>
              Signed RAMS Document
            </h2>
            {rams.signedCopyAvailable ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <span className="material-symbols-outlined text-green-500 text-[22px]">check_circle</span>
                <div>
                  <p className="text-sm font-semibold text-[#0d121b]">Signed copy available</p>
                  <p className="text-xs text-[#6b7a99]">RAMS-{rams.id}.pdf</p>
                </div>
              </div>
            ) : (
              <div className="p-6 border-2 border-dashed border-[#e7ebf3] rounded-xl text-center">
                <span className="material-symbols-outlined text-[32px] text-[#e7ebf3] block mb-2">upload_file</span>
                <p className="text-sm font-semibold text-[#0d121b]">No signed copy</p>
                <p className="text-xs text-[#6b7a99] mt-1">Upload signed RAMS PDF</p>
                <button className="mt-3 text-sm font-semibold text-[#2e4150] hover:underline">Upload File</button>
              </div>
            )}
          </div>

          {/* Linked Risk Assessments */}
          {rams.linkedRiskAssessmentIds.length > 0 && (
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
              <h2 className="text-base font-bold text-[#0d121b] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">link</span>
                Linked Risk Assessments
              </h2>
              <div className="space-y-2">
                {rams.linkedRiskAssessmentIds.map(raId => {
                  const ra = getRiskById(raId);
                  if (!ra) return null;
                  return (
                    <button key={raId} onClick={() => onSelectRisk(raId)}
                      className="w-full flex items-center gap-3 p-3 bg-[#f6f7fb] rounded-xl border border-[#e7ebf3] hover:border-[#2e4150]/30 transition-colors text-left group">
                      <span className="material-symbols-outlined text-[16px] text-[#6b7a99]">assignment</span>
                      <span className="flex-1 text-sm font-semibold text-[#0d121b] group-hover:text-[#2e4150] truncate">{ra.title}</span>
                      <span className="material-symbols-outlined text-[16px] text-[#6b7a99]">chevron_right</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RAMSDetail;
