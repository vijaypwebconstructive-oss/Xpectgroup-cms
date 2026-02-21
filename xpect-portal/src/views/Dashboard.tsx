
import React, { useMemo, useState, useEffect } from 'react';
import { AppView, VerificationStatus, Cleaner, ActivityLog } from '../types';
import { useCleaners } from '../context/CleanersContext';
import api from '../services/api';


interface DashboardProps {
  onNavigate: (view: AppView, cleaner?: Cleaner) => void;
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
  region: string;
  avatar?: string;
  cleanerId?: string;
  timestamp?: number; // Internal use for sorting
}


const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { cleaners } = useCleaners();
  const pendingCount = cleaners.filter(c => c.verificationStatus === VerificationStatus.PENDING).length;
  const verifiedCount = cleaners.filter(c => c.verificationStatus === VerificationStatus.VERIFIED).length;
  const [invitations, setInvitations] = useState<any[]>([]);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // Fetch admin profile for avatar
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const profile = await api.admin.getProfile();
        setAdminProfile(profile);
      } catch (err) {
        console.warn('Failed to fetch admin profile:', err);
      }
    };
    fetchAdminProfile();
  }, []);

  // Fetch invitations to track admin actions and active tasks
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const data = await api.invitations.getAll();
        setInvitations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Failed to fetch invitations for activity:', err);
        setInvitations([]);
      }
    };
    fetchInvitations();
    
    // Auto-refresh invitations every 10 seconds to keep active tasks count updated
    const interval = setInterval(() => {
      fetchInvitations();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setActivitiesLoading(true);
        const data = await api.activity.getRecent(50);
        setActivities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Failed to fetch activities:', err);
        setActivities([]);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchActivities();
    
    // Auto-refresh activities every 30 seconds
    const interval = setInterval(() => {
      fetchActivities();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Transform activity logs to ActivityItem format
  const recentActivity = useMemo<ActivityItem[]>(() => {
    if (activitiesLoading || activities.length === 0) {
      return [];
    }

    return activities.map((activity: ActivityLog) => {
      // Find cleaner for avatar and region if entity is Cleaner
      let cleaner: Cleaner | undefined;
      let avatar: string | undefined;
      let region = 'System';
      let cleanerId: string | undefined;

      if (activity.entityType === 'Cleaner' || activity.entityType === 'Document' || activity.entityType === 'Invitation') {
        cleaner = cleaners.find(c => c.id === activity.entityId);
        if (cleaner) {
          avatar = cleaner.avatar;
          region = cleaner.location || 'Unknown';
          cleanerId = cleaner.id;
        }
      }

      // Use admin profile picture for admin activities
      if (activity.actorRole === 'admin' && adminProfile?.profilePicture) {
        avatar = adminProfile.profilePicture;
      }

      // Parse timestamp
      const timestamp = new Date(activity.createdAt).getTime();

      return {
        id: activity._id,
        user: activity.actorName,
        action: activity.message.replace(activity.actorName, '').trim(),
        time: getRelativeTime(new Date(activity.createdAt)),
        region: region,
        avatar: avatar,
        cleanerId: cleanerId,
        timestamp: timestamp
      };
    });
  }, [activities, cleaners, adminProfile, activitiesLoading]);

  // Helper function to get relative time string
  function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  
  // Calculate invitations sent count
  const invitationsCount = invitations.length;

  const stats = [
    { label: 'Total Staff', value: cleaners.length.toLocaleString(), trend: 'Real-time', icon: 'group', color: 'blue', bgColor:"#eff6ff" , borderColor:"#2563eb" },
    { label: 'Pending Verification', value: pendingCount.toString(), trend: 'Actionable', icon: 'pending_actions', color: 'amber', bgColor:"#fffbeb", borderColor:"#f59e0b" },
    { label: 'Verified Employees', value: verifiedCount.toString(), trend: 'Compliant', icon: 'verified_user', color: 'green', bgColor:"#f0fdf4", borderColor:"#22c55e" },
    { label: 'Invitations Sent', value: invitationsCount.toString(), trend: 'Active', icon: 'mail', color: 'purple', bgColor:"#f3e8ff", borderColor:"#9333ea" },
  ];

  return (
    <div className="px-[24px] sm:px-[32px] py-[15px] sm:py-[32px] max-w-[1400px] mx-auto space-y-4 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-[1.7rem] sm:text-3xl font-black text-gray-900 font-bold font-[Inter Tight ] tracking-tight">Dashboard Overview</h2>
          <p className="text-[#42617c] mb-0 sm:mb-0">Manage staff onboarding, background checks, and compliance status for Xpect Group.</p>
        </div>
        {/* <button 
          onClick={() => onNavigate('ONBOARDING')}
          className="flex items-center gap-2 bg-[#2e4150] hover:bg-[#2e4150]/90 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all "
        >
          <span className="material-symbols-outlined text-lg font-bold">person_add</span>
          Add New Staff
        </button> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"   style={{
            
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderBottomColor = stat.borderColor;
            e.currentTarget.style.borderBottomWidth = "5px";
            e.currentTarget.style.borderBottomStyle = "solid";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderBottomColor = 'transparent';
          }}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 sm:p-4 text-${stat.color}-600 rounded-lg `}  style={{
    backgroundColor: stat.bgColor,
    color: stat.borderColor,
  }
  }>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-full">
                {stat.trend}
              </span>
            </div>
            <p className="text-base font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="text-3xl font-black text-gray-900 font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-4 py-3 sm:px-6 sm:py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold ">Recent Activity</h3>
            {/* {recentActivity.length > 0 && (
              <button 
                onClick={() => onNavigate('DASHBOARD')}
                className="text-[#2e4150] text-sm font-semibold hover:text-[#135bec] hover:cursor-pointer transition-colors"
              >
                View All Activity
              </button>
            )} */}
          </div>
          <div className="flex-1 flex flex-col p-0 sm:p-1.5 text-center overflow-y-scroll max-h-[470px]">
            {recentActivity.length > 0 ? (
              <div className="w-full divide-y divide-gray-100">
                {recentActivity.map((activity) => {
                  // Calculate if activity is more than 6 hours old
                  const activityAge = activity.timestamp ? (Date.now() - activity.timestamp) / (1000 * 60 * 60) : 0;
                  const isActive = activityAge <= 6; // Active if less` than or equal to 6 hours
                  const dotColor = isActive ? 'bg-emerald-500' : 'bg-gray-400';
                  
                  return (
                    <div 
                      key={activity.id} 
                      className="px-4 py-3 flex items-center gap-4 hover:bg-gray-50 transition-all cursor-pointer group"
                      onClick={() => {
                        if (activity.cleanerId) {
                          const cleaner = cleaners.find(c => c.id === activity.cleanerId);
                          if (cleaner) {
                            onNavigate('CLEANER_DETAIL', cleaner);
                          }
                        }
                      }}
                    >
                      <div className="relative shrink-0" style={{ width: '56px', height: '56px' }}>
                        <div className="size-14 sm:size-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                          {activity.avatar ? (
                            <img src={activity.avatar} alt={activity.user} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-gray-400 text-2xl">
                              {activity.user === 'Admin' ? 'admin_panel_settings' : 'person'}
                            </span>
                          )}
                        </div>
                        <span 
                          className={`dot w-[14px] h-[14px] absolute rounded-full ${dotColor} border-2 border-white`}
                          style={{
                            right: '0px',
                            bottom: '0px',
                            zIndex: 10
                          }}
                        ></span>
                      </div>
                      <div className="flex flex-col gap-1 min-w-0 text-left flex-1">
                        <p className="text-base font-bold text-gray-900 truncate">
                          {activity.user} <span className="font-normal text-base text-gray-500">{activity.action}</span>
                        </p>
                        <p className="mt-0.5 flex gap-2 text-sm text-gray-400">
                          <span>{activity.time}</span>
                          <span>•</span>
                          <span>{activity.region}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-gray-300 text-3xl">history</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900">No activity yet</h4>
                <p className="text-gray-500 max-w-sm mt-1">When staff members complete onboarding or upload documents, they will appear here.</p>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#304d6c] text-white rounded-2xl p-4 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="relative z-10">
              <h3 className="text-[1.475rem] sm:text-[1.675rem] font-bold font-black mb-2">Compliance Health</h3>
              <p className="text-white/80 text-base mb-2 sm:mb-4">Global compliance rating for Xpect Group operations.</p>
              <div className="text-4xl sm:text-6xl font-bold font-black">100%</div>
            </div>
            <div className="mt-4 relative z-10">
              <div className="w-full bg-white/20 h-2 rounded-full mb-2">
                <div className="bg-[#34d399] h-2 rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
              </div>
              <div className="mt-4 sm:mt-7 glass p-2 sm:p-4 rounded-xl">
<div className="flex items-center gap-3">
<div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
<p className="text-xs font-medium text-emerald-100">System operational and secure.</p>
</div>
</div>
              {/* <p className="text-base text-white/90 ">System operational and secure.</p> */}
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <span className="material-symbols-outlined text-[160px]">shield</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-[1.475rem] sm:text-[1.675rem]">Urgent Actions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center p-4 sm:p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest text-center">No Urgent Tasks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
