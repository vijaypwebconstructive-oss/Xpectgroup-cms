import React, { useState } from 'react';
import { getUserById } from './mockData';
import { addedUsers } from './UsersList';
import { UserRole, AccountStatus, ROLE_PERMISSIONS, ROLE_DESCRIPTIONS, ACCESS_LABELS } from './types';

interface Props {
  userId: string;
  onBack: () => void;
}

const roleBadge = (role: UserRole) => {
  const map: Record<UserRole, { cls: string; icon: string }> = {
    Admin:          { cls: 'bg-purple-100 text-purple-700 border border-purple-200', icon: 'shield_person' },
    Supervisor:     { cls: 'bg-blue-100 text-blue-700 border border-blue-200',       icon: 'supervisor_account' },
    'CMS Operator': { cls: 'bg-teal-100 text-teal-700 border border-teal-200',       icon: 'edit_note' },
  };
  return map[role];
};

const statusBadge = (status: AccountStatus) => {
  const map: Record<AccountStatus, { cls: string; label: string; icon: string }> = {
    active:   { cls: 'bg-green-100 text-green-700 border border-green-200', label: 'Active',   icon: 'check_circle' },
    disabled: { cls: 'bg-red-50 text-red-500 border border-red-200',        label: 'Disabled', icon: 'block' },
    pending:  { cls: 'bg-amber-100 text-amber-700 border border-amber-200', label: 'Pending',  icon: 'schedule' },
  };
  return map[status];
};

const fmt = (d?: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtDateTime = (d?: string) => {
  if (!d) return 'Never logged in';
  const date = new Date(d);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' at ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const UserDetail: React.FC<Props> = ({ userId, onBack }) => {
  const user = getUserById(userId) || addedUsers.find(u => u.id === userId);
  const [localStatus, setLocalStatus] = useState<AccountStatus | null>(null);

  if (!user) {
    return (
      <div className="min-h-full bg-[#f6f7fb] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-[56px] text-[#e7ebf3] block mb-4">person_off</span>
          <p className="text-lg font-bold text-[#0d121b]">User not found</p>
          <button onClick={onBack} className="mt-4 px-5 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors">
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = localStatus ?? user.status;
  const rb = roleBadge(user.role);
  const sb = statusBadge(currentStatus);
  const permissions = ROLE_PERMISSIONS[user.role];
  const initials = user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const toggleStatus = () => {
    const next = currentStatus === 'active' ? 'disabled' : 'active';
    setLocalStatus(next);
    user.status = next;
  };

  return (
    <div className="min-h-full bg-[#f6f7fb] w-screen sm:w-full sm:max-w-full">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] sm:px-8 px-4 sm:py-5 py-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Users
        </button>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2e4150] text-white text-lg font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0d121b]">{user.fullName}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${rb.cls}`}>
                  <span className="material-symbols-outlined text-[14px]">{rb.icon}</span>
                  {user.role}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sb.cls}`}>
                  <span className="material-symbols-outlined text-[14px]">{sb.icon}</span>
                  {sb.label}
                </span>
              </div>
            </div>
          </div>
          <button onClick={toggleStatus}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
              currentStatus === 'active'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}>
            <span className="material-symbols-outlined text-[18px]">
              {currentStatus === 'active' ? 'block' : 'check_circle'}
            </span>
            {currentStatus === 'active' ? 'Disable Access' : 'Enable Access'}
          </button>
        </div>
      </div>

      <div className="sm:px-8 px-4 sm:py-6 py-3 space-y-5">

        {/* User Info Card */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-4">
          <h2 className="text-base font-bold text-[#0d121b] flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">person</span>
            Account Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { label: 'Full Name',    value: user.fullName,            icon: 'badge' },
              { label: 'Email',        value: user.email,               icon: 'email' },
              { label: 'Phone',        value: user.phone || 'Not set',  icon: 'phone' },
              { label: 'Role',         value: user.role,                icon: 'admin_panel_settings' },
              { label: 'Created',      value: fmt(user.createdAt),      icon: 'calendar_today' },
              { label: 'Last Login',   value: fmtDateTime(user.lastLogin), icon: 'login' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#f6f7fb] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">{item.icon}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#6b7a99] uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm font-medium text-[#0d121b] mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Description */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-4">
          <h2 className="text-base font-bold text-[#0d121b] flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">shield_person</span>
            Role — {user.role}
          </h2>
          <p className="text-sm text-[#6b7a99] mb-5">{ROLE_DESCRIPTIONS[user.role]}</p>

          <div className="flex items-start gap-3 bg-[#2e4150] rounded-xl px-5 py-4 mb-5">
            <span className="material-symbols-outlined text-white/70 text-[20px] shrink-0 mt-0.5">info</span>
            <div>
              <p className="text-sm font-semibold text-white">Module Access Permissions</p>
              <p className="text-xs text-white/70 mt-0.5">
                The table below shows which modules this user can access based on their assigned role. Permission enforcement will be applied when backend authentication is enabled.
              </p>
            </div>
          </div>

          {/* Permissions Table */}
          <div className="rounded-xl border border-[#e7ebf3] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f6f7fb] border-b border-[#e7ebf3]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">Module</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">Access Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {permissions.map(p => {
                  const al = ACCESS_LABELS[p.access];
                  return (
                    <tr key={p.module} className={p.access === 'no_access' ? 'opacity-50' : ''}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">{p.icon}</span>
                          <span className="font-medium text-[#0d121b]">{p.module}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${al.cls}`}>
                          {al.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-4">
          <h2 className="text-base font-bold text-[#0d121b] flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">settings</span>
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors">
              <span className="material-symbols-outlined text-[18px]">lock_reset</span>
              Reset Password
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors">
              <span className="material-symbols-outlined text-[18px]">mail</span>
              Resend Credentials
            </button>
            <button onClick={toggleStatus}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentStatus === 'active'
                  ? 'border border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                  : 'border border-green-200 text-green-600 bg-green-50 hover:bg-green-100'
              }`}>
              <span className="material-symbols-outlined text-[18px]">
                {currentStatus === 'active' ? 'block' : 'check_circle'}
              </span>
              {currentStatus === 'active' ? 'Disable Account' : 'Enable Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
