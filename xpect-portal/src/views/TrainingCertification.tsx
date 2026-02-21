import React, { useState } from 'react';
import { AppView, Cleaner } from '../types';

interface TrainingCertificationProps {
  onNavigate: (view: AppView, cleaner?: Cleaner) => void;
}

type StatusFilter = 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'NOT_STARTED';

interface TraineeRecord {
  id: string;
  name: string;
  location: string;
  initials: string;
  avatarColor: string;
  course: string;
  courseIcon: string;
  progress: number;
  dueDate: string;
  certName: string;
}

const DUMMY_TRAINEES: TraineeRecord[] = [
  {
    id: '1',
    name: 'James Thornton',
    location: 'Manchester North',
    initials: 'JT',
    avatarColor: 'bg-blue-500',
    course: 'Level 2 Chemical Handling',
    courseIcon: 'science',
    progress: 92,
    dueDate: '2026-03-10',
    certName: 'Chemical Handling Certificate',
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    location: 'Birmingham Central',
    initials: 'SM',
    avatarColor: 'bg-pink-500',
    course: 'Standard Operating Procedures',
    courseIcon: 'menu_book',
    progress: 100,
    dueDate: '2026-01-15',
    certName: 'SOP Compliance Certificate',
  },
  {
    id: '3',
    name: 'David Okafor',
    location: 'London South',
    initials: 'DO',
    avatarColor: 'bg-emerald-500',
    course: 'Fire Safety Awareness',
    courseIcon: 'local_fire_department',
    progress: 45,
    dueDate: '2026-04-20',
    certName: 'Fire Safety Certificate',
  },
  {
    id: '4',
    name: 'Emma Clarke',
    location: 'Leeds West',
    initials: 'EC',
    avatarColor: 'bg-violet-500',
    course: 'COSHH Awareness',
    courseIcon: 'health_and_safety',
    progress: 88,
    dueDate: '2026-03-25',
    certName: 'COSHH Awareness Certificate',
  },
  {
    id: '5',
    name: 'Ryan Patel',
    location: 'Bristol East',
    initials: 'RP',
    avatarColor: 'bg-orange-500',
    course: 'Manual Handling Training',
    courseIcon: 'engineering',
    progress: 0,
    dueDate: '2026-05-01',
    certName: 'Manual Handling Certificate',
  },
  {
    id: '6',
    name: 'Priya Singh',
    location: 'Manchester South',
    initials: 'PS',
    avatarColor: 'bg-rose-500',
    course: 'Health & Safety Induction',
    courseIcon: 'verified_user',
    progress: 100,
    dueDate: '2026-02-28',
    certName: 'H&S Induction Certificate',
  },
  {
    id: '7',
    name: 'Luke Henderson',
    location: 'Sheffield North',
    initials: 'LH',
    avatarColor: 'bg-sky-500',
    course: 'Level 2 Chemical Handling',
    courseIcon: 'science',
    progress: 67,
    dueDate: '2026-04-05',
    certName: 'Chemical Handling Certificate',
  },
  {
    id: '8',
    name: 'Amara Osei',
    location: 'London East',
    initials: 'AO',
    avatarColor: 'bg-teal-500',
    course: 'Standard Operating Procedures',
    courseIcon: 'menu_book',
    progress: 25,
    dueDate: '2026-05-15',
    certName: 'SOP Compliance Certificate',
  },
  {
    id: '9',
    name: 'Chris Evans',
    location: 'Nottingham Central',
    initials: 'CE',
    avatarColor: 'bg-indigo-500',
    course: 'Fire Safety Awareness',
    courseIcon: 'local_fire_department',
    progress: 95,
    dueDate: '2026-03-08',
    certName: 'Fire Safety Certificate',
  },
  {
    id: '10',
    name: 'Fatima Hassan',
    location: 'Liverpool West',
    initials: 'FH',
    avatarColor: 'bg-amber-500',
    course: 'COSHH Awareness',
    courseIcon: 'health_and_safety',
    progress: 78,
    dueDate: '2026-04-12',
    certName: 'COSHH Awareness Certificate',
  },
];

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL',         label: 'All' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED',   label: 'Completed' },
  { key: 'NOT_STARTED', label: 'Not Started' },
];

