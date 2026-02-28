import React from 'react';
import { AppView } from '../types';
import { navigateToUrl } from '../utils/routing';

interface TrainingDetailProps {
  onNavigate: (view: AppView) => void;
}

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
  { id: '1', name: 'James Thornton', location: 'Manchester North', initials: 'JT', avatarColor: 'bg-blue-500', course: 'Level 2 Chemical Handling', courseIcon: 'science', progress: 92, dueDate: '2026-03-10', certName: 'Chemical Handling Certificate' },
  { id: '2', name: 'Sarah Mitchell', location: 'Birmingham Central', initials: 'SM', avatarColor: 'bg-pink-500', course: 'Standard Operating Procedures', courseIcon: 'menu_book', progress: 100, dueDate: '2026-01-15', certName: 'SOP Compliance Certificate' },
  { id: '3', name: 'David Okafor', location: 'London South', initials: 'DO', avatarColor: 'bg-emerald-500', course: 'Fire Safety Awareness', courseIcon: 'local_fire_department', progress: 45, dueDate: '2026-04-20', certName: 'Fire Safety Certificate' },
  { id: '4', name: 'Emma Clarke', location: 'Leeds West', initials: 'EC', avatarColor: 'bg-violet-500', course: 'COSHH Awareness', courseIcon: 'health_and_safety', progress: 88, dueDate: '2026-03-25', certName: 'COSHH Awareness Certificate' },
  { id: '5', name: 'Ryan Patel', location: 'Bristol East', initials: 'RP', avatarColor: 'bg-orange-500', course: 'Manual Handling Training', courseIcon: 'engineering', progress: 0, dueDate: '2026-05-01', certName: 'Manual Handling Certificate' },
  { id: '6', name: 'Priya Singh', location: 'Manchester South', initials: 'PS', avatarColor: 'bg-rose-500', course: 'Health & Safety Induction', courseIcon: 'verified_user', progress: 100, dueDate: '2026-02-28', certName: 'H&S Induction Certificate' },
  { id: '7', name: 'Luke Henderson', location: 'Sheffield North', initials: 'LH', avatarColor: 'bg-sky-500', course: 'Level 2 Chemical Handling', courseIcon: 'science', progress: 67, dueDate: '2026-04-05', certName: 'Chemical Handling Certificate' },
  { id: '8', name: 'Amara Osei', location: 'London East', initials: 'AO', avatarColor: 'bg-teal-500', course: 'Standard Operating Procedures', courseIcon: 'menu_book', progress: 25, dueDate: '2026-05-15', certName: 'SOP Compliance Certificate' },
  { id: '9', name: 'Chris Evans', location: 'Nottingham Central', initials: 'CE', avatarColor: 'bg-indigo-500', course: 'Fire Safety Awareness', courseIcon: 'local_fire_department', progress: 95, dueDate: '2026-03-08', certName: 'Fire Safety Certificate' },
  { id: '10', name: 'Fatima Hassan', location: 'Liverpool West', initials: 'FH', avatarColor: 'bg-amber-500', course: 'COSHH Awareness', courseIcon: 'health_and_safety', progress: 78, dueDate: '2026-04-12', certName: 'COSHH Awareness Certificate' },
];

const getStatus = (progress: number) => {
  if (progress >= 100) return { label: 'Completed', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' };
  if (progress > 0)    return { label: 'In Progress', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' };
  return                       { label: 'Not Started', badge: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' };
};

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

const TrainingDetail: React.FC<TrainingDetailProps> = ({ onNavigate }) => {
  const segments = window.location.pathname.split('/');
  const recordId = segments[3] || '';
  const trainee = DUMMY_TRAINEES.find(t => t.id === recordId);

  const handleBack = () => {
    navigateToUrl('/training');
    onNavigate('TRAINING_CERTIFICATION');
  };

  if (!trainee) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center w-full py-[15px] sm:py-8 px-4 sm:px-6 md:px-10 animate-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-160px)]">
        <span className="material-symbols-outlined text-[64px] text-[#c7c7c7] mb-4">search_off</span>
        <h2 className="text-xl font-bold text-[#0d121b] mb-2">Training Record Not Found</h2>
        <p className="text-[#4c669a] text-sm mb-6">The training record you're looking for doesn't exist.</p>
        <button onClick={handleBack} className="flex items-center gap-2 rounded-full bg-[#2e4150] text-white text-sm font-bold px-[30px] py-[15px] h-10 cursor-pointer hover:bg-[#2e4150]/90 transition-all">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Training
        </button>
      </div>
    );
  }

  const status = getStatus(trainee.progress);

  return (
    <div className="flex-1 flex flex-col w-full py-[15px] sm:py-8 px-4 sm:px-6 md:px-10 animate-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-160px)] max-w-screen sm:w-full sm:max-w-full">
      <div className="w-full space-y-6 max-w-3xl">

        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 rounded-lg hover:bg-[#e7ebf3] transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[22px] text-[#4c669a]">arrow_back</span>
          </button>
          <div className="flex flex-col gap-1">
            <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-bold font-black">Training Record</h1>
            <p className="text-[#4c669a] text-base">Detailed training and certification information.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-6 sm:p-8 space-y-6">

          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full ${trainee.avatarColor} shrink-0 flex items-center justify-center`}>
              <span className="text-white text-lg font-black">{trainee.initials}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0d121b]">{trainee.name}</h2>
              <p className="text-sm text-[#4c669a] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                {trainee.location}
              </p>
            </div>
          </div>

          <hr className="border-[#e7ebf3]" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Training Course</p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#4c669a]">{trainee.courseIcon}</span>
                <p className="text-sm font-semibold text-[#0d121b]">{trainee.course}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Certification</p>
              <p className="text-sm font-semibold text-[#0d121b]">{trainee.certName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Status</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold font-black uppercase tracking-wide ${status.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Progress</p>
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
                <span className="text-sm font-black text-[#0d121b] w-10 text-right">{trainee.progress}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Due Date</p>
              <p className="text-sm font-semibold text-[#0d121b]">{formatDate(trainee.dueDate)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Issue Date</p>
              <p className="text-sm font-semibold text-[#0d121b]">{trainee.progress > 0 ? formatDate(trainee.dueDate) : '—'}</p>
            </div>
          </div>

          <hr className="border-[#e7ebf3]" />

          <div className="space-y-1.5">
            <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Certificate</p>
            {trainee.progress >= 100 ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <span className="material-symbols-outlined text-green-600 text-[24px]">verified</span>
                <div>
                  <p className="text-sm font-bold text-green-800">{trainee.certName}</p>
                  <p className="text-xs text-green-600">Certificate issued — {formatDate(trainee.dueDate)}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-[#f6f6f8] border border-dashed border-[#e7ebf3] rounded-xl">
                <span className="material-symbols-outlined text-[#4c669a] text-[24px]">description</span>
                <div>
                  <p className="text-sm font-semibold text-[#0d121b]">No certificate uploaded</p>
                  <p className="text-xs text-[#4c669a]">Certificate will be available once training is completed.</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end pt-2">
            <button onClick={handleBack} className="flex items-center gap-2 rounded-full bg-[#e7ebf3] text-[#0d121b] text-sm font-bold px-[30px] py-[15px] h-10 cursor-pointer hover:bg-[#dce1eb] transition-all">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Training
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrainingDetail;
