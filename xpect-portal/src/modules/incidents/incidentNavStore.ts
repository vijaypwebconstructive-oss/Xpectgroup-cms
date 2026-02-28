/**
 * Incident Register Navigation Store
 *
 * URL ↔ View mapping:
 *   /incidents          → "list"
 *   /incidents/new      → "create"
 *   /incidents/:id      → "detail"   (catch-all — must be last)
 */

export type IncidentView = 'list' | 'create' | 'detail';

export interface IncidentNavState {
  view: IncidentView;
  id: string | null;
}

type Listener = (state: IncidentNavState) => void;

export const parseIncidentPathname = (pathname: string): IncidentNavState => {
  if (pathname === '/incidents/new') return { view: 'create', id: null };

  const detail = pathname.match(/^\/incidents\/([^/]+)$/);
  if (detail) return { view: 'detail', id: detail[1] };

  return { view: 'list', id: null };
};

export const buildIncidentPathname = (state: IncidentNavState): string => {
  switch (state.view) {
    case 'create': return '/incidents/new';
    case 'detail': return state.id ? `/incidents/${state.id}` : '/incidents';
    case 'list':
    default:       return '/incidents';
  }
};

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
