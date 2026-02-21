/**
 * Risk Assessment & COSHH Navigation Store
 *
 * Reactive, module-level store that lives OUTSIDE React so it survives
 * component remounts caused by the top-level History API router.
 *
 * URL ↔ View mapping (bidirectional):
 *   /risk              → "risk-list"
 *   /risk/rams         → "rams-list"
 *   /risk/rams/:id     → "rams-detail"
 *   /risk/coshh        → "coshh-register"
 *   /risk/coshh/:id    → "coshh-detail"
 *   /risk/sds          → "sds-library"
 *   /risk/:id          → "risk-detail"   (must be last — catch-all)
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type RiskView =
  | 'risk-list'
  | 'risk-detail'
  | 'rams-list'
  | 'rams-detail'
  | 'coshh-register'
  | 'coshh-detail'
  | 'sds-library';

export interface RiskNavState {
  view: RiskView;
  id: string | null;
}

type Listener = (state: RiskNavState) => void;

// ── URL → State parser ────────────────────────────────────────────────────────

export const parseRiskPathname = (pathname: string): RiskNavState => {
  // Static sub-paths — must precede dynamic :id patterns
  if (pathname === '/risk/rams')    return { view: 'rams-list',       id: null };
  if (pathname === '/risk/coshh')   return { view: 'coshh-register',  id: null };
  if (pathname === '/risk/sds')     return { view: 'sds-library',     id: null };

  // /risk/rams/:id
  const ramsDetail = pathname.match(/^\/risk\/rams\/([^/]+)$/);
  if (ramsDetail) return { view: 'rams-detail', id: ramsDetail[1] };

  // /risk/coshh/:id
  const coshhDetail = pathname.match(/^\/risk\/coshh\/([^/]+)$/);
  if (coshhDetail) return { view: 'coshh-detail', id: coshhDetail[1] };

  // /risk/:id — must come last (catch-all for risk assessment detail)
  const riskDetail = pathname.match(/^\/risk\/([^/]+)$/);
  if (riskDetail) return { view: 'risk-detail', id: riskDetail[1] };

  // /risk (default)
  return { view: 'risk-list', id: null };
};

// ── State → URL builder ───────────────────────────────────────────────────────

export const buildRiskPathname = (state: RiskNavState): string => {
  switch (state.view) {
    case 'risk-detail':    return state.id ? `/risk/${state.id}` : '/risk';
    case 'rams-list':      return '/risk/rams';
    case 'rams-detail':    return state.id ? `/risk/rams/${state.id}` : '/risk/rams';
    case 'coshh-register': return '/risk/coshh';
    case 'coshh-detail':   return state.id ? `/risk/coshh/${state.id}` : '/risk/coshh';
    case 'sds-library':    return '/risk/sds';
    case 'risk-list':
    default:               return '/risk';
  }
};

// ── Store ─────────────────────────────────────────────────────────────────────

let _state: RiskNavState = parseRiskPathname(
  typeof window !== 'undefined' ? window.location.pathname : '/risk'
);

const _listeners = new Set<Listener>();

export const getRiskState = (): RiskNavState => ({ ..._state });

export const subscribeRisk = (listener: Listener): (() => void) => {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
};

const _notify = () => {
  const snap = getRiskState();
  _listeners.forEach(fn => fn(snap));
};

export const riskNavigate = (view: RiskView, id?: string, replace = false): void => {
  const next: RiskNavState = { view, id: id ?? null };
  _state = next;
  const path = buildRiskPathname(next);
  if (replace) {
    window.history.replaceState({ riskView: view, riskId: id ?? null }, '', path);
  } else {
    window.history.pushState({ riskView: view, riskId: id ?? null }, '', path);
  }
  _notify();
};

export const syncRiskFromPathname = (pathname: string): void => {
  const next = parseRiskPathname(pathname);
  _state = next;
  _notify();
};
