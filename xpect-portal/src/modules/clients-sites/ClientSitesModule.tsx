import React, { useState, useEffect } from 'react';
import ClientsList    from './ClientsList';
import ClientDetail   from './ClientDetail';
import SitesList      from './SitesList';
import SiteDetail     from './SiteDetail';
import SiteAllocation from './SiteAllocation';
import {
  CSState,
  getState,
  subscribe,
  syncFromPathname,
  csNavigate,
} from './csNavStore';

const ClientSitesModule: React.FC = () => {
  const [csState, setCsState] = useState<CSState>(() => {
    syncFromPathname(window.location.pathname);
    return getState();
  });

  useEffect(() => {
    const unsub = subscribe(setCsState);
    const handlePopState = () => {
      syncFromPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      unsub();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const goToClients    = ()           => csNavigate('clients');
  const goToClient     = (id: string) => csNavigate('client-detail', id);
  const goToSites      = ()           => csNavigate('sites');
  const goToSite       = (id: string) => csNavigate('site-detail', id);
  const goToAllocation = ()           => csNavigate('allocation');

  const isDetailOrAllocation =
    csState.view === 'client-detail' ||
    csState.view === 'site-detail' ||
    csState.view === 'allocation';

  const SUB_NAV: { key: CSState['view']; label: string; icon: string }[] = [
    { key: 'clients',    label: 'Clients',         icon: 'handshake' },
    { key: 'sites',      label: 'Work Sites',      icon: 'location_city' },
    { key: 'allocation', label: 'Site Allocation', icon: 'assignment_ind' },
  ];

  const renderContent = () => {
    switch (csState.view) {
      case 'clients':
        return (
          <ClientsList
            onSelectClient={goToClient}
            onNavigateSites={goToSites}
            onNavigateAllocation={goToAllocation}
          />
        );
      case 'client-detail':
        return (
          <ClientDetail
            clientId={csState.id ?? ''}
            onBack={goToClients}
            onSelectSite={goToSite}
          />
        );
      case 'sites':
        return (
          <SitesList
            onSelectSite={goToSite}
            onNavigateAllocation={goToAllocation}
          />
        );
      case 'site-detail':
        return (
          <SiteDetail
            siteId={csState.id ?? ''}
            onBack={goToSites}
          />
        );
      case 'allocation':
        return (
          <SiteAllocation
            onBack={goToSites}
          />
        );
      default:
        return (
          <ClientsList
            onSelectClient={goToClient}
            onNavigateSites={goToSites}
            onNavigateAllocation={goToAllocation}
          />
        );
    }
  };

  return (
    <div className={`flex-1 flex flex-col w-full animate-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-160px)] ${csState.view === 'allocation' ? '' : 'py-[15px] sm:py-8 px-4 sm:px-6 md:px-10'}`}>
      <div className="w-full space-y-6">

        {/* Page header — hidden on detail/allocation views */}
        {!isDetailOrAllocation && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-bold font-black">Client &amp; Site Management</h1>
              <p className="text-[#4c669a] text-base">
                Manage clients, work sites, and worker compliance allocations.
              </p>
            </div>
            <div className="flex items-center gap-1 bg-white border border-[#e7ebf3] rounded-full p-1">
              {SUB_NAV.map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => csNavigate(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
                    csState.view === tab.key
                      ? 'bg-[#2e4150] text-white shadow-sm'
                      : 'text-[#4c669a] hover:bg-[#f2f6f9]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sub-view content */}
        {renderContent()}

      </div>
    </div>
  );
};

export default ClientSitesModule;
