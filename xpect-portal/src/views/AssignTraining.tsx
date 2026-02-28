import React, { useState, useMemo } from 'react';
import { AppView, VerificationStatus } from '../types';
import { useCleaners } from '../context/CleanersContext';

interface AssignTrainingProps {
  onNavigate: (view: AppView) => void;
}

const TRAINING_TYPES = [
  'Level 2 Chemical Handling',
  'Standard Operating Procedures',
  'Fire Safety Awareness',
  'COSHH Awareness',
  'Manual Handling Training',
  'Health & Safety Induction',
  'First Aid at Work',
  'Working at Height',
  'Asbestos Awareness',
  'Legionella Awareness',
];

const AssignTraining: React.FC<AssignTrainingProps> = ({ onNavigate }) => {
  const { cleaners } = useCleaners();

  const verifiedEmployees = useMemo(
    () => cleaners.filter(c => c.verificationStatus === VerificationStatus.VERIFIED),
    [cleaners]
  );
  const [employeeId, setEmployeeId] = useState('');
  const [trainingType, setTrainingType] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [fileName, setFileName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCancel = () => {
    onNavigate('TRAINING_CERTIFICATION');
  };

  const handleSave = () => {
    if (!employeeId || !trainingType || !issueDate) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onNavigate('TRAINING_CERTIFICATION');
    }, 600);
  };

  const isValid = employeeId && trainingType && issueDate;

  return (
    <div className="flex-1 flex flex-col w-full py-[15px] sm:py-8 px-4 sm:px-6 md:px-10 animate-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-160px)] max-w-screen sm:w-full sm:max-w-full">
      <div className="w-full space-y-6 max-w-3xl">

        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-[#e7ebf3] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px] text-[#4c669a]">arrow_back</span>
          </button>
          <div className="flex flex-col gap-1">
            <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-bold font-black">
              Assign Training
            </h1>
            <p className="text-[#4c669a] text-base">
              Assign a training programme or certification to a staff member.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-6 sm:p-8 space-y-6">

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#0d121b]">Employee <span className="text-red-500">*</span></label>
            <select
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              className="w-full h-11 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] px-4 text-sm text-[#0d121b] outline-none focus:border-[#2e4150] transition-colors cursor-pointer"
            >
              <option value="">Select an employee…</option>
              {verifiedEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} — {emp.location || 'Unassigned'}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#0d121b]">Training Type <span className="text-red-500">*</span></label>
            <select
              value={trainingType}
              onChange={e => setTrainingType(e.target.value)}
              className="w-full h-11 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] px-4 text-sm text-[#0d121b] outline-none focus:border-[#2e4150] transition-colors cursor-pointer"
            >
              <option value="">Select training type…</option>
              {TRAINING_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#0d121b]">Issue Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                className="w-full h-11 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] px-4 text-sm text-[#0d121b] outline-none focus:border-[#2e4150] transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#0d121b]">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="w-full h-11 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] px-4 text-sm text-[#0d121b] outline-none focus:border-[#2e4150] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#0d121b]">Upload Certificate</label>
            <div
              className="w-full border-2 border-dashed border-[#e7ebf3] rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-[#2e4150]/40 transition-colors"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
                input.onchange = (e: any) => {
                  const file = e.target?.files?.[0];
                  if (file) setFileName(file.name);
                };
                input.click();
              }}
            >
              <span className="material-symbols-outlined text-[32px] text-[#4c669a]">cloud_upload</span>
              {fileName ? (
                <p className="text-sm font-semibold text-[#0d121b]">{fileName}</p>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[#0d121b]">Click to upload certificate</p>
                  <p className="text-xs text-[#4c669a]">PDF, JPG, PNG or DOC (max 10 MB)</p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 rounded-full bg-[#e7ebf3] text-[#0d121b] text-sm font-bold px-[30px] py-[15px] h-10 cursor-pointer hover:bg-[#dce1eb] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid || saving}
              className="flex items-center gap-2 rounded-full bg-[#2e4150] text-white text-sm font-bold px-[30px] py-[15px] h-10 cursor-pointer hover:bg-[#2e4150]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save Training
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AssignTraining;
