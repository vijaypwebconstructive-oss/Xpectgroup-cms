/**
 * Client & Sites Navigation Store
 *
 * Reactive, module-level store that lives OUTSIDE React so it survives
 * component remounts caused by the top-level History API router.
 *
 * URL ↔ View mapping (bidirectional):
 *   /clients            → { view: 'clients' }
 *   /clients/:id        → { view: 'client-detail', id }
 *   /sites              → { view: 'sites' }
 *   /sites/:id          → { view: 'site-detail', id }
 *   /site-allocation    → { view: 'allocation' }
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type CSView =
  | 'clients'
  | 'client-detail'
  | 'sites'
  | 'site-detail'
  | 'allocation';

export interface CSState {
  view: CSView;
  /** Entity ID — populated for 'client-detail' and 'site-detail' */
  id: string | null;
}

type Listener = (state: CSState) => void;

// ── URL → State parser ────────────────────────────────────────────────────────

export const parsePathname = (pathname: string): CSState => {
  // /clients/:id
  const clientDetail = pathname.match(/^\/clients\/([^/]+)$/);
  if (clientDetail) return { view: 'client-detail', id: clientDetail[1] };

  // /sites/:id
  const siteDetail = pathname.match(/^\/sites\/([^/]+)$/);
  if (siteDetail) return { view: 'site-detail', id: siteDetail[1] };

  // /site-allocation
  if (pathname === '/site-allocation') return { view: 'allocation', id: null };

  // /sites
  if (pathname.startsWith('/sites')) return { view: 'sites', id: null };

  // /clients (default / fallback)
  return { view: 'clients', id: null };
};

// ── State → URL builder ───────────────────────────────────────────────────────

export const buildPathname = (state: CSState): string => {
  switch (state.view) {
    case 'client-detail': return state.id ? `/clients/${state.id}` : '/clients';
    case 'sites':         return '/sites';
    case 'site-detail':   return state.id ? `/sites/${state.id}` : '/sites';
    case 'allocation':    return '/site-allocation';
    case 'clients':
    default:              return '/clients';
  }
};

// ── Store ─────────────────────────────────────────────────────────────────────

let _state: CSState = parsePathname(
  typeof window !== 'undefined' ? window.location.pathname : '/clients'
);

const _listeners = new Set<Listener>();

/** Read current state */
export const getState = (): CSState => ({ ..._state });

/** Subscribe to state changes — returns unsubscribe fn */
export const subscribe = (listener: Listener): (() => void) => {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
};

const _notify = () => {
  const snap = getState();
  _listeners.forEach(fn => fn(snap));
};

/**
 * Navigate to a CS sub-view.
 * Pushes the correct URL to the browser history and notifies subscribers.
 * Does NOT dispatch a popstate event — we use our own subscriber pattern
 * to avoid re-triggering App.tsx's top-level popstate handler.
 */
export const csNavigate = (view: CSView, id?: string, replace = false): void => {
  const next: CSState = { view, id: id ?? null };
  _state = next;

  const path = buildPathname(next);
  if (replace) {
    window.history.replaceState({ csView: view, csId: id ?? null }, '', path);
  } else {
    window.history.pushState({ csView: view, csId: id ?? null }, '', path);
  }

  _notify();
};

/**
 * Sync state from a pathname WITHOUT pushing to history.
 * Called when the browser's popstate fires or when App.tsx renders
 * this module for the first time at a sub-path URL.
 */
export const syncFromPathname = (pathname: string): void => {
  const next = parsePathname(pathname);
  _state = next;
  _notify();
};

// ── Legacy pending-page API (kept for AdminLayout compatibility) ───────────────
// The sidebar still calls setPendingPage; ClientSitesModule ignores it now
// because it reads the URL directly on mount.
export type CSPage = 'clients-list' | 'client-detail' | 'sites-list' | 'site-detail' | 'site-allocation';
export const setPendingPage = (_page: CSPage): void => { /* no-op — URL is the source of truth */ };
export const consumePendingPage = (): CSPage | null => null;
