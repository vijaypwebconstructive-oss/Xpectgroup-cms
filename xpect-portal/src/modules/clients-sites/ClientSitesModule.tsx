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

/**
 * ClientSitesModule
 *
 * Owns the internal navigation for the Clients & Sites section.
 * URL is the single source of truth:
 *
 *   /clients            → <ClientsList>
 *   /clients/:id        → <ClientDetail id=id>
 *   /sites              → <SitesList>
 *   /sites/:id          → <SiteDetail id=id>
 *   /site-allocation    → <SiteAllocation>
 *
 * On mount  → reads window.location.pathname → syncs store
 * On popstate → re-reads pathname → syncs store → re-renders
 * On navigate → calls csNavigate() → pushState + syncs store → re-renders
 */
const ClientSitesModule: React.FC = () => {
  // Initialise from the current URL (handles direct URL entry, page refresh,
  // and the case where App.tsx remounts this component after popstate)
  const [csState, setCsState] = useState<CSState>(() => {
    syncFromPathname(window.location.pathname);
    return getState();
  });

  useEffect(() => {
    // Keep local state in sync whenever the store changes
    const unsub = subscribe(setCsState);

    // Handle browser back/forward: re-sync from the new pathname.
    // We catch popstate here BEFORE App.tsx re-mounts this component
    // so the view is already correct on the very first render after back/forward.
    const handlePopState = () => {
      syncFromPathname(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      unsub();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // ── Navigation helpers (push URL + update store) ────────────────────────────

  const goToClients   = ()           => csNavigate('clients');
  const goToClient    = (id: string) => csNavigate('client-detail', id);
  const goToSites     = ()           => csNavigate('sites');
  const goToSite      = (id: string) => csNavigate('site-detail', id);
  const goToAllocation= ()           => csNavigate('allocation');

  // ── Render ──────────────────────────────────────────────────────────────────

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

export default ClientSitesModule;
