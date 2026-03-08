/**
 * Prospect Navigation Store
 *
 * URL ↔ View mapping:
 *   /prospects       → "list"
 *   /prospects/new   → "create"
 *   /prospects/:id   → "detail"
 */

export type ProspectView = 'list' | 'create' | 'detail';

export interface ProspectNavState {
  view: ProspectView;
  id: string | null;
}

type Listener = (state: ProspectNavState) => void;

export const parseProspectPathname = (pathname: string): ProspectNavState => {
  if (pathname === '/prospects/new') return { view: 'create', id: null };

  const detail = pathname.match(/^\/prospects\/([^/]+)$/);
  if (detail) return { view: 'detail', id: detail[1] };

  return { view: 'list', id: null };
};

export const buildProspectPathname = (state: ProspectNavState): string => {
  switch (state.view) {
    case 'create':
      return '/prospects/new';
    case 'detail':
      return state.id ? `/prospects/${state.id}` : '/prospects';
    case 'list':
    default:
      return '/prospects';
  }
};

let _state: ProspectNavState = parseProspectPathname(
  typeof window !== 'undefined' ? window.location.pathname : '/prospects'
);

const _listeners = new Set<Listener>();

export const getProspectState = (): ProspectNavState => ({ ..._state });

export const subscribeProspect = (listener: Listener): (() => void) => {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
};

const _notify = () => {
  const snap = getProspectState();
  _listeners.forEach(fn => fn(snap));
};

export const prospectNavigate = (view: ProspectView, id?: string, replace = false): void => {
  const next: ProspectNavState = { view, id: id ?? null };
  _state = next;
  const path = buildProspectPathname(next);
  if (replace) {
    window.history.replaceState({ prospectView: view, prospectId: id ?? null }, '', path);
  } else {
    window.history.pushState({ prospectView: view, prospectId: id ?? null }, '', path);
  }
  _notify();
};

export const syncProspectFromPathname = (pathname: string): void => {
  const next = parseProspectPathname(pathname);
  _state = next;
  _notify();
};
