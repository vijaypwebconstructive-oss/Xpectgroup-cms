/**
 * Incident & Corrective Action Navigation Store
 *
 * Reactive module-level store that lives OUTSIDE React so it survives
 * component remounts caused by the top-level History API router.
 *
 * URL ↔ View mapping:
 *   /incidents          → "list"
 *   /incidents/new      → "create"
 *   /incidents/actions  → "actions"
 *   /incidents/:id      → "detail"   (catch-all — must be last)
 */

export type IncidentView = 'list' | 'create' | 'detail' | 'actions';

export interface IncidentNavState {
  view: IncidentView;
  id: string | null;
}

type Listener = (state: IncidentNavState) => void;

// ── URL → State ───────────────────────────────────────────────────────────────

export const parseIncidentPathname = (pathname: string): IncidentNavState => {
  if (pathname === '/incidents/new')     return { view: 'create',  id: null };
  if (pathname === '/incidents/actions') return { view: 'actions', id: null };

  const detail = pathname.match(/^\/incidents\/([^/]+)$/);
  if (detail) return { view: 'detail', id: detail[1] };

  return { view: 'list', id: null };
};

// ── State → URL ───────────────────────────────────────────────────────────────

export const buildIncidentPathname = (state: IncidentNavState): string => {
  switch (state.view) {
    case 'create':  return '/incidents/new';
    case 'actions': return '/incidents/actions';
    case 'detail':  return state.id ? `/incidents/${state.id}` : '/incidents';
    case 'list':
    default:        return '/incidents';
  }
};

// ── Store ─────────────────────────────────────────────────────────────────────

let _state: IncidentNavState = parseIncidentPathname(
  typeof window !== 'undefined' ? window.location.pathname : '/incidents'
);

const _listeners = new Set<Listener>();

export const getIncidentState = (): IncidentNavState => ({ ..._state });

export const subscribeIncident = (listener: Listener): (() => void) => {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
};

const _notify = () => {
  const snap = getIncidentState();
  _listeners.forEach(fn => fn(snap));
};

export const incidentNavigate = (view: IncidentView, id?: string, replace = false): void => {
  const next: IncidentNavState = { view, id: id ?? null };
  _state = next;
  const path = buildIncidentPathname(next);
  if (replace) {
    window.history.replaceState({ incView: view, incId: id ?? null }, '', path);
  } else {
    window.history.pushState({ incView: view, incId: id ?? null }, '', path);
  }
  _notify();
};

export const syncIncidentFromPathname = (pathname: string): void => {
  const next = parseIncidentPathname(pathname);
  _state = next;
  _notify();
};