const getStatus = (progress: number) => {
  if (progress >= 100) return { label: 'Completed',   badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500' };
  if (progress > 0)    return { label: 'In Progress', badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400' };
  return                      { label: 'Not Started', badge: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-400' };
};

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

const TrainingCertification: React.FC<TrainingCertificationProps> = ({ onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('ALL');
  const [searchTerm, setSearchTerm]     = useState('');

  const activeTrainees   = DUMMY_TRAINEES.filter(t => t.progress > 0 && t.progress < 100).length;
  const avgProgress      = Math.round(DUMMY_TRAINEES.reduce((s, t) => s + t.progress, 0) / DUMMY_TRAINEES.length);
  const certsDue         = DUMMY_TRAINEES.filter(t => t.progress >= 80 && t.progress < 100).length;

  const filteredTrainees = DUMMY_TRAINEES.filter(t => {
    const matchesFilter =
      activeFilter === 'ALL'         ? true :
      activeFilter === 'IN_PROGRESS' ? t.progress > 0 && t.progress < 100 :
      activeFilter === 'COMPLETED'   ? t.progress >= 100 :
                                       t.progress === 0;
    const matchesSearch = searchTerm === '' ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statCards = [
    {
      label: 'Active Trainees',
      value: activeTrainees.toString(),
      sub: `of ${DUMMY_TRAINEES.length} total staff`,
      valueColor: 'text-[#0d121b]',
      barColor: 'bg-[#2e4150]',
      pct: Math.round((activeTrainees / DUMMY_TRAINEES.length) * 100),
      icon: 'person_play',
      iconColor: 'text-[#2e4150]',
    },
    {
      label: 'Avg. Progress',
      value: `${avgProgress}%`,
      sub: 'across all programmes',
      valueColor: 'text-amber-500',
      barColor: 'bg-amber-400',
      pct: avgProgress,
      icon: 'trending_up',
      iconColor: 'text-amber-500',
    },
    {
      label: 'Certifications Due',
      value: certsDue.toString(),
      sub: 'ready for assessment',
      valueColor: 'text-green-600',
      barColor: 'bg-green-500',
      pct: Math.round((certsDue / DUMMY_TRAINEES.length) * 100),
      icon: 'workspace_premium',
      iconColor: 'text-green-600',
    },
  ];

  return (
    <div className="flex-1 flex flex-col w-full py-[15px] sm:py-8 px-4 sm:px-6 md:px-10 animate-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-160px)]">
      <div className="w-full space-y-6">

        {/* Page header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-black">
              Training &amp; Certification Tracking
            </h1>
            <p className="text-[#4c669a] text-base">
              Monitor staff currently undergoing professional training and certification programs.
            </p>
          </div>
          <button
            onClick={() => onNavigate('CLEANERS_LIST')}
            className="flex items-center justify-center gap-2 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-all px-[30px] py-[15px] h-10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Assign Training</span>
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map(card => (
            <div key={card.label} className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">{card.label}</p>
                <span className={`material-symbols-outlined text-[22px] ${card.iconColor}`}>{card.icon}</span>
              </div>
              <p className={`text-4xl font-black ${card.valueColor}`}>{card.value}</p>
              <p className="text-[11px] text-[#4c669a]">{card.sub}</p>
              <div className="h-1.5 rounded-full bg-[#e7ebf3] overflow-hidden">
                <div className={`h-full rounded-full ${card.barColor} transition-all duration-500`} style={{ width: `${card.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Course summary pills */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Level 2 Chemical Handling',    icon: 'science',               count: 2, color: 'bg-blue-50 border-blue-200 text-blue-700' },
            { label: 'Standard Operating Procedures', icon: 'menu_book',             count: 2, color: 'bg-violet-50 border-violet-200 text-violet-700' },
            { label: 'Fire Safety Awareness',         icon: 'local_fire_department', count: 2, color: 'bg-red-50 border-red-200 text-red-700' },
            { label: 'COSHH Awareness',               icon: 'health_and_safety',     count: 2, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
            { label: 'Manual Handling Training',      icon: 'engineering',           count: 1, color: 'bg-orange-50 border-orange-200 text-orange-700' },
            { label: 'H&S Induction',                 icon: 'verified_user',         count: 1, color: 'bg-teal-50 border-teal-200 text-teal-700' },
          ].map(pill => (
            <div key={pill.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${pill.color}`}>
              <span className="material-symbols-outlined text-[14px]">{pill.icon}</span>
              {pill.label}
              <span className="bg-white/60 rounded-full px-1.5 py-0.5 text-[10px] font-black">{pill.count}</span>
            </div>
          ))}
        </div>

        {/* Staff in Training Period table */}
        <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#e7ebf3]">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-[#0d121b] text-base font-black">Staff in Training Period</h2>
              <span className="text-xs font-bold bg-[#e7ebf3] text-[#4c669a] px-2.5 py-1 rounded-full">
                {filteredTrainees.length} records
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <label className="flex items-center h-9 bg-[#f6f6f8] rounded-lg px-3 border border-transparent focus-within:border-[#2e4150]/30 transition-all">
                <span className="material-symbols-outlined text-[#4c669a] text-[18px] mr-2">search</span>
                <input
                  className="bg-transparent border-none text-[#0d121b] placeholder:text-[#4c669a] text-sm outline-none w-40"
                  placeholder="Search staff or course…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </label>
              {/* Filter tabs */}
              <div className="flex gap-1">
                {FILTER_TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeFilter === tab.key
                        ? 'bg-[#2e4150] text-white'
                        : 'text-[#4c669a] hover:bg-[#e7ebf3]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-[#e7ebf3] bg-[#f8fafc]">
                  <th className="text-left px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Staff Member</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Current Course</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide w-44">Progress</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Due Date</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {filteredTrainees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center">
                      <span className="material-symbols-outlined text-[#c7c7c7] text-5xl block mb-2">search_off</span>
                      <p className="text-[#4c669a] text-sm font-semibold">No results found</p>
                    </td>
                  </tr>
                ) : (
                  filteredTrainees.map(trainee => {
                    const status = getStatus(trainee.progress);
                    return (
                      <tr key={trainee.id} className="hover:bg-[#f8fafc] transition-colors group">
                        {/* Staff Member */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full ${trainee.avatarColor} shrink-0 flex items-center justify-center`}>
                              <span className="text-white text-xs font-black">{trainee.initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#0d121b]">{trainee.name}</p>
                              <p className="text-xs text-[#4c669a]">{trainee.location}</p>
                            </div>
                          </div>
                        </td>

                        {/* Current Course */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-[#4c669a]">{trainee.courseIcon}</span>
                            <div>
                              <p className="text-sm font-semibold text-[#0d121b]">{trainee.course}</p>
                              <p className="text-xs text-[#4c669a]">{trainee.certName}</p>
                            </div>
                          </div>
                        </td>

                        {/* Progress */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 rounded-full bg-[#e7ebf3] overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  trainee.progress >= 100 ? 'bg-green-500' :
                                  trainee.progress >= 80  ? 'bg-amber-400' :
                                                            'bg-[#2e4150]'
                                }`}
                                style={{ width: `${trainee.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-black text-[#4c669a] w-8 text-right shrink-0">{trainee.progress}%</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wide ${status.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>

                        {/* Due Date */}
                        <td className="px-4 py-4 text-sm text-[#4c669a] font-medium">
                          {formatDate(trainee.dueDate)}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => onNavigate('CLEANERS_LIST')}
                            className="text-[#2e4150] text-xs font-black uppercase tracking-wide hover:text-[#4c669a] transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-[#e7ebf3] bg-[#f8fafc] flex items-center justify-between">
            <p className="text-xs text-[#4c669a]">Showing <span className="font-bold text-[#0d121b]">{filteredTrainees.length}</span> of <span className="font-bold text-[#0d121b]">{DUMMY_TRAINEES.length}</span> records</p>
            <p className="text-xs text-[#4c669a]">Last updated: <span className="font-bold text-[#0d121b]">Today</span></p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrainingCertification;
