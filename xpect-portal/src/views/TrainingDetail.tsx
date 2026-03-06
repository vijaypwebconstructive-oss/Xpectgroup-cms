import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
import { useTraining } from '../context/TrainingContext';
import { useCleaners } from '../context/CleanersContext';
import { navigateToUrl } from '../utils/routing';
import api from '../services/api';

const isPdf = (name: string) => /\.pdf$/i.test(name);
const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(name);

interface TrainingDetailProps {
  onNavigate: (view: AppView) => void;
}

const TrainingDetail: React.FC<TrainingDetailProps> = ({ onNavigate }) => {
  const { trainingRecords, updateTrainingRecord } = useTraining();
  const { cleaners } = useCleaners();
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);
  const [viewingDocument, setViewingDocument] = useState(false);
  const segments = window.location.pathname.split('/');
  const recordId = segments[3] || '';
  const record = trainingRecords.find(t => t.id === recordId);

  const [editForm, setEditForm] = useState({
    name: '',
    course: '',
    courseIcon: '',
    certName: '',
    certDocumentData: '',
    status: 'Not Trained' as 'Trained' | 'Not Trained',
    trainingStartDate: '',
    trainingEndDate: '',
    expiryDate: '',
    certDocument: '',
  });
  const [certFileName, setCertFileName] = useState('');

  useEffect(() => {
    if (record) {
      setEditForm({
        name: record.name,
        course: record.course,
        courseIcon: record.courseIcon,
        certName: record.certName,
        certDocumentData: record.certDocumentData || '',
        status: record.status,
        trainingStartDate: record.trainingStartDate || '',
        trainingEndDate: record.trainingEndDate || '',
        expiryDate: record.expiryDate || '',
        certDocument: record.certDocument || '',
      });
      setCertFileName(record.certDocument || '');
    }
  }, [record]);

  const handleBack = () => {
    navigateToUrl('/training');
    onNavigate('TRAINING_CERTIFICATION');
  };

  const addOneYear = (dateStr: string): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  };

  const handleEndDateChange = (endDate: string) => {
    setEditForm(prev => ({
      ...prev,
      trainingEndDate: endDate,
      expiryDate: addOneYear(endDate) || prev.expiryDate,
    }));
  };

  const getCleanerEmail = (name: string): string | null => {
    const match = cleaners.find(c => c.name.trim().toLowerCase() === name.trim().toLowerCase());
    return match?.email && match.email.trim() ? match.email : null;
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

  const handleSendExpiryReminder = async () => {
    if (!record) return;
    const expiryDate = editForm.expiryDate || record.expiryDate;
    if (!expiryDate) {
      setReminderMessage('No expiry date set for this training.');
      return;
    }
    const name = editForm.name || record.name;
    const email = getCleanerEmail(name);
    if (!email) {
      setReminderMessage('No email on file for this cleaner.');
      return;
    }
    setSendingReminder(true);
    setReminderMessage(null);
    try {
      await api.training.sendExpiryReminder({
        email,
        cleanerName: name,
        courseName: editForm.course || record.course,
        expiryDate,
      });
      setReminderMessage('Expiry reminder sent successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reminder.';
      setReminderMessage(msg);
    } finally {
      setSendingReminder(false);
    }
  };

  const handleSave = async () => {
    if (!record) return;
    await updateTrainingRecord(record.id, {
      status: editForm.status,
      trainingStartDate: editForm.trainingStartDate,
      trainingEndDate: editForm.trainingEndDate,
      expiryDate: editForm.expiryDate,
      certDocument: editForm.certDocument || undefined,
      certDocumentData: editForm.certDocumentData || undefined,
    });
  };

  const handleFileUpload = (e: Event) => {
    const file = (e.target as HTMLInputElement)?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setCertFileName(file.name);
      setEditForm(prev => ({ ...prev, certDocument: file.name, certDocumentData: data }));
    };
    reader.readAsDataURL(file);
  };

  if (!record) {
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

  const statusBadge = editForm.status === 'Trained'
    ? 'bg-green-100 text-green-700'
    : 'bg-gray-100 text-gray-500';

  return (
    <div className="flex-1 flex flex-col w-full py-[15px] sm:py-8 px-4 sm:px-6 md:px-10 animate-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-160px)] max-w-screen sm:w-full sm:max-w-full">
      <div className="w-full space-y-6 max-w-3xl">

        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 rounded-lg hover:bg-[#e7ebf3] transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[22px] text-[#4c669a]">arrow_back</span>
          </button>
          <div className="flex flex-col gap-1">
            <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-bold font-black">Training Record</h1>
            <p className="text-[#4c669a] text-base">Training and certification details.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-6 sm:p-8 space-y-6">

          <div className="flex items-center gap-4">
            {(() => {
              const matchedCleaner = cleaners.find(c => c.name.trim().toLowerCase() === record.name.trim().toLowerCase());
              const profileAvatar = record.avatar || matchedCleaner?.avatar;
              return profileAvatar ? (
                <img src={profileAvatar} alt={record.name} className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-[#e7ebf3]" />
              ) : (
                <div className={`w-14 h-14 rounded-full ${record.avatarColor} shrink-0 flex items-center justify-center`}>
                  <span className="text-white text-lg font-black">{record.initials}</span>
                </div>
              );
            })()}
            <div className="flex-1">
              <label className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Cleaner Name</label>
              <p className="mt-1 text-sm font-bold text-[#0d121b]">{record.name}</p>
            </div>
          </div>

          <hr className="border-[#e7ebf3]" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Training Course</label>
              <div className="flex items-center gap-2 py-2">
                <span className="material-symbols-outlined text-[20px] text-[#4c669a]">{record.courseIcon}</span>
                <p className="text-sm font-semibold text-[#0d121b]">{record.course}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Status</label>
              <select
                value={editForm.status}
                onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value as 'Trained' | 'Not Trained' }))}
                className={`w-full h-11 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] px-4 text-sm font-semibold outline-none focus:border-[#2e4150] cursor-pointer ${statusBadge}`}
              >
                <option value="Not Trained">Not Trained</option>
                <option value="Trained">Trained</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Training Start Date</label>
              <input
                type="date"
                value={editForm.trainingStartDate}
                onChange={e => setEditForm(prev => ({ ...prev, trainingStartDate: e.target.value }))}
                className="w-full h-11 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] px-4 text-sm text-[#0d121b] outline-none focus:border-[#2e4150]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Training End Date</label>
              <input
                type="date"
                value={editForm.trainingEndDate}
                onChange={e => handleEndDateChange(e.target.value)}
                className="w-full h-11 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] px-4 text-sm text-[#0d121b] outline-none focus:border-[#2e4150]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Training Expiry Date</label>
              <input
                type="date"
                value={editForm.expiryDate}
                onChange={e => setEditForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full h-11 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] px-4 text-sm text-[#0d121b] outline-none focus:border-[#2e4150]"
              />
              <p className="text-xs text-[#4c669a]">Auto-set to 1 year after end date when end date changes</p>
            </div>
          </div>

          <hr className="border-[#e7ebf3]" />

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">Training Certification Document</label>
            {(editForm.certDocumentData || record.certDocumentData) ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 p-3 bg-[#f6f6f8] rounded-lg border border-[#e7ebf3]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[24px] text-[#4c669a] shrink-0">description</span>
                    <p className="text-sm font-semibold text-[#0d121b] truncate">{certFileName || record.certDocument || 'Document'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewingDocument(true)}
                      className="flex items-center gap-2 h-9 px-4 rounded-xl border border-[#e7ebf3] bg-white text-[#0d121b] text-xs font-bold hover:bg-[#f6f6f8] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
                        input.onchange = handleFileUpload;
                        input.click();
                      }}
                      className="flex items-center gap-2 h-9 px-4 rounded-xl border border-[#e7ebf3] bg-white text-[#4c669a] text-xs font-bold hover:bg-[#f6f6f8] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                      Replace
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="w-full border-2 border-dashed border-[#e7ebf3] rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-[#2e4150]/40 transition-colors"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
                  input.onchange = handleFileUpload;
                  input.click();
                }}
              >
                <span className="material-symbols-outlined text-[24px] text-[#4c669a]">cloud_upload</span>
                <p className="text-sm font-semibold text-[#0d121b]">Click to upload certificate</p>
              </div>
            )}
          </div>

          {reminderMessage && (
            <div className={`p-3 rounded-lg text-sm ${reminderMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              {reminderMessage}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 flex-wrap">
            <button
              onClick={handleSendExpiryReminder}
              disabled={sendingReminder || !(editForm.expiryDate || record.expiryDate) || !getCleanerEmail(editForm.name || record.name) || !isExpiringWithinDays(editForm.expiryDate || record.expiryDate || '')}
              className="flex items-center gap-2 rounded-full bg-amber-500 text-white text-sm font-bold px-[30px] py-[15px] h-10 cursor-pointer hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">{sendingReminder ? 'progress_activity' : 'mail'}</span>
              {sendingReminder ? 'Sending…' : 'Training Due Reminder.'}
            </button>
            <button onClick={handleBack} className="flex items-center gap-2 rounded-full bg-[#e7ebf3] text-[#0d121b] text-sm font-bold px-[30px] py-[15px] h-10 cursor-pointer hover:bg-[#dce1eb] transition-all">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-full bg-[#2e4150] text-white text-sm font-bold px-[30px] py-[15px] h-10 cursor-pointer hover:bg-[#2e4150]/90 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Changes
            </button>
          </div>
        </div>

      </div>

      {/* Document Viewer Modal - like staff detail page */}
      {viewingDocument && (editForm.certDocumentData || record.certDocumentData) && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setViewingDocument(false)}
          style={{ zIndex: 9999 }}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#e7ebf3]">
              <h3 className="text-lg font-bold text-[#0d121b]">{certFileName || record.certDocument || 'Certificate'}</h3>
              <button
                onClick={() => setViewingDocument(false)}
                className="p-2 hover:bg-[#e7ebf3] rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[#f6f6f8] min-h-[400px]">
              {isPdf(certFileName || record.certDocument || '') ? (
                <iframe
                  src={editForm.certDocumentData || record.certDocumentData || ''}
                  className="w-full min-h-[500px] border border-[#e7ebf3] rounded-lg bg-white"
                  title={certFileName || record.certDocument || 'Certificate'}
                  style={{ minHeight: '500px' }}
                />
              ) : isImage(certFileName || record.certDocument || '') ? (
                <img
                  src={editForm.certDocumentData || record.certDocumentData || ''}
                  alt="Certificate"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  style={{ maxHeight: '70vh' }}
                />
              ) : (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-[48px] text-[#4c669a] block mb-4">description</span>
                  <p className="text-[#4c669a] font-semibold">Preview not available for this file type</p>
                  <a
                    href={editForm.certDocumentData || record.certDocumentData || '#'}
                    download={certFileName || record.certDocument}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Download
                  </a>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[#e7ebf3] flex justify-end gap-3">
              <button
                onClick={() => setViewingDocument(false)}
                className="px-4 py-2 rounded-full border border-[#e7ebf3] text-sm font-bold text-[#0d121b] hover:bg-[#f6f6f8]"
              >
                Close
              </button>
              {(editForm.certDocumentData || record.certDocumentData) && (
                <a
                  href={editForm.certDocumentData || record.certDocumentData || '#'}
                  download={certFileName || record.certDocument}
                  className="px-4 py-2 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingDetail;
