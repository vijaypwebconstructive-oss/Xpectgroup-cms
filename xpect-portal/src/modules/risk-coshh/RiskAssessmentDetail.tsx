import React from 'react';
import { getRiskById, daysUntil } from './mockData';
import { RiskLevel, ApprovalStatus } from './types';

interface Props {
  riskId: string;
  onBack: () => void;
}

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const riskBadgeCls = (level: RiskLevel) => ({
  Low:    'bg-green-100 text-green-700 border border-green-200',
  Medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  High:   'bg-red-100 text-red-700 border border-red-200',
}[level]);

const riskDot = (level: RiskLevel) => ({
  Low: 'bg-green-500', Medium: 'bg-amber-500', High: 'bg-red-500',
}[level]);

const approvalBadge = (status: ApprovalStatus) => ({
  approved:     { cls: 'bg-green-100 text-green-700 border border-green-200',   label: 'Approved',     icon: 'verified' },
  pending:      { cls: 'bg-blue-100 text-blue-700 border border-blue-200',     label: 'Pending',      icon: 'pending' },
  not_approved: { cls: 'bg-red-100 text-red-700 border border-red-200',        label: 'Not Approved', icon: 'cancel' },
}[status]);

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-0.5">{label}</p>
    <p className="text-sm font-medium text-[#0d121b]">{value || '—'}</p>
  </div>
);

