/**
 * Finance Module Navigation Store
 *
 * URL ↔ View mapping:
 *   /finance-management
 *   /finance-management/payroll
 *   /finance-management/payroll/payslip
 *   /finance-management/payroll/payslip-create
 *   /finance-management/payroll/payslip-edit/:id
 *   /finance-management/payroll/payslip-template
 *   /finance-management/payroll/payslip-view/:id
 *   /finance-management/invoice
 *   /finance-management/invoice/view/:id
 *   /finance-management/invoice/create
 *   /finance-management/invoice/edit/:id
 *   /finance-management/invoice/template
 *   /finance-management/quotation
 *   /finance-management/quotation/view/:id
 *   /finance-management/quotation/create
 *   /finance-management/quotation/edit/:id
 *   /finance-management/expense
 */

export type FinanceView =
  | 'payroll-list'
  | 'payslip'
  | 'payslip-create'
  | 'payslip-edit'
  | 'payslip-template'
  | 'payslip-view'
  | 'invoice-list'
  | 'invoice-view'
  | 'invoice-create'
  | 'invoice-edit'
  | 'invoice-template'
  | 'quotation-list'
  | 'quotation-view'
  | 'quotation-create'
  | 'quotation-edit'
  | 'quotation-template'
  | 'prospect-list'
  | 'prospect-create'
  | 'prospect-detail'
  | 'expense';

export interface FinanceNavState {
  view: FinanceView;
  id: string | null;
}

type Listener = (state: FinanceNavState) => void;

export const parseFinancePathname = (pathname: string): FinanceNavState => {
  // Support /prospects URLs (Prospect lives under Finance secondary sidebar)
  if (pathname.startsWith('/prospects')) {
    if (pathname === '/prospects/new') return { view: 'prospect-create', id: null };
    const m = pathname.match(/^\/prospects\/([^/]+)$/);
    if (m && m[1] !== 'new') return { view: 'prospect-detail', id: m[1] };
    return { view: 'prospect-list', id: null };
  }
  if (!pathname.startsWith('/finance-management')) {
    return { view: 'payroll-list', id: null };
  }
  const payslipViewMatch = pathname.match(/^\/finance-management\/payroll\/payslip-view\/([^/]+)$/);
  if (payslipViewMatch) return { view: 'payslip-view', id: payslipViewMatch[1] };

  const payslipEditMatch = pathname.match(/^\/finance-management\/payroll\/payslip-edit\/([^/]+)$/);
  if (payslipEditMatch) return { view: 'payslip-edit', id: payslipEditMatch[1] };

  if (pathname === '/finance-management/payroll/payslip-create') return { view: 'payslip-create', id: null };
  if (pathname === '/finance-management/payroll/payslip-template') return { view: 'payslip-template', id: null };
  if (pathname === '/finance-management/payroll/payslip-edit') return { view: 'payslip-edit', id: null };
  if (pathname === '/finance-management/payroll/payslip') return { view: 'payslip', id: null };
  if (pathname === '/finance-management/payroll') return { view: 'payroll-list', id: null };

  const invoiceViewMatch = pathname.match(/^\/finance-management\/invoice\/view\/([^/]+)$/);
  if (invoiceViewMatch) return { view: 'invoice-view', id: invoiceViewMatch[1] };
  const invoiceEditMatch = pathname.match(/^\/finance-management\/invoice\/edit\/([^/]+)$/);
  if (invoiceEditMatch) return { view: 'invoice-edit', id: invoiceEditMatch[1] };
  if (pathname === '/finance-management/invoice/template') return { view: 'invoice-template', id: null };
  if (pathname === '/finance-management/invoice/create') return { view: 'invoice-create', id: null };
  if (pathname === '/finance-management/invoice') return { view: 'invoice-list', id: null };

  const quotationViewMatch = pathname.match(/^\/finance-management\/quotation\/view\/([^/]+)$/);
  if (quotationViewMatch) return { view: 'quotation-view', id: quotationViewMatch[1] };
  const quotationEditMatch = pathname.match(/^\/finance-management\/quotation\/edit\/([^/]+)$/);
  if (quotationEditMatch) return { view: 'quotation-edit', id: quotationEditMatch[1] };
  if (pathname === '/finance-management/quotation/template') return { view: 'quotation-template', id: null };
  if (pathname === '/finance-management/quotation/create') return { view: 'quotation-create', id: null };
  if (pathname === '/finance-management/quotation') return { view: 'quotation-list', id: null };

  if (pathname === '/finance-management/expense') return { view: 'expense', id: null };

  const prospectDetailMatch = pathname.match(/^\/finance-management\/prospects\/([^/]+)$/);
  if (prospectDetailMatch && prospectDetailMatch[1] !== 'new') return { view: 'prospect-detail', id: prospectDetailMatch[1] };
  if (pathname === '/finance-management/prospects/new') return { view: 'prospect-create', id: null };
  if (pathname.startsWith('/finance-management/prospects')) return { view: 'prospect-list', id: null };

  return { view: 'payroll-list', id: null };
};

