export type UserRole = 'Admin' | 'Supervisor' | 'CMS Operator';
export type AccountStatus = 'active' | 'disabled' | 'pending';
export type AccessLevel = 'full' | 'view_edit' | 'view_only' | 'no_access';

export interface SystemUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: AccountStatus;
  lastLogin?: string;
  createdAt: string;
}

export interface ModulePermission {
  module: string;
  icon: string;
  access: AccessLevel;
}

export const ACCESS_LABELS: Record<AccessLevel, { label: string; cls: string }> = {
  full:       { label: 'Full Access',  cls: 'bg-green-100 text-green-700 border border-green-200' },
  view_edit:  { label: 'View & Edit', cls: 'bg-blue-100 text-blue-700 border border-blue-200' },
  view_only:  { label: 'View Only',   cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
  no_access:  { label: 'No Access',   cls: 'bg-red-50 text-red-500 border border-red-200' },
};

export const ROLE_PERMISSIONS: Record<UserRole, ModulePermission[]> = {
  Admin: [
    { module: 'Dashboard',              icon: 'dashboard',         access: 'full' },
    { module: 'Staff Management',       icon: 'groups',            access: 'full' },
    { module: 'Clients & Sites',        icon: 'handshake',         access: 'full' },
    { module: 'Training & Certification', icon: 'school',          access: 'full' },
    { module: 'PPE Management',         icon: 'health_and_safety', access: 'full' },
    { module: 'Incidents',              icon: 'report_problem',    access: 'full' },
    { module: 'Risk & COSHH',           icon: 'science',           access: 'full' },
    { module: 'Document Control',       icon: 'folder_managed',    access: 'full' },
    { module: 'Compliance Dashboard',   icon: 'verified_user',     access: 'full' },
    { module: 'User Access',            icon: 'manage_accounts',   access: 'full' },
  ],
  Supervisor: [
    { module: 'Dashboard',              icon: 'dashboard',         access: 'view_only' },
    { module: 'Staff Management',       icon: 'groups',            access: 'view_edit' },
    { module: 'Clients & Sites',        icon: 'handshake',         access: 'view_edit' },
    { module: 'Training & Certification', icon: 'school',          access: 'view_edit' },
    { module: 'PPE Management',         icon: 'health_and_safety', access: 'view_edit' },
    { module: 'Incidents',              icon: 'report_problem',    access: 'view_edit' },
    { module: 'Risk & COSHH',           icon: 'science',           access: 'view_only' },
    { module: 'Document Control',       icon: 'folder_managed',    access: 'view_only' },
    { module: 'Compliance Dashboard',   icon: 'verified_user',     access: 'view_only' },
    { module: 'User Access',            icon: 'manage_accounts',   access: 'no_access' },
  ],
  'CMS Operator': [
    { module: 'Dashboard',              icon: 'dashboard',         access: 'view_only' },
    { module: 'Staff Management',       icon: 'groups',            access: 'no_access' },
    { module: 'Clients & Sites',        icon: 'handshake',         access: 'view_only' },
    { module: 'Training & Certification', icon: 'school',          access: 'view_only' },
    { module: 'PPE Management',         icon: 'health_and_safety', access: 'no_access' },
    { module: 'Incidents',              icon: 'report_problem',    access: 'view_only' },
    { module: 'Risk & COSHH',           icon: 'science',           access: 'full' },
    { module: 'Document Control',       icon: 'folder_managed',    access: 'full' },
    { module: 'Compliance Dashboard',   icon: 'verified_user',     access: 'full' },
    { module: 'User Access',            icon: 'manage_accounts',   access: 'no_access' },
  ],
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  Admin:          'Full system access. Can manage all modules, users, and settings.',
  Supervisor:     'Operational access. Can manage staff, sites, training, PPE, and incidents.',
  'CMS Operator': 'Compliance & documentation. Full access to documents, risk assessments, and COSHH.',
};
