import React, { useState, useCallback } from 'react';
import { Cleaner, AppView, VerificationStatus, EmploymentType, DBSStatus } from '../types';
import { useCleaners } from '../context/CleanersContext';
import { api } from '../services/api';

interface CleanersListProps {
  cleaners: Cleaner[];
  onNavigate: (view: AppView, cleaner?: Cleaner) => void;
}

// ── Mock staff data (shown when no real cleaners are loaded) ─
const MOCK_CLEANERS: Cleaner[] = [
  {
    id: 'mock-s-001',
    name: 'James Thornton',
    email: 'james.thornton@xpectgroup.com',
    phoneNumber: '+44 7700 900123',
    dob: '1990-05-15',
    address: '12 Oak Street, Manchester, M1 2AB',
    gender: 'Male',
    startDate: '2023-03-10',
    employmentType: EmploymentType.PERMANENT,
    verificationStatus: VerificationStatus.VERIFIED,
    dbsStatus: DBSStatus.CLEARED,
    location: 'Manchester North',
    onboardingProgress: 100,
    citizenshipStatus: 'British',
    hourlyPayRate: 12.50,
    contractStatus: 'Active',
    shiftType: 'Morning',
    declarations: { accuracy: true, rtw: true, approval: true, gdpr: true },
  },
  {
    id: 'mock-s-002',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@xpectgroup.com',
    phoneNumber: '+44 7700 900456',
    dob: '1994-08-22',
    address: '47 Birch Lane, Manchester, M14 5GH',
    gender: 'Female',
    startDate: '2023-07-01',
    employmentType: EmploymentType.PERMANENT,
    verificationStatus: VerificationStatus.VERIFIED,
    dbsStatus: DBSStatus.CLEARED,
    location: 'Manchester South',
    onboardingProgress: 100,
    citizenshipStatus: 'British',
    hourlyPayRate: 12.50,
    contractStatus: 'Active',
    shiftType: 'Morning',
    declarations: { accuracy: true, rtw: true, approval: true, gdpr: true },
  },
  {
    id: 'mock-s-003',
    name: 'David Okafor',
    email: 'david.okafor@xpectgroup.com',
    phoneNumber: '+44 7700 900789',
    dob: '1988-11-30',
    address: '8 Elm Road, Liverpool, L1 4TY',
    gender: 'Male',
    startDate: '2024-01-15',
    employmentType: EmploymentType.CONTRACTOR,
    verificationStatus: VerificationStatus.PENDING,
    dbsStatus: DBSStatus.AWAITING_DOCS,
    location: 'Liverpool Central',
    onboardingProgress: 65,
    citizenshipStatus: 'Nigerian',
    hourlyPayRate: 11.44,
    contractStatus: 'Active',
    shiftType: 'Evening',
    declarations: { accuracy: true, rtw: true, approval: false, gdpr: true },
  },
  {
    id: 'mock-s-004',
    name: 'Emma Clarke',
    email: 'emma.clarke@xpectgroup.com',
    phoneNumber: '+44 7700 900321',
    dob: '1992-03-17',
    address: '23 Cedar Avenue, Leeds, LS1 9PQ',
    gender: 'Female',
    startDate: '2022-11-05',
    employmentType: EmploymentType.PERMANENT,
    verificationStatus: VerificationStatus.DOCS_REQUIRED,
    dbsStatus: DBSStatus.CLEARED,
    location: 'Leeds West',
    onboardingProgress: 80,
    citizenshipStatus: 'British',
    hourlyPayRate: 13.00,
    contractStatus: 'Active',
    shiftType: 'Morning',
    declarations: { accuracy: true, rtw: true, approval: true, gdpr: true },
  },
  {
    id: 'mock-s-005',
    name: 'Ryan Patel',
    email: 'ryan.patel@xpectgroup.com',
    phoneNumber: '+44 7700 900654',
    dob: '1996-06-09',
    address: '5 Maple Close, Bristol, BS1 6RT',
    gender: 'Male',
    startDate: '2023-09-18',
    employmentType: EmploymentType.TEMPORARY,
    verificationStatus: VerificationStatus.VERIFIED,
    dbsStatus: DBSStatus.EXPIRED,
    location: 'Bristol East',
    onboardingProgress: 100,
    citizenshipStatus: 'British',
    hourlyPayRate: 11.44,
    contractStatus: 'Active',
    shiftType: 'Any',
    declarations: { accuracy: true, rtw: true, approval: true, gdpr: true },
  },
  {
    id: 'mock-s-006',
    name: 'Priya Singh',
    email: 'priya.singh@xpectgroup.com',
    phoneNumber: '+44 7700 900987',
    dob: '1993-01-25',
    address: '19 Willow Drive, Manchester, M20 3NB',
    gender: 'Female',
    startDate: '2024-02-01',
    employmentType: EmploymentType.CONTRACTOR,
    verificationStatus: VerificationStatus.REJECTED,
    dbsStatus: DBSStatus.NOT_STARTED,
    location: 'Manchester South',
    onboardingProgress: 30,
    citizenshipStatus: 'Indian',
    hourlyPayRate: 11.44,
    contractStatus: 'Paused',
    shiftType: 'Evening',
    declarations: { accuracy: true, rtw: false, approval: false, gdpr: true },
  },
];

