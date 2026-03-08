/**
 * Document Control Navigation Store
 *
 * Reactive, module-level store that lives OUTSIDE React so it survives
 * component remounts caused by the top-level History API router.
 *
 * URL ↔ View mapping (bidirectional):
 *   /documents             → "library"
 *   /documents/create      → "create"
 *   /documents/approvals   → "approvals"
 *   /documents/reviews     → "reviews"
 *   /documents/:id         → "detail"
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type DocView = 'library' | 'detail' | 'create' | 'approvals' | 'reviews';

export interface DocNavState {
  view: DocView;
  /** Populated only for "detail" view */
  id: string | null;
}

type Listener = (state: DocNavState) => void;

// ── URL → State parser ────────────────────────────────────────────────────────

export const parseDocPathname = (pathname: string): DocNavState => {
  if (pathname === '/documents/create')    return { view: 'create',    id: null };
  if (pathname === '/documents/approvals') return { view: 'approvals', id: null };
  if (pathname === '/documents/reviews')   return { view: 'reviews',   id: null };

  // /documents/:id — must come AFTER the static sub-paths above
  const detail = pathname.match(/^\/documents\/([^/]+)$/);
  if (detail) return { view: 'detail', id: detail[1] };

  // /documents (default / fallback)
  return { view: 'library', id: null };
};

// ── State → URL builder ───────────────────────────────────────────────────────

export const buildDocPathname = (state: DocNavState): string => {
  switch (state.view) {
    case 'create':    return '/documents/create';
    case 'approvals': return '/documents/approvals';
    case 'reviews':   return '/documents/reviews';
    case 'detail':    return state.id ? `/documents/${state.id}` : '/documents';
    case 'library':
    default:          return '/documents';
  }
};

// ── Store ─────────────────────────────────────────────────────────────────────

let _state: DocNavState = parseDocPathname(
  typeof window !== 'undefined' ? window.location.pathname : '/documents'
);

const _listeners = new Set<Listener>();

/** Read current state */
export const getDocState = (): DocNavState => ({ ..._state });

/** Subscribe to state changes — returns unsubscribe fn */
export const subscribeDoc = (listener: Listener): (() => void) => {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
};

const _notify = () => {
  const snap = getDocState();
  _listeners.forEach(fn => fn(snap));
};

/**
 * Navigate to a Document Control sub-view.
 * Pushes the correct URL to browser history and notifies subscribers.
 * Does NOT dispatch a popstate event — we use our own subscriber pattern.
 */
export const docNavigate = (view: DocView, id?: string, replace = false): void => {
  const next: DocNavState = { view, id: id ?? null };
  _state = next;

  const path = buildDocPathname(next);
  if (replace) {
    window.history.replaceState({ docView: view, docId: id ?? null }, '', path);
  } else {
    window.history.pushState({ docView: view, docId: id ?? null }, '', path);
  }

  _notify();
};

/**
 * Sync state from pathname without notifying subscribers.
 * Use during render (e.g. useState initializer) to avoid updating other components.
 */
export const syncDocFromPathnameSilent = (pathname: string): void => {
  _state = parseDocPathname(pathname);
};

/**
 * Sync state from a pathname WITHOUT pushing to history.
 * Called on initial mount and when browser popstate fires.
 */
export const syncDocFromPathname = (pathname: string): void => {
  const next = parseDocPathname(pathname);
  _state = next;
  _notify();
};
