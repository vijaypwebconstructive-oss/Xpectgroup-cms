import React, { useState, useEffect, useRef } from 'react';
import { AppView } from '../types';
import api from '../services/api';
import ProfileModal from './ProfileModal';
import { csNavigate, CSView } from '../modules/clients-sites/csNavStore';
import { docNavigate, DocView } from '../modules/document-control/docNavStore';
import { riskNavigate, RiskView } from '../modules/risk-coshh/riskNavStore';
import { incidentNavigate, IncidentView } from '../modules/incidents/incidentNavStore';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView, cleaner?: any) => void;
}

interface AdminProfile {
  id?: string;
  name?: string;
  email?: string;
  profilePicture?: string | null;
  bio?: string;
  role?: string;
}

const COMPLIANCE_VIEWS: AppView[] = ['EMPLOYEE_COMPLIANCE', 'CLEANERS_LIST', 'CLEANER_DETAIL', 'REPORT', 'STAFF_INVITES', 'TRAINING_CERTIFICATION', 'PPE_LIST'];
const CLIENT_SITES_VIEWS: AppView[] = ['CLIENTS_SITES'];
const DOC_CONTROL_VIEWS: AppView[] = ['DOCUMENT_CONTROL'];
const RISK_COSHH_VIEWS: AppView[]  = ['RISK_COSHH'];
const INCIDENTS_VIEWS: AppView[]   = ['INCIDENTS'];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentView, onNavigate }) => {
  const [profile, setProfile]                             = useState<AdminProfile>({});
  const [isProfileModalOpen, setIsProfileModalOpen]       = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen]                 = useState(false);
  const [isComplianceOpen, setIsComplianceOpen]           = useState(COMPLIANCE_VIEWS.includes(currentView));
  const [isClientSitesOpen, setIsClientSitesOpen]         = useState(CLIENT_SITES_VIEWS.includes(currentView));
  const [isDocControlOpen, setIsDocControlOpen]           = useState(DOC_CONTROL_VIEWS.includes(currentView));
  const [isRiskCoshhOpen, setIsRiskCoshhOpen]             = useState(RISK_COSHH_VIEWS.includes(currentView));
  const [isIncidentsOpen, setIsIncidentsOpen]             = useState(INCIDENTS_VIEWS.includes(currentView));
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.admin.getProfile();
        setProfile(data);
      } catch (err) {
        console.warn('Failed to fetch admin profile:', err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen]);

  const handleProfileUpdate = async () => {
    try {
      const data = await api.admin.getProfile();
      setProfile(data);
    } catch (err) {
      console.warn('Failed to refresh admin profile:', err);
    }
  };

  useEffect(() => {
    if (COMPLIANCE_VIEWS.includes(currentView)) {
      setIsComplianceOpen(true);
    }
    if (CLIENT_SITES_VIEWS.includes(currentView)) {
      setIsClientSitesOpen(true);
    }
    if (DOC_CONTROL_VIEWS.includes(currentView)) {
      setIsDocControlOpen(true);
    }
    if (RISK_COSHH_VIEWS.includes(currentView)) {
      setIsRiskCoshhOpen(true);
    }
    if (INCIDENTS_VIEWS.includes(currentView)) {
      setIsIncidentsOpen(true);
    }
  }, [currentView]);

  const handleNav = (view: AppView) => {
    onNavigate(view);
    setIsSidebarOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#2e4150] w-64">
      {/* Logo */}
      <div
        className="flex items-center px-6 py-5 border-b border-white/10 cursor-pointer shrink-0"
        onClick={() => handleNav('DASHBOARD')}
      >
        <img src="/logo.webp" alt="Xpect Group" className="h-10 w-auto" />
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        <button
          onClick={() => handleNav('DASHBOARD')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            currentView === 'DASHBOARD'
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          Dashboard
        </button>

        {/* Audit & Compliance Dashboard */}
        <button
          onClick={() => handleNav('COMPLIANCE_DASHBOARD')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            currentView === 'COMPLIANCE_DASHBOARD'
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">shield_with_heart</span>
          Compliance Dashboard
        </button>

        {/* Employee Compliance — click to expand/collapse sub-modules */}
        <div>
          {/* Main module button */}
          <button
            type="button"
            onClick={() => setIsComplianceOpen(o => !o)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              COMPLIANCE_VIEWS.includes(currentView)
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
            <span className="flex-1 text-left">Employee Compliance</span>
            <span className={`material-symbols-outlined text-[18px] opacity-70 transition-transform duration-200 ${isComplianceOpen ? 'rotate-90' : ''}`}>
              chevron_right
            </span>
          </button>

          {/* Sub-modules — shown when isComplianceOpen is true */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isComplianceOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="mt-0.5 ml-3 pl-3 border-l border-white/20 space-y-0.5">
              <button
                onClick={() => handleNav('CLEANERS_LIST')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  currentView === 'CLEANERS_LIST' || currentView === 'CLEANER_DETAIL' || currentView === 'REPORT'
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">group</span>
                Staff
              </button>
              <button
                onClick={() => handleNav('TRAINING_CERTIFICATION')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  currentView === 'TRAINING_CERTIFICATION'
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">school</span>
                Training &amp; Certification
              </button>
              <button
                onClick={() => handleNav('PPE_LIST')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  currentView === 'PPE_LIST'
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">safety_check</span>
                PPE Records
              </button>
            </div>
          </div>
        </div>

        {/* Client & Site Management — click to expand/collapse */}
        <div>
          <button
            type="button"
            onClick={() => setIsClientSitesOpen(o => !o)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              CLIENT_SITES_VIEWS.includes(currentView)
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">location_city</span>
            <span className="flex-1 text-left">Clients &amp; Sites</span>
            <span className={`material-symbols-outlined text-[18px] opacity-70 transition-transform duration-200 ${isClientSitesOpen ? 'rotate-90' : ''}`}>
              chevron_right
            </span>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isClientSitesOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="mt-0.5 ml-3 pl-3 border-l border-white/20 space-y-0.5">
              {(
                [
                  { csView: 'clients'    as CSView, icon: 'handshake',      label: 'Clients' },
                  { csView: 'sites'      as CSView, icon: 'location_on',    label: 'Sites' },
                  { csView: 'allocation' as CSView, icon: 'assignment_ind', label: 'Site Allocation' },
                ] as { csView: CSView; icon: string; label: string }[]
              ).map(({ csView, icon, label }) => (
                <button
                  key={csView}
                  onClick={() => {
                    // 1. Navigate the CS store + push URL (csNavigate handles pushState)
                    csNavigate(csView);
                    // 2. Tell App.tsx to render ClientSitesModule if not already
                    onNavigate('CLIENTS_SITES');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Incidents — click to expand/collapse */}
        <div>
          <button
            type="button"
            onClick={() => setIsIncidentsOpen(o => !o)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              INCIDENTS_VIEWS.includes(currentView)
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">report_problem</span>
            <span className="flex-1 text-left">Incidents</span>
            <span className={`material-symbols-outlined text-[18px] opacity-70 transition-transform duration-200 ${isIncidentsOpen ? 'rotate-90' : ''}`}>
              chevron_right
            </span>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isIncidentsOpen ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="mt-0.5 ml-3 pl-3 border-l border-white/20 space-y-0.5">
              {(
                [
                  { incView: 'list'    as IncidentView, icon: 'format_list_bulleted', label: 'All Incidents' },
                  { incView: 'create'  as IncidentView, icon: 'add_circle',           label: 'Report Incident' },
                  { incView: 'actions' as IncidentView, icon: 'build_circle',         label: 'Corrective Actions' },
                ] as { incView: IncidentView; icon: string; label: string }[]
              ).map(({ incView, icon, label }) => (
                <button
                  key={incView}
                  onClick={() => {
                    incidentNavigate(incView);
                    onNavigate('INCIDENTS');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Risk & COSHH — click to expand/collapse */}
        <div>
          <button
            type="button"
            onClick={() => setIsRiskCoshhOpen(o => !o)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              RISK_COSHH_VIEWS.includes(currentView)
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
            <span className="flex-1 text-left">Risk &amp; COSHH</span>
            <span className={`material-symbols-outlined text-[18px] opacity-70 transition-transform duration-200 ${isRiskCoshhOpen ? 'rotate-90' : ''}`}>
              chevron_right
            </span>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isRiskCoshhOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="mt-0.5 ml-3 pl-3 border-l border-white/20 space-y-0.5">
              {(
                [
                  { riskView: 'risk-list'      as RiskView, icon: 'assignment',      label: 'Risk Assessments' },
                  { riskView: 'rams-list'       as RiskView, icon: 'assignment_add',  label: 'RAMS' },
                  { riskView: 'coshh-register'  as RiskView, icon: 'science',         label: 'COSHH Register' },
                  { riskView: 'sds-library'     as RiskView, icon: 'menu_book',       label: 'SDS Library' },
                ] as { riskView: RiskView; icon: string; label: string }[]
              ).map(({ riskView, icon, label }) => (
                <button
                  key={riskView}
                  onClick={() => {
                    riskNavigate(riskView);
                    onNavigate('RISK_COSHH');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Document Control — click to expand/collapse */}
        <div>
          <button
            type="button"
            onClick={() => setIsDocControlOpen(o => !o)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              DOC_CONTROL_VIEWS.includes(currentView)
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">folder_managed</span>
            <span className="flex-1 text-left">Document Control</span>
            <span className={`material-symbols-outlined text-[18px] opacity-70 transition-transform duration-200 ${isDocControlOpen ? 'rotate-90' : ''}`}>
              chevron_right
            </span>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDocControlOpen ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="mt-0.5 ml-3 pl-3 border-l border-white/20 space-y-0.5">
              {(
                [
                  { docView: 'library'   as DocView, icon: 'library_books',  label: 'Documents Library' },
                  { docView: 'approvals' as DocView, icon: 'task_alt',       label: 'Approvals' },
                  { docView: 'reviews'   as DocView, icon: 'event',          label: 'Review Calendar' },
                  { docView: 'create'    as DocView, icon: 'post_add',       label: 'New Document' },
                ] as { docView: DocView; icon: string; label: string }[]
              ).map(({ docView, icon, label }) => (
                <button
                  key={docView}
                  onClick={() => {
                    docNavigate(docView);
                    onNavigate('DOCUMENT_CONTROL');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Profile section */}
      <div className="px-3 pb-4 pt-3 border-t border-white/10 shrink-0" ref={dropdownRef}>
        {isProfileDropdownOpen && (
          <div className="mb-2 bg-white rounded-xl shadow-lg py-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="font-bold text-gray-900 text-sm truncate">{profile.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{profile.email || 'admin@xpectgroup.com'}</p>
            </div>
            <button
              onClick={() => { setIsProfileModalOpen(true); setIsProfileDropdownOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Edit Profile
            </button>
          </div>
        )}

        <button
          type="button"
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-white/10 transition-all text-left"
          onClick={() => setIsProfileDropdownOpen(prev => !prev)}
        >
          <div
            className="w-9 h-9 rounded-full border-2 border-white/30 bg-cover bg-center shrink-0 flex items-center justify-center bg-white/10"
            style={{ backgroundImage: profile.profilePicture ? `url('${profile.profilePicture}')` : 'none' }}
          >
            {!profile.profilePicture && (
              <span className="material-symbols-outlined text-white/70 text-xl">person</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold truncate">{profile.name || 'Admin'}</p>
            <p className="text-white/50 text-xs truncate">{profile.role || 'Administrator'}</p>
          </div>
          <span className="material-symbols-outlined text-white/50 text-base transition-transform duration-200" style={{ transform: isProfileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            expand_more
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f2f6f9]">
      {/* Desktop sidebar — fixed, full height */}
      <div className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 z-40 shadow-xl">
        {sidebarContent}
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 shadow-2xl z-10 animate-in slide-in-from-left-4 duration-300">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex flex-col flex-1 lg:ml-64 min-h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#2e4150] sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white">menu</span>
          </button>
          <img
            src="/logo.webp"
            alt="Xpect Group"
            className="h-8 w-auto cursor-pointer"
            onClick={() => handleNav('DASHBOARD')}
          />
          <div className="w-10" />
        </div>

        <main className="flex-1 bg-[#f2f6f9]">
          {children}
        </main>

        <footer className="py-2 px-4 text-center text-[#4c669a] text-sm border-t border-[#e7ebf3] bg-white">
          <p>© 2026 Xpect Group. All worker records are encrypted and stored in compliance with GDPR regulations.</p>
        </footer>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default AdminLayout;