const RiskAssessmentDetail: React.FC<Props> = ({ riskId, onBack }) => {
  const ra = getRiskById(riskId);

  if (!ra) {
    return (
      <div className="min-h-full bg-[#f6f7fb] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">assignment</span>
          <p className="text-[#6b7a99]">Risk assessment not found</p>
          <button onClick={onBack} className="mt-4 text-sm text-[#2e4150] font-semibold hover:underline">← Back</button>
        </div>
      </div>
    );
  }

  const ab = approvalBadge(ra.approvalStatus);
  const daysToReview = daysUntil(ra.nextReviewDate);
  const isOverdue = daysToReview <= 0;

  return (
    <div className="min-h-full bg-[#f6f7fb]">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] px-8 py-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Risk Assessments
        </button>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-[24px]">health_and_safety</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[#0d121b]">{ra.title}</h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#f0f2f7] text-[#2e4150]">{ra.taskType}</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${riskBadgeCls(ra.riskLevel)}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${riskDot(ra.riskLevel)}`} />
                {ra.riskLevel} Risk
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${ab.cls}`}>
                <span className="material-symbols-outlined text-[14px]">{ab.icon}</span>
                {ab.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning banner — not approved or overdue */}
      {(ra.approvalStatus !== 'approved' || isOverdue) && (
        <div className={`mx-8 mt-5 flex items-center gap-3 rounded-xl px-5 py-3 border ${
          ra.approvalStatus === 'not_approved'
            ? 'bg-red-50 border-red-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <span className={`material-symbols-outlined text-[20px] ${ra.approvalStatus === 'not_approved' ? 'text-red-500' : 'text-amber-500'}`}>warning</span>
          <p className={`text-sm font-semibold ${ra.approvalStatus === 'not_approved' ? 'text-red-700' : 'text-amber-700'}`}>
            {ra.approvalStatus === 'not_approved'
              ? 'Assessment must be approved before work begins. Work should NOT proceed until this is resolved.'
              : isOverdue
                ? `Review overdue — this assessment was due for review on ${fmt(ra.nextReviewDate)}. Please review immediately.`
                : `Review due in ${daysToReview} day(s) — ${fmt(ra.nextReviewDate)}.`}
          </p>
        </div>
      )}

      <div className="px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — main sections */}
        <div className="lg:col-span-2 space-y-5">

          {/* A. Task Information */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
            <h2 className="text-base font-bold text-[#0d121b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">info</span>
              Task Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1">Task Description</p>
                <p className="text-sm text-[#0d121b] leading-relaxed">{ra.taskDescription}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#e7ebf3]">
                <div>
                  <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1">Work Area</p>
                  <p className="text-sm text-[#0d121b]">{ra.workArea}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1">Equipment Used</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ra.equipmentUsed.map((eq, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-xs font-medium bg-[#f0f2f7] text-[#2e4150]">{eq}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* B. Hazard Table */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e7ebf3] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">warning</span>
              <h2 className="text-base font-bold text-[#0d121b]">Hazard Identification & Controls</h2>
              <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-[#f0f2f7] text-[#2e4150]">{ra.hazards.length} hazards</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f6f7fb] border-b border-[#e7ebf3]">
                    {['Hazard', 'Possible Harm', 'Control Measures', 'Residual Risk'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ebf3]">
                  {ra.hazards.map((h, i) => (
                    <tr key={i} className="hover:bg-[#f6f7fb] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-amber-500 text-[16px] mt-0.5 shrink-0">warning_amber</span>
                          <span className="font-semibold text-[#0d121b]">{h.hazard}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#6b7a99] max-w-[160px]">{h.harm}</td>
                      <td className="px-4 py-3 text-[#0d121b] max-w-[220px] text-xs leading-relaxed">{h.control}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${riskBadgeCls(h.residualRisk)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${riskDot(h.residualRisk)}`} />
                          {h.residualRisk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* C. Required PPE */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
            <h2 className="text-base font-bold text-[#0d121b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">safety_check</span>
              Required PPE
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['Gloves', 'Safety shoes', 'Eye protection', 'Mask', 'Hi-vis vest', 'Apron', 'Hard hat', 'Safety harness'].map(item => {
                const required = ra.requiredPPE.includes(item);
                return (
                  <div key={item} className={`flex items-center gap-2.5 p-3 rounded-xl border ${
                    required ? 'border-green-200 bg-green-50' : 'border-[#e7ebf3] bg-[#f6f7fb] opacity-50'
                  }`}>
                    <span className={`material-symbols-outlined text-[18px] ${required ? 'text-green-600' : 'text-[#6b7a99]'}`}>
                      {required ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={`text-sm font-medium ${required ? 'text-green-800' : 'text-[#6b7a99]'}`}>{item}</span>
                  </div>
                );
              })}
            </div>
            {/* Custom PPE items not in the standard list */}
            {ra.requiredPPE.filter(p => !['Gloves', 'Safety shoes', 'Eye protection', 'Mask', 'Hi-vis vest', 'Apron', 'Hard hat', 'Safety harness'].includes(p)).map(extra => (
              <div key={extra} className="flex items-center gap-2.5 p-3 rounded-xl border border-green-200 bg-green-50 mt-2">
                <span className="material-symbols-outlined text-[18px] text-green-600">check_circle</span>
                <span className="text-sm font-medium text-green-800">{extra}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Approval panel */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
            <h2 className="text-base font-bold text-[#0d121b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">fact_check</span>
              Approval Panel
            </h2>
            <div className="space-y-4">
              <div className={`flex items-center gap-2.5 p-3 rounded-xl border ${ab.cls}`}>
                <span className={`material-symbols-outlined text-[20px]`}>{ab.icon}</span>
                <span className="text-sm font-bold">{ab.label}</span>
              </div>

              <div className="space-y-3 pt-2">
                <InfoRow label="Assessor" value={ra.createdBy} />
                {ra.approvedBy && <InfoRow label="Approved By" value={ra.approvedBy} />}
                {ra.approvalDate && <InfoRow label="Approval Date" value={fmt(ra.approvalDate)} />}
                <InfoRow label="Last Review" value={fmt(ra.lastReviewDate)} />
                <InfoRow label="Next Review Due" value={fmt(ra.nextReviewDate)} />
              </div>

              {ra.approvalStatus !== 'approved' && (
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors mt-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Approve Assessment
                </button>
              )}
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#e7ebf3] text-[#2e4150] text-sm font-semibold bg-white hover:bg-[#f6f7fb] transition-colors">
                <span className="material-symbols-outlined text-[18px]">print</span>
                Print / Export PDF
              </button>
            </div>
          </div>

          {/* Review timeline */}
          <div className={`rounded-xl border shadow-sm p-5 ${
            isOverdue ? 'bg-red-50 border-red-200' : daysToReview <= 30 ? 'bg-amber-50 border-amber-200' : 'bg-white border-[#e7ebf3]'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined text-[18px] ${isOverdue ? 'text-red-500' : daysToReview <= 30 ? 'text-amber-500' : 'text-[#6b7a99]'}`}>event</span>
              <p className="text-sm font-bold text-[#0d121b]">Review Schedule</p>
            </div>
            <p className={`text-base font-bold ${isOverdue ? 'text-red-600' : daysToReview <= 30 ? 'text-amber-600' : 'text-[#0d121b]'}`}>
              {fmt(ra.nextReviewDate)}
            </p>
            <p className="text-xs text-[#6b7a99] mt-1">
              {isOverdue ? `${Math.abs(daysToReview)} day(s) overdue` : `In ${daysToReview} day(s)`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessmentDetail;
