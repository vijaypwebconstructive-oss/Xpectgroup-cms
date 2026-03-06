import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppView, Cleaner, VerificationStatus } from '../types';
import { useCleaners } from '../context/CleanersContext';
import { useTraining } from '../context/TrainingContext';
import { navigateToUrl } from '../utils/routing';
import api from '../services/api';
import {
  TrainingRecord,
  TRAINING_TYPES,
  AVATAR_COLORS,
  getInitials,
  formatDate,
} from './trainingMockData';

interface TrainingCertificationProps {
  onNavigate: (view: AppView, cleaner?: Cleaner) => void;
}

type StatusFilter = 'ALL' | 'TRAINED' | 'NOT_TRAINED';

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'TRAINED', label: 'Trained' },
  { key: 'NOT_TRAINED', label: 'Not Trained' },
];

const statusBadge = (status: 'Trained' | 'Not Trained') => {
  if (status === 'Trained') return { badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' };
  return { badge: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' };
};

const addOneYear = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
};

const isExpiringWithinDays = (expiryDateStr: string, days: number = 30): boolean => {
  if (!expiryDateStr) return false;
  const expiry = new Date(expiryDateStr);
  if (isNaN(expiry.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  const diffMs = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
};

const TrainingCertification: React.FC<TrainingCertificationProps> = ({ onNavigate }) => {
  const { cleaners } = useCleaners();
  const { trainingRecords, addTrainingRecord } = useTraining();
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const hasRunAutoReminder = useRef(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEmpId, setModalEmpId] = useState('');
  const [modalCourse, setModalCourse] = useState('');
  const [modalStartDate, setModalStartDate] = useState('');
  const [modalEndDate, setModalEndDate] = useState('');
  const [modalExpiryDate, setModalExpiryDate] = useState('');
  const [modalStatus, setModalStatus] = useState<'Trained' | 'Not Trained'>('Not Trained');
  const [modalCertFile, setModalCertFile] = useState('');
  const [modalCertData, setModalCertData] = useState('');

  // Verified employees who are not in the training list (no training record)
  const assignableEmployees = useMemo(() => {
    const verified = cleaners.filter(c => c.verificationStatus === VerificationStatus.VERIFIED);
    const namesInTraining = new Set(trainingRecords.map(r => r.name.trim().toLowerCase()));
    return verified.filter(c => !namesInTraining.has(c.name.trim().toLowerCase()));
  }, [cleaners, trainingRecords]);

  useEffect(() => {
    if (hasRunAutoReminder.current || cleaners.length === 0) return;
    hasRunAutoReminder.current = true;
    const run = async () => {
      const expiring = trainingRecords.filter(r => isExpiringWithinDays(r.expiryDate || '', 30));
      if (expiring.length === 0) return;
      const recordsWithEmail: Array<{ id: string; name: string; course: string; expiryDate: string; email: string }> = [];
      for (const rec of expiring) {
        const cleaner = cleaners.find(c => c.name.trim().toLowerCase() === rec.name.trim().toLowerCase());
        const email = cleaner?.email?.trim();
        if (email) {
          recordsWithEmail.push({
            id: rec.id,
            name: rec.name,
            course: rec.course,
            expiryDate: rec.expiryDate || '',
            email,
          });
        }
      }
      if (recordsWithEmail.length > 0) {
        try {
          await api.training.checkAndSendExpiryReminders(recordsWithEmail);
        } catch {
          // Silent fail - no UI feedback for auto-send
        }
      }
    };
    run();
  }, [trainingRecords, cleaners]);

  const handleAssign = async () => {
    if (!modalEmpId || !modalCourse || !modalStartDate) return;
    const emp = assignableEmployees.find(c => c.id === modalEmpId);
    if (!emp) return;
    const courseInfo = TRAINING_TYPES.find(t => t.label === modalCourse);
    const endDate = modalEndDate || modalStartDate;
    const expiryDate = modalExpiryDate || (endDate ? addOneYear(endDate) : addOneYear(modalStartDate));
    try {
      await addTrainingRecord({
        name: emp.name,
        location: emp.location || 'Unassigned',
        initials: getInitials(emp.name),
        avatarColor: AVATAR_COLORS[trainingRecords.length % AVATAR_COLORS.length],
        avatar: emp.avatar,
        course: modalCourse,
        courseIcon: courseInfo?.icon || 'school',
        certName: courseInfo?.cert || `${modalCourse} Certificate`,
        trainingStartDate: modalStartDate,
        trainingEndDate: endDate,
        expiryDate,
        status: modalStatus,
        certDocument: modalCertFile || undefined,
        certDocumentData: modalCertData || undefined,
      });
    } catch {
      return;
    }
    setModalEmpId('');
    setModalCourse('');
    setModalStartDate('');
    setModalEndDate('');
    setModalExpiryDate('');
    setModalStatus('Not Trained');
    setModalCertFile('');
    setIsModalOpen(false);
  };

  const totalCount = trainingRecords.length;
  const trainedCount = trainingRecords.filter(t => t.status === 'Trained').length;
  const notTrainedCount = trainingRecords.filter(t => t.status === 'Not Trained').length;

  const filteredRecords = trainingRecords.filter(t => {
    const matchesFilter =
      activeFilter === 'ALL' ? true :
      activeFilter === 'TRAINED' ? t.status === 'Trained' :
      t.status === 'Not Trained';
    const matchesSearch = searchTerm === '' ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const isValidAssign = modalEmpId && modalCourse && modalStartDate;

  return (
    <div className="flex-1 flex flex-col w-full py-[15px] sm:py-8 px-4 sm:px-6 md:px-10 animate-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-160px)] max-w-screen sm:w-full sm:max-w-full">
      <div className="w-full space-y-6">

        {/* Page header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-bold font-black">
              Training &amp; Certification
            </h1>
            <p className="text-[#4c669a] text-base">
              Staff training status — trained or not trained.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-all px-[30px] py-[15px] h-10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Assign Training</span>
          </button>
        </div>

        {/* Simple stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-5 flex flex-col gap-1">
            <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Total</p>
            <p className="text-[24px] sm:text-[30px] font-black font-bold text-[#0d121b]">{totalCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-5 flex flex-col gap-1">
            <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Trained</p>
            <p className="text-[24px] sm:text-[30px] font-black font-bold text-green-600">{trainedCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-5 flex flex-col gap-1">
            <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Not Trained</p>
            <p className="text-[24px] sm:text-[30px] font-black font-bold text-gray-500">{notTrainedCount}</p>
          </div>
        </div>

        {/* Training list table */}
        <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#e7ebf3]">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-[#0d121b] text-base font-semibold font-black">Training List</h2>
              <span className="text-xs font-bold bg-[#e7ebf3] text-[#4c669a] px-2.5 py-1 rounded-full">
                {filteredRecords.length} records
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center h-9 bg-[#f6f6f8] rounded-lg px-3 border border-transparent focus-within:border-[#2e4150]/30 transition-all">
                <span className="material-symbols-outlined text-[#4c669a] text-[18px] mr-2">search</span>
                <input
                  className="bg-transparent border-none text-[#0d121b] placeholder:text-[#4c669a] text-sm outline-none w-40"
                  placeholder="Search staff or course…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </label>
              <div className="flex gap-1">
                {FILTER_TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeFilter === tab.key ? 'bg-[#2e4150] text-white' : 'text-[#4c669a] hover:bg-[#e7ebf3]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-[#e7ebf3] bg-[#f8fafc]">
                  <th className="text-left px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Staff Member</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Training Course</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Expiry Date</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <span className="material-symbols-outlined text-[#c7c7c7] text-5xl block mb-2">search_off</span>
                      <p className="text-[#4c669a] text-sm font-semibold">No results found</p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record: TrainingRecord) => {
                    const { badge, dot } = statusBadge(record.status);
                    const matchedCleaner = cleaners.find(c => c.name.trim().toLowerCase() === record.name.trim().toLowerCase());
                    const profileAvatar = record.avatar || matchedCleaner?.avatar;
                    return (
                      <tr key={record.id} className="hover:bg-[#f8fafc] transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {profileAvatar ? (
                              <img src={profileAvatar} alt={record.name} className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-200" />
                            ) : (
                              <div className={`w-9 h-9 rounded-full ${record.avatarColor} shrink-0 flex items-center justify-center`}>
                                <span className="text-white text-xs font-black">{record.initials}</span>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-[#0d121b]">{record.name}</p>
                              <p className="text-xs text-[#4c669a]">{record.location}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-[#4c669a]">{record.courseIcon}</span>
                            <p className="text-sm font-semibold text-[#0d121b]">{record.course}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold font-black uppercase tracking-wide ${badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-[#4c669a] font-medium">
                          {formatDate(record.expiryDate)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => {
                              navigateToUrl(`/training/record/${record.id}`);
                              onNavigate('TRAINING_DETAIL');
                            }}
                            className="text-[#000] text-xs font-semibold font-black capitalize tracking-wide transition-colors cursor-pointer"
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

          <div className="px-5 py-3 border-t border-[#e7ebf3] bg-[#f8fafc] flex items-center justify-between">
            <p className="text-xs text-[#4c669a]">Showing <span className="font-bold text-[#0d121b]">{filteredRecords.length}</span> of <span className="font-bold text-[#0d121b]">{trainingRecords.length}</span> records</p>
            <p className="text-xs text-[#4c669a]">Last updated: <span className="font-bold text-[#0d121b]">Today</span></p>
          </div>
        </div>

      </div>

      {/* Assign Training Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 sticky top-0 bg-white border-b border-[#e7ebf3]">
              <h3 className="text-lg font-bold text-[#0d121b]">Assign Training</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-[#e7ebf3] transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px] text-[#4c669a]">close</span>
              </button>
            </div>

            <div className="px-6 pb-6 space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#0d121b]">Employee <span className="text-red-500">*</span></label>
                <select
                  value={modalEmpId}
                  onChange={e => setModalEmpId(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] px-4 text-sm text-[#0d121b] outline-none focus:border-[#2e4150] transition-colors cursor-pointer"
                >
                  <option value="">Select an employee…</option>
                  {assignableEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} — {emp.location || 'Unassigned'}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#0d121b]">Training Course <span className="text-red-500">*</span></label>
                <select
                  value={modalCourse}
                  onChange={e => setModalCourse(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] px-4 text-sm text-[#0d121b] outline-none focus:border-[#2e4150] transition-colors cursor-pointer"
                >
                  <option value="">Select training course…</option>
                  {TRAINING_TYPES.map(t => (
                    <option key={t.label} value={t.label}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#0d121b]">Training Start Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={modalStartDate}
                  onChange={e => setModalStartDate(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] px-4 text-sm text-[#0d121b] outline-none focus:border-[#2e4150] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#0d121b]">Training End Date</label>
                <input
                  type="date"
                  value={modalEndDate}
                  onChange={e => {
                    const endDate = e.target.value;
                    setModalEndDate(endDate);
                    setModalExpiryDate(addOneYear(endDate));
                  }}
                  className="w-full h-11 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] px-4 text-sm text-[#0d121b] outline-none focus:border-[#2e4150] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#0d121b]">Expiry Date</label>
                <input
                  type="date"
                  value={modalExpiryDate}
                  readOnly
                  className="w-full h-11 rounded-lg border border-[#e7ebf3] bg-[#e7ebf3] px-4 text-sm text-[#0d121b] cursor-not-allowed"
                />
                <p className="text-xs text-[#4c669a]">Auto-set to 1 year after training completion</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#0d121b]">Status</label>
                <select
                  value={modalStatus}
                  onChange={e => setModalStatus(e.target.value as 'Trained' | 'Not Trained')}
                  className="w-full h-11 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] px-4 text-sm text-[#0d121b] outline-none focus:border-[#2e4150] transition-colors cursor-pointer"
                >
                  <option value="Not Trained">Not Trained</option>
                  <option value="Trained">Trained</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#0d121b]">Certificate Document</label>
                <div
                  className="w-full border-2 border-dashed border-[#e7ebf3] rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-[#2e4150]/40 transition-colors"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
                    input.onchange = (e: Event) => {
                      const file = (e.target as HTMLInputElement)?.files?.[0];
                      if (file) {
                        setModalCertFile(file.name);
                        const reader = new FileReader();
                        reader.onload = () => setModalCertData(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                >
                  <span className="material-symbols-outlined text-[24px] text-[#4c669a]">cloud_upload</span>
                  {modalCertFile ? (
                    <p className="text-sm font-semibold text-[#0d121b]">{modalCertFile}</p>
                  ) : (
                    <p className="text-xs text-[#4c669a]">Click to upload (optional)</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex items-center gap-2 rounded-full bg-[#e7ebf3] text-[#0d121b] text-sm font-bold px-6 h-10 cursor-pointer hover:bg-[#dce1eb] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={!isValidAssign}
                  className="flex items-center gap-2 rounded-full bg-[#2e4150] text-white text-sm font-bold px-6 h-10 cursor-pointer hover:bg-[#2e4150]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingCertification;
