/**
 * User Access Navigation Store
 *
 * URL ↔ View mapping:
 *   /users        → "list"
 *   /users/:id    → "detail"
 */

export type UserView = 'list' | 'detail';

export interface UserNavState {
  view: UserView;
  id: string | null;
}

type Listener = (state: UserNavState) => void;

export const parseUserPathname = (pathname: string): UserNavState => {
  const detail = pathname.match(/^\/users\/([^/]+)$/);
  if (detail) return { view: 'detail', id: detail[1] };
  return { view: 'list', id: null };
};

export const buildUserPathname = (state: UserNavState): string => {
  if (state.view === 'detail' && state.id) return `/users/${state.id}`;
  return '/users';
};

let _state: UserNavState = parseUserPathname(
  typeof window !== 'undefined' ? window.location.pathname : '/users'
);

const _listeners = new Set<Listener>();

export const getUserState = (): UserNavState => ({ ..._state });

export const subscribeUser = (listener: Listener): (() => void) => {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
};

const _notify = () => {
  const snap = getUserState();
  _listeners.forEach(fn => fn(snap));
};

export const userNavigate = (view: UserView, id?: string, replace = false): void => {
  const next: UserNavState = { view, id: id ?? null };
  _state = next;
  const path = buildUserPathname(next);
  if (replace) {
    window.history.replaceState({ userView: view, userId: id ?? null }, '', path);
  } else {
    window.history.pushState({ userView: view, userId: id ?? null }, '', path);
  }
  _notify();
};

export const syncUserFromPathname = (pathname: string): void => {
  const next = parseUserPathname(pathname);
  _state = next;
  _notify();
};
