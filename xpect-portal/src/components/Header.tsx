import React, { useState, useEffect, useRef } from 'react';
import { AppView } from '../types';
import api from '../services/api';
import ProfileModal from './ProfileModal';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

interface AdminProfile {
  id?: string;
  name?: string;
  email?: string;
  profilePicture?: string | null;
  bio?: string;
  role?: string;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const [profile, setProfile] = useState<AdminProfile>({});
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch admin profile on mount
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleProfileUpdate = async () => {
    try {
      const data = await api.admin.getProfile();
      setProfile(data);
    } catch (err) {
      console.warn('Failed to refresh admin profile:', err);
    }
  };
  const links = [
    { label: 'Dashboard', view: 'DASHBOARD' as AppView },
    { label: 'Staff', view: 'CLEANERS_LIST' as AppView },
  ];

  const showAddButton = currentView !== 'ONBOARDING';

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7ebf3] bg-white px-6 md:px-10 py-3 sticky top-0 z-50">
      <div className="flex items-center gap-3 text-[#0d121b] cursor-pointer" onClick={() => onNavigate('DASHBOARD')}>
        {/* <h2 className="text-xl font-black leading-tight tracking-tight text-[#101622]">Xpect Group</h2> */}
        <img src="/logo.webp" alt="Xpect Group" className="w-18 h-18" />
      </div>
      <div className="flex flex-1 justify-end gap-8 items-center">
        <nav className="hidden lg:flex items-center gap-9">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => onNavigate(link.view)}
              className={`text-md font-bold leading-normal transition-colors cursor-pointer ${
                currentView === link.view && link.view !== 'DASHBOARD'
                  ? 'text-[#0f2542] font-bold border-b-2 border-[#2e4150] '
                  : 'text-[#0f2542] font-bold hover:text-[#2e4150]'
              } ${currentView === 'DASHBOARD' && link.view === 'DASHBOARD' ? 'text-[#0d121b] font-bold border-b-2 border-[#2e4150] ' : ''}`}
            >
              {link.label}
            </button>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          {/* Mobile Staff List Button */}
        <button
          onClick={() => onNavigate('CLEANERS_LIST')}
          className="lg:hidden flex items-center justify-center gap-2 rounded-md bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-all p-3 h-10 cursor-pointer"
          title="Staff List"
        >
          <span className="material-symbols-outlined text-xl">group</span>
        </button>
          {showAddButton && (<>
            {/* <button 
              onClick={() => onNavigate('ONBOARDING')}
              className="flex min-w-[84px] font-[Montserrat] cursor-pointer items-center justify-center rounded-full h-10 px-[30px] py-[15px] bg-[#2e4150] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#2e4150]/90 transition-colors animate-in fade-in slide-in-from-right-2 duration-300"
            >
              <span className="truncate font-semibold font-[14px] ">Add New Staff</span>
            </button> */}

            <button 
              onClick={() => onNavigate('STAFF_INVITES')}
              className="flex items-center justify-center gap-2 rounded-md  bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150] sm:rounded-full sm:px-[30px] sm:py-[15px] transition-all p-4 h-10 cursor-pointer "
            >
              <span className="material-symbols-outlined text-[30px] ">person_add</span>
              <span className='hidden md:block'>Add Staff</span>
            </button>

</>
        //      <button 
        //   onClick={() => onNavigate('ONBOARDING')}
        //   className="flex items-center gap-2 bg-[#2e4150] hover:bg-[#2e4150]/90 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all "
        // >
        //   <span className="material-symbols-outlined text-lg font-bold">Add New Staff</span>
          
        // </button> 
          )}
          <div className="relative" ref={dropdownRef}>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-14 border border-[#e7ebf3] cursor-pointer flex items-center justify-center"
              style={{ backgroundImage: profile.profilePicture ? `url('${profile.profilePicture}')` : 'none' }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {!profile.profilePicture && (
                <span className="material-symbols-outlined text-gray-400 text-3xl">person</span>
              )}
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="font-bold text-gray-900">{profile.name || 'Admin'}</p>
                  <p className="text-sm text-gray-500">{profile.email || 'admin@xpectgroup.com'}</p>
                  {profile.role && <p className="text-xs text-gray-400 mt-1">{profile.role}</p>}
                </div>
                <button
                  onClick={() => { setIsProfileModalOpen(true); setIsDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onUpdate={handleProfileUpdate}
      />
    </header>
  );
};

export default Header;