export const buildFinancePathname = (state: FinanceNavState): string => {
  switch (state.view) {
    case 'payroll-list': return '/finance-management/payroll';
    case 'payslip': return '/finance-management/payroll/payslip';
    case 'payslip-create': return '/finance-management/payroll/payslip-create';
    case 'payslip-edit': return state.id ? `/finance-management/payroll/payslip-edit/${state.id}` : '/finance-management/payroll/payslip-edit';
    case 'payslip-template': return '/finance-management/payroll/payslip-template';
    case 'payslip-view': return state.id ? `/finance-management/payroll/payslip-view/${state.id}` : '/finance-management/payroll';
    case 'invoice-list': return '/finance-management/invoice';
    case 'invoice-view': return state.id ? `/finance-management/invoice/view/${state.id}` : '/finance-management/invoice';
    case 'invoice-create': return '/finance-management/invoice/create';
    case 'invoice-edit': return state.id ? `/finance-management/invoice/edit/${state.id}` : '/finance-management/invoice/edit';
    case 'invoice-template': return '/finance-management/invoice/template';
    case 'quotation-list': return '/finance-management/quotation';
    case 'quotation-view': return state.id ? `/finance-management/quotation/view/${state.id}` : '/finance-management/quotation';
    case 'quotation-create': return '/finance-management/quotation/create';
    case 'quotation-edit': return state.id ? `/finance-management/quotation/edit/${state.id}` : '/finance-management/quotation/edit';
    case 'quotation-template': return '/finance-management/quotation/template';
    case 'prospect-list': return '/finance-management/prospects';
    case 'prospect-create': return '/finance-management/prospects/new';
    case 'prospect-detail': return state.id ? `/finance-management/prospects/${state.id}` : '/finance-management/prospects';
    // Also support /prospects paths for backward compatibility
    case 'expense': return '/finance-management/expense';
    default: return '/finance-management/payroll';
  }
};

let _state: FinanceNavState = parseFinancePathname(
  typeof window !== 'undefined' ? window.location.pathname : '/finance-management'
);

const _listeners = new Set<Listener>();

export const getFinanceState = (): FinanceNavState => ({ ..._state });

export const subscribeFinance = (listener: Listener): (() => void) => {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
};

const _notify = () => {
  const snap = getFinanceState();
  _listeners.forEach(fn => fn(snap));
};

export const financeNavigate = (view: FinanceView, id?: string, replace = false): void => {
  const next: FinanceNavState = { view, id: id ?? null };
  _state = next;

  const path = buildFinancePathname(next);
  if (replace) {
    window.history.replaceState({ financeView: view, financeId: id ?? null }, '', path);
  } else {
    window.history.pushState({ financeView: view, financeId: id ?? null }, '', path);
  }

  _notify();
};

export const syncFinanceFromPathnameSilent = (pathname: string): void => {
  _state = parseFinancePathname(pathname);
};

export const syncFinanceFromPathname = (pathname: string): void => {
  const next = parseFinancePathname(pathname);
  _state = next;
  _notify();
};
