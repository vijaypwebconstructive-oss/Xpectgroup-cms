import React, { useState, useMemo } from 'react';
import { useRiskCoshh } from '../../context/RiskCoshhContext';
import { RiskAssessment } from './types';

const SECTORS = ['Healthcare', 'Office', 'Schools', 'Construction', 'Hospitality'] as const;
const SECTOR_OPTIONS = ['All Sectors', ...SECTORS] as const;
type SectorFilter = (typeof SECTOR_OPTIONS)[number];

interface Props {
  onSelectRisk: (id: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const daysFromNow = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// ── Stat card ─────────────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: number; icon: string; bg: string }> = ({ label, value, icon, bg }) => (
  <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-5 p-2 flex flex-col items-start gap-4">
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
    </div>
    <div>
      <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">{label}</p>
      <p className="text-2xl sm:text-[30px] font-bold text-[#0d121b]">{value}</p>
    </div>
  </div>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <tr className="animate-pulse">
    {[...Array(4)].map((_, i) => (
      <td key={i} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-3/4" /></td>
    ))}
  </tr>
);

// ── Main ──────────────────────────────────────────────────────────────────────

const RiskAssessmentsList: React.FC<Props> = ({ onSelectRisk }) => {
  const { riskAssessments, riskLoading, riskError, addRiskAssessment, refreshRiskAssessments } = useRiskCoshh();
  const [search, setSearch]       = useState('');
  const [sectorFilter, setSector] = useState<SectorFilter>('All Sectors');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    let list = [...riskAssessments];
    if (search) list = list.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.taskType.toLowerCase().includes(search.toLowerCase()));
    if (sectorFilter !== 'All Sectors') list = list.filter(r => r.sector === sectorFilter);
    return list;
  }, [riskAssessments, search, sectorFilter]);

  const stats = useMemo(() => {
    const all = [...riskAssessments];
    const total = all.length;
    const bySector: Record<string, number> = {};
    for (const r of all) {
      const s = r.sector ?? 'Unassigned';
      bySector[s] = (bySector[s] ?? 0) + 1;
    }
    return { total, bySector };
  }, [riskAssessments]);

  return (
    <div className="min-h-full bg-[#f6f7fb] w-screen sm:max-w-full">

      {/* Header */}
      <div className="sm:px-8 px-4 sm:py-6 py-3">
        <div className="flex items-center justify-between flex-col sm:flex-row gap-4 ">
          <div className='width-[50%]'>
            <h1 className="text-2xl font-bold text-[#0d121b]">Risk Assessment</h1>
            <p className="text-base text-[#4c669a] mt-1">ISO 45001 Safety Management System</p>
          </div>
          <div className="flex justify-end gap-2 flex-col sm:flex-row ">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Assessment
            </button>
          </div>
        </div>
      </div>

      <div className="sm:px-8 px-4 sm:py-6 py-3 space-y-6">

        {/* Stats */}
        {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Assessments" value={stats.total} icon="assignment" bg="bg-blue-50 text-blue-600" />
          {Object.entries(stats.bySector).slice(0, 3).map(([sector, count]) => (
            <StatCard key={sector} label={sector} value={count} icon="business" bg="bg-slate-50 text-slate-600" />
          ))}
        </div> */}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6b7a99]">search</span>
            <input type="text" placeholder="Search assessments or task type…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20" />
          </div>
          <select value={sectorFilter} onChange={e => setSector(e.target.value as SectorFilter)}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 sm:min-w-[160px] min-w-full">
            {SECTOR_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {(search || sectorFilter !== 'All Sectors') && (
            <button onClick={() => { setSearch(''); setSector('All Sectors'); }}
              className="text-sm text-[#6b7a99] hover:text-[#0d121b] flex items-center gap-1">
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
                  {['Title', 'Sector', 'Task Type', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {riskLoading
                  ? [...Array(4)].map((_, i) => <Skeleton key={i} />)
                  : riskError
                    ? (
                      <tr><td colSpan={4} className="px-4 py-16 text-center">
                        <span className="material-symbols-outlined text-red-500 text-[48px] block mb-3">error</span>
                        <p className="text-red-600 font-medium">{riskError}</p>
                      </td></tr>
                    )
                    : filtered.length === 0
                    ? (
                      <tr><td colSpan={4} className="px-4 py-16 text-center">
                        <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">assignment</span>
                        <p className="text-[#6b7a99] font-medium">No risk assessments found</p>
                      </td></tr>
                    )
                    : filtered.map(ra => (
                        <tr key={ra.id} onClick={() => onSelectRisk(ra.id)}
                          className="cursor-pointer hover:bg-[#f6f7fb] transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">assignment</span>
                              <span className="font-semibold text-[#0d121b] max-w-[200px] truncate">{ra.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#f0f2f7] text-[#2e4150]">{ra.sector ?? '—'}</span>
                          </td>
                          <td className="px-4 py-4 min-w-[150px]">
                            <span className="px-2.5 py-1 rounded-full text-xs min-w-fit display-inline-block font-medium bg-[#f0f2f7] text-[#2e4150]">{ra.taskType}</span>
                          </td>
                          <td className="px-4 py-4 text-left">
                            <span className="text-sm font-semibold text-[#2e4150] hover:underline">View</span>
                          </td>
                        </tr>
                      ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-[#e7ebf3] bg-[#f6f7fb] text-xs text-[#6b7a99]">
              Showing {filtered.length} of {riskAssessments.length} assessments
            </div>
          )}
        </div>
      </div>

      {/* New Assessment Modal */}
      {showAddModal && (
        <AddAssessmentModal
          onClose={() => setShowAddModal(false)}
          onSaved={async () => {
            setShowAddModal(false);
            await refreshRiskAssessments();
          }}
        />
      )}
    </div>
  );
};

// ── Add Assessment Modal ─────────────────────────────────────────────────────

interface AddModalProps {
  onClose: () => void;
  onSaved: () => void;
}

const AddAssessmentModal: React.FC<AddModalProps> = ({ onClose, onSaved }) => {
  const { addRiskAssessment } = useRiskCoshh();
  const [title, setTitle] = useState('');
  const [sector, setSector] = useState('');
  const [taskType, setTaskType] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [workArea, setWorkArea] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await addRiskAssessment({
        title: title.trim(),
        sector: sector.trim() || undefined,
        taskType: taskType.trim() || 'General',
        riskLevel: 'Low',
        createdBy: '—',
        lastReviewDate: daysFromNow(0),
        nextReviewDate: daysFromNow(365),
        approvalStatus: 'approved',
        taskDescription: taskDescription.trim() || '—',
        equipmentUsed: [],
        workArea: workArea.trim() || '—',
        hazards: [],
        requiredPPE: [],
      });
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[#e7ebf3] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0d121b]">New Risk Assessment</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-[#6b7a99] hover:bg-[#f6f7fb] hover:text-[#0d121b]">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full px-3 py-2 rounded-lg border border-[#e7ebf3] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20"
              placeholder="e.g. Office Cleaning Risk Assessment" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1">Sector</label>
            <input value={sector} onChange={e => setSector(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#e7ebf3] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20"
              placeholder="e.g. Healthcare, Office, Schools" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1">Task Type</label>
            <input value={taskType} onChange={e => setTaskType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#e7ebf3] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20"
              placeholder="e.g. Routine Cleaning, Deep Clean" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1">Task Description</label>
            <textarea value={taskDescription} onChange={e => setTaskDescription(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-[#e7ebf3] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 resize-none"
              placeholder="Brief description of the task" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1">Work Area</label>
            <input value={workArea} onChange={e => setWorkArea(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#e7ebf3] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20"
              placeholder="e.g. Office floors, reception" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#e7ebf3] text-[#2e4150] text-sm font-semibold hover:bg-[#f6f7fb]">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RiskAssessmentsList;