// Avatar colour palette for initials fallback
const AVATAR_COLORS = [
  'bg-blue-500', 'bg-pink-500', 'bg-emerald-500', 'bg-violet-500',
  'bg-orange-500', 'bg-rose-500', 'bg-sky-500', 'bg-teal-500',
];
const getAvatarColor = (id: string) =>
  AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];

const getInitials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const CleanersList: React.FC<CleanersListProps> = ({ cleaners, onNavigate }) => {
  const { refreshCleaners } = useCleaners();
  const [searchTerm, setSearchTerm] = useState('');

  // Use mock data when no real cleaners loaded
  const isMockMode = cleaners.length === 0;
  const allCleaners = isMockMode ? MOCK_CLEANERS : cleaners;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedBulkAction, setSelectedBulkAction] = useState<string>('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditLoading, setBulkEditLoading] = useState(false);
  const [bulkEditForm, setBulkEditForm] = useState<{
    employmentType: string;
    status: string;
    hourlyPayRate: string;
  }>({
    employmentType: '',
    status: '',
    hourlyPayRate: '',
  });
  const [editSelectedOpen, setEditSelectedOpen] = useState(false);
  const [editSelectedLoading, setEditSelectedLoading] = useState(false);
  const [editSelectedForm, setEditSelectedForm] = useState<{
    status: string;
    employmentType: string;
    workLocation: string;
    hourlyPayRate: string;
  }>({
    status: '',
    employmentType: '',
    workLocation: '',
    hourlyPayRate: '',
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCleaners();
    } finally {
      setIsRefreshing(false);
    }
  };

  const EMPLOYMENT_TYPE_OPTIONS = [
    { value: '', label: 'No change' },
    { value: EmploymentType.CONTRACTOR, label: EmploymentType.CONTRACTOR },
    { value: EmploymentType.PERMANENT, label: EmploymentType.PERMANENT },
    { value: EmploymentType.TEMPORARY, label: EmploymentType.TEMPORARY },
    { value: EmploymentType.SUB_CONTRACTOR, label: 'Sub-contractor' },
  ];

  const STATUS_OPTIONS = [
    { value: '', label: 'No change' },
    { value: 'Verified', label: 'Verified' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Pending', label: 'Pending' },
  ];

  const filteredCleaners = allCleaners.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleIds = filteredCleaners.map(c => c.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.has(id));

  const toggleSelectAll = useCallback(() => {
    if (allVisibleSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        visibleIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        visibleIds.forEach(id => next.add(id));
        return next;
      });
    }
  }, [allVisibleSelected, visibleIds]);

  const toggleSelectOne = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const applyBulkAction = () => {
    if (!selectedBulkAction) {
      setFeedback({ type: 'error', message: 'Please select a bulk action.' });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }
    if (selectedBulkAction === 'BULK_EDIT') {
      setBulkEditForm({ employmentType: '', status: '', hourlyPayRate: '' });
      setBulkEditOpen(true);
      return;
    }
    if (selectedBulkAction === 'EDIT_SELECTED') {
      if (selectedIds.size === 0) {
        setFeedback({ type: 'error', message: 'Select at least one staff to edit.' });
        setTimeout(() => setFeedback(null), 4000);
        return;
      }
      setEditSelectedForm({ status: '', employmentType: '', workLocation: '', hourlyPayRate: '' });
      setEditSelectedOpen(true);
      return;
    }
    if (selectedBulkAction === 'DELETE') {
      if (selectedIds.size === 0) {
        setFeedback({ type: 'error', message: 'Select at least one staff to delete.' });
        setTimeout(() => setFeedback(null), 4000);
        return;
      }
      setDeleteConfirmOpen(true);
      return;
    }
  };

  const closeDeleteConfirm = () => {
    if (!deleteLoading) setDeleteConfirmOpen(false);
  };

  const applyBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setDeleteLoading(true);
    setFeedback(null);
    try {
      const result = await api.cleaners.bulkDelete(Array.from(selectedIds));
      setDeleteConfirmOpen(false);
      setSelectedIds(new Set());
      setSelectedBulkAction('');
      await refreshCleaners();
      setFeedback({
        type: 'success',
        message: `${result.deletedCount} staff member${result.deletedCount === 1 ? '' : 's'} deleted.`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to delete staff. Please try again.',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeBulkEdit = () => {
    if (!bulkEditLoading) setBulkEditOpen(false);
  };

  const applyBulkEdit = async () => {
    const ids = selectedIds.size > 0 ? Array.from(selectedIds) : filteredCleaners.map((c) => c.id);
    if (ids.length === 0) {
      setFeedback({ type: 'error', message: 'No staff to update.' });
      return;
    }
    const updates: { hourlyPayRate?: number; employmentType?: string } = {};
    if (bulkEditForm.employmentType) updates.employmentType = bulkEditForm.employmentType;
    const rate = bulkEditForm.hourlyPayRate.trim();
    if (rate !== '') {
      const num = parseFloat(rate);
      if (Number.isNaN(num) || num < 0) {
        setFeedback({ type: 'error', message: 'Hourly pay must be a non-negative number.' });
        return;
      }
      updates.hourlyPayRate = num;
    }
    const hasStatus = bulkEditForm.status !== '';
    const hasUpdates = Object.keys(updates).length > 0 || hasStatus;
    if (!hasUpdates) {
      setFeedback({ type: 'error', message: 'Set at least one field (employee type, status, or hourly pay).' });
      return;
    }
    setBulkEditLoading(true);
    setFeedback(null);
    try {
      if (Object.keys(updates).length > 0) {
        await api.cleaners.bulkUpdate(ids, updates);
      }
      if (hasStatus) {
        await api.cleaners.bulkUpdateStatus(ids, bulkEditForm.status as 'Verified' | 'Rejected' | 'Pending');
      }
      setBulkEditOpen(false);
      setBulkEditForm({ employmentType: '', status: '', hourlyPayRate: '' });
      await refreshCleaners();
      const parts = [];
      if (updates.employmentType) parts.push('employment type');
      if (updates.hourlyPayRate !== undefined) parts.push('hourly pay');
      if (hasStatus) parts.push('status');
      setFeedback({
        type: 'success',
        message: `Updated ${parts.join(', ')} for ${ids.length} staff member${ids.length === 1 ? '' : 's'}.`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to update staff. Please try again.',
      });
    } finally {
      setBulkEditLoading(false);
    }
  };

  const canApplyBulkEdit =
    bulkEditForm.employmentType !== '' ||
    bulkEditForm.status !== '' ||
    bulkEditForm.hourlyPayRate.trim() !== '';

  const closeEditSelected = () => {
    if (!editSelectedLoading) setEditSelectedOpen(false);
  };

  const applyEditSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const updates: { hourlyPayRate?: number; employmentType?: string; location?: string } = {};
    if (editSelectedForm.employmentType) updates.employmentType = editSelectedForm.employmentType;
    if (editSelectedForm.workLocation.trim()) updates.location = editSelectedForm.workLocation.trim();
    const rate = editSelectedForm.hourlyPayRate.trim();
    if (rate !== '') {
      const num = parseFloat(rate);
      if (Number.isNaN(num) || num < 0) {
        setFeedback({ type: 'error', message: 'Hourly pay must be a non-negative number.' });
        return;
      }
      updates.hourlyPayRate = num;
    }
    const hasStatus = editSelectedForm.status !== '';
    const hasUpdates = Object.keys(updates).length > 0 || hasStatus;
    if (!hasUpdates) {
      setFeedback({ type: 'error', message: 'Set at least one field (status, employee type, work location, or hourly pay).' });
      return;
    }
    setEditSelectedLoading(true);
    setFeedback(null);
    try {
      if (Object.keys(updates).length > 0) {
        await api.cleaners.bulkUpdate(ids, updates);
      }
      if (hasStatus) {
        await api.cleaners.bulkUpdateStatus(ids, editSelectedForm.status as 'Verified' | 'Rejected' | 'Pending');
      }
      setEditSelectedOpen(false);
      setEditSelectedForm({ status: '', employmentType: '', workLocation: '', hourlyPayRate: '' });
      setSelectedIds(new Set());
      setSelectedBulkAction('');
      await refreshCleaners();
      const parts = [];
      if (updates.employmentType) parts.push('employee type');
      if (updates.location !== undefined) parts.push('work location');
      if (updates.hourlyPayRate !== undefined) parts.push('hourly pay');
      if (hasStatus) parts.push('status');
      setFeedback({
        type: 'success',
        message: `Updated ${parts.join(', ')} for ${ids.length} staff member${ids.length === 1 ? '' : 's'}.`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to update staff. Please try again.',
      });
    } finally {
      setEditSelectedLoading(false);
    }
  };

  const canApplyEditSelected =
    editSelectedForm.status !== '' ||
    editSelectedForm.employmentType !== '' ||
    editSelectedForm.workLocation.trim() !== '' ||
    editSelectedForm.hourlyPayRate.trim() !== '';

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Status', 'Type', 'Hourly Pay Rate', 'Work Location', 'Progress'].join(','),
      ...filteredCleaners.map(c => [
        `"${c.name}"`,
        `"${c.email}"`,
        `"${c.phoneNumber}"`,
        c.verificationStatus,
        c.employmentType,
        c.hourlyPayRate ? `£${c.hourlyPayRate.toFixed(2)}` : 'N/A',
        `"${c.location || 'TBD'}"`,
        `${c.onboardingProgress}%`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `xpect-staff-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusStyles = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return 'bg-green-100 text-green-700';
      case VerificationStatus.PENDING:
        return 'bg-amber-100 text-amber-700';
      case VerificationStatus.DOCS_REQUIRED:
        return 'bg-blue-100 text-blue-700';
      case VerificationStatus.REJECTED:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full py-[15px] sm:py-8 px-4 sm:px-6 md:px-10 animate-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-160px)]">
      <div className="w-full  space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-black font-bold">Staff Management</h1>
            <p className="text-[#4c669a] text-base">Manage and monitor your team's compliance and onboarding status.</p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh list"
              className=" items-center justify-center w-10 h-10 rounded-full bg-[#e7ebf3] text-[#0d121b] border border-[#c7c7c7] transition-all cursor-pointer hover:bg-[#dce1eb] disabled:opacity-70 hidden sm:flex"
            >
              <span className={`material-symbols-outlined text-[20px] ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
            </button>
            <button 
               onClick={handleExport}
               className="flex items-center justify-center gap-2 rounded-full h-10 px-[30px] py-[15px] bg-[#e7ebf3] text-[#0d121b] text-base font-bold border border-[#c7c7c7]  transition-all font-[Montserrat] cursor-pointer hover:bg-[#dce1eb]"
             >
              <span className="material-symbols-outlined text-[20px]">file_download</span>
              <span className='truncate font-semibold font-[14px] font-[]'>Export</span>
            </button>
            <button 
              onClick={() => onNavigate('STAFF_INVITES')}
              className="flex items-center justify-center gap-2 rounded-full  bg-[#2e4150]  text-white text-sm font-bold hover:bg-[#2e4150] transition-all px-[30px] py-[15px] h-10 cursor-pointer "
            >
              <span className="material-symbols-outlined text-[20px] display-none sm:block">person_add</span>
              <span>Add Staff</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div
            role="alert"
            className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${
              feedback.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <span className="material-symbols-outlined">
              {feedback.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="text-sm font-medium">{feedback.message}</span>
          </div>
        )}

        <div className="bg-white p-2 rounded-2xl border border-[#e7ebf3] shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="w-full lg:flex-1">
              <label className="flex items-center w-full h-11 bg-[#f6f6f8] rounded-lg px-4 border border-transparent  transition-all">
                <span className="material-symbols-outlined text-[#4c669a] mr-2">search</span>
                <input 
                  className="w-full bg-transparent border-none text-[#0d121b] placeholder:text-[#4c669a] text-sm outline-none" 
                  placeholder="Search staff by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>

        {filteredCleaners.length > 0 || isMockMode ? (
          <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm lg:overflow-x-scroll scrollbar-thin employee-list">
            {/* WordPress-style bulk actions bar: dropdown + Apply (always visible above table) */}
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-[#e7ebf3] bg-gray-50/50">
              <select
                value={selectedBulkAction}
                onChange={(e) => setSelectedBulkAction(e.target.value)}
                className="h-10 px-3 rounded-lg border border-[#e7ebf3] bg-white text-[#0d121b] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2e4150] min-w-[200px]"
                aria-label="Bulk actions"
              >
                <option value="">— Bulk actions —</option>
                <option value="EDIT_SELECTED">Edit the selected</option>
                <option value="BULK_EDIT">Bulk edit</option>
                <option value="DELETE">Delete selected</option>
              </select>
              <button
                type="button"
                onClick={applyBulkAction}
                disabled={selectedIds.size === 0 && selectedBulkAction !== 'BULK_EDIT'}
                className="h-10 px-4 rounded-lg bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Apply
              </button>
              {selectedIds.size > 0 && (
                <span className="text-sm text-[#4c669a] font-medium">
                  Selected {selectedIds.size} item{selectedIds.size === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[#e7ebf3] text-[#4c669a] text-[10px] uppercase tracking-widest font-black">
                  <th className="px-[16px] sm:px-6 py-4 w-12">
                    <label className="flex items-center justify-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-[#c7c7c7] text-[#2e4150] focus:ring-[#2e4150]"
                        aria-label="Select all visible staff"
                      />
                    </label>
                  </th>
                  <th className="px-[16px] sm:px-6 py-4 text-sm font-medium text-[#0d121b] capitalize">Staff Member</th>
                  <th className="px-[16px] sm:px-6 py-4 text-sm font-medium text-[#0d121b] capitalize">Status</th>
                  <th className="px-[16px] sm:px-6 py-4 text-sm font-medium text-[#0d121b] capitalize">Type</th>
                  <th className="px-[16px] sm:px-6 py-4 text-sm font-medium text-[#0d121b] normal-case">Pay(hr)</th>
                  <th className="px-[16px] sm:px-6 py-4 text-sm font-medium text-[#0d121b] capitalize">Location</th>
                  <th className="px-[16px] sm:px-6 py-4 text-sm font-medium text-[#0d121b] capitalize">Progress</th>
                  <th className="px-[16px] sm:px-6 py-4 text-right text-sm font-medium text-[#0d121b] capitalize">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {filteredCleaners.map((cleaner) => (
                  <tr key={cleaner.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-[16px] sm:px-6 py-4 w-12">
                      <label className="flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(cleaner.id)}
                          onChange={() => toggleSelectOne(cleaner.id)}
                          className="w-4 h-4 rounded border-[#c7c7c7] text-[#2e4150] focus:ring-[#2e4150]"
                          aria-label={`Select ${cleaner.name}`}
                        />
                      </label>
                    </td>
                    <td className="px-[16px] sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        {cleaner.avatar ? (
                          <div className="size-12 sm:size-14 rounded-full border border-[#e7ebf3] overflow-hidden bg-gray-100 shrink-0">
                            <img src={cleaner.avatar} alt={cleaner.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className={`size-12 sm:size-14 rounded-full shrink-0 flex items-center justify-center ${getAvatarColor(cleaner.id)}`}>
                            <span className="text-white text-sm font-black">{getInitials(cleaner.name)}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-base font-bold text-[#0d121b]">{cleaner.name}</p>
                          <p className="text-sm text-[#4c669a]">{cleaner.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-[16px] td-verifcation sm:px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(cleaner.verificationStatus)}`}>
                        {cleaner.verificationStatus}
                      </span>
                    </td>
                    <td className="px-[16px] sm:px-6 py-4 text-sm font-medium text-[#0d121b]">{cleaner.employmentType}</td>
                    <td className="px-[16px] sm:px-6 py-4 text-sm font-medium text-[#0d121b]">
                      {cleaner.hourlyPayRate ? `£${cleaner.hourlyPayRate.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-[16px] sm:px-6 py-4 text-sm font-medium text-[#0d121b]">
                      {cleaner.location || 'TBD'}
                    </td>
                    <td className="px-[16px] sm:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#34d399] h-full rounded-full" style={{ width: `${cleaner.onboardingProgress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-gray-500">{cleaner.onboardingProgress}%</span>
                      </div>
                    </td>
                    <td className="px-[16px] sm:px-6 py-4 text-right">
                      <button 
                        onClick={() => onNavigate('CLEANER_DETAIL', cleaner)}
                        className="text-[#2e4150] font-bold text-sm cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e7ebf3] p-20 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-black text-4xl">person_off</span>
            </div>
            <h3 className="text-xl font-bold font-black text-gray-900">No staff members found</h3>
            <p className="text-[#4c669a] max-w-sm mt-2">
              Start by inviting your first staff member to join Xpect Group.
            </p>
            <button 
              onClick={() => onNavigate('STAFF_INVITES')}
              className="mt-4 bg-[#2e4150] text-white font-bold px-[30px] py-[15px] h-12 rounded-full hover:bg-[#2e4150]/90 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add_circle</span>
              Add New Staff
            </button>
          </div>
        )}

        {deleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="delete-confirm-title">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h2 id="delete-confirm-title" className="text-lg font-black text-[#0d121b] mb-2">
                Delete staff
              </h2>
              <p className="text-[#4c669a] text-sm mb-6">
                Are you sure you want to delete <strong className="text-[#0d121b]">{selectedIds.size} staff member{selectedIds.size === 1 ? '' : 's'}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeDeleteConfirm}
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-full border border-[#c7c7c7] text-[#0d121b] font-bold text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyBulkDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-full bg-red-600 text-white font-bold text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      Deleting…
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {bulkEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="bulk-edit-title">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h2 id="bulk-edit-title" className="text-lg font-black text-[#0d121b] mb-1">
                Bulk edit
              </h2>
              <p className="text-[#4c669a] text-sm mb-4">
                Update the following for {selectedIds.size > 0 ? selectedIds.size : filteredCleaners.length} staff
                {selectedIds.size > 0 ? ' (selected)' : ' (all visible)'}.
              </p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-[#0d121b] mb-1.5">Employee type</label>
                  <select
                    value={bulkEditForm.employmentType}
                    onChange={(e) => setBulkEditForm((f) => ({ ...f, employmentType: e.target.value }))}
                    className="w-full h-11 px-4 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] text-[#0d121b] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2e4150]"
                  >
                    {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value || 'none'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0d121b] mb-1.5">Change status</label>
                  <select
                    value={bulkEditForm.status}
                    onChange={(e) => setBulkEditForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full h-11 px-4 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] text-[#0d121b] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2e4150]"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value || 'none'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0d121b] mb-1.5">Update hourly pay rate (£)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Leave empty for no change"
                    value={bulkEditForm.hourlyPayRate}
                    onChange={(e) => setBulkEditForm((f) => ({ ...f, hourlyPayRate: e.target.value }))}
                    className="w-full h-11 px-4 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] text-[#0d121b] text-sm font-medium placeholder:text-[#4c669a] focus:outline-none focus:ring-2 focus:ring-[#2e4150]"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeBulkEdit}
                  disabled={bulkEditLoading}
                  className="px-4 py-2 rounded-full border border-[#c7c7c7] text-[#0d121b] font-bold text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyBulkEdit}
                  disabled={bulkEditLoading || !canApplyBulkEdit}
                  className="px-4 py-2 rounded-full bg-[#2e4150] text-white font-bold text-sm hover:bg-[#2e4150]/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {bulkEditLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      Updating…
                    </>
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {editSelectedOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="edit-selected-title">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h2 id="edit-selected-title" className="text-lg font-black text-[#0d121b] mb-1">
                Edit the selected
              </h2>
              <p className="text-[#4c669a] text-sm mb-4">
                Update the following for {selectedIds.size} selected staff. Leave a field empty or "No change" to keep current value.
              </p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-[#0d121b] mb-1.5">Change status</label>
                  <select
                    value={editSelectedForm.status}
                    onChange={(e) => setEditSelectedForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full h-11 px-4 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] text-[#0d121b] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2e4150]"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value || 'none'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0d121b] mb-1.5">Employee type</label>
                  <select
                    value={editSelectedForm.employmentType}
                    onChange={(e) => setEditSelectedForm((f) => ({ ...f, employmentType: e.target.value }))}
                    className="w-full h-11 px-4 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] text-[#0d121b] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2e4150]"
                  >
                    {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value || 'none'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0d121b] mb-1.5">Work location</label>
                  <input
                    type="text"
                    placeholder="Leave empty for no change"
                    value={editSelectedForm.workLocation}
                    onChange={(e) => setEditSelectedForm((f) => ({ ...f, workLocation: e.target.value }))}
                    className="w-full h-11 px-4 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] text-[#0d121b] text-sm font-medium placeholder:text-[#4c669a] focus:outline-none focus:ring-2 focus:ring-[#2e4150]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0d121b] mb-1.5">Hourly pay rate (£)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Leave empty for no change"
                    value={editSelectedForm.hourlyPayRate}
                    onChange={(e) => setEditSelectedForm((f) => ({ ...f, hourlyPayRate: e.target.value }))}
                    className="w-full h-11 px-4 rounded-lg border border-[#e7ebf3] bg-[#f6f6f8] text-[#0d121b] text-sm font-medium placeholder:text-[#4c669a] focus:outline-none focus:ring-2 focus:ring-[#2e4150]"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeEditSelected}
                  disabled={editSelectedLoading}
                  className="px-4 py-2 rounded-full border border-[#c7c7c7] text-[#0d121b] font-bold text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyEditSelected}
                  disabled={editSelectedLoading || !canApplyEditSelected}
                  className="px-4 py-2 rounded-full bg-[#2e4150] text-white font-bold text-sm hover:bg-[#2e4150]/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {editSelectedLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      Updating…
                    </>
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CleanersList;
