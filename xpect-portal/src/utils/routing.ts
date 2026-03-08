/**
 * Comprehensive routing utility for all pages
 * Maps AppView to URLs and handles URL parsing
 */

import { AppView, Cleaner } from '../types';

// URL to View mapping
const URL_TO_VIEW: Record<string, AppView> = {
  '/dashboard': 'DASHBOARD',
  '/compliance': 'EMPLOYEE_COMPLIANCE',
  '/training': 'TRAINING_CERTIFICATION',
  '/ppe': 'PPE_LIST',
  '/ppe/add': 'PPE_LIST',
  // Note: /clients, /sites, /site-allocation and their sub-paths are handled
  // by the dynamic pattern check in getViewFromUrl (supports :id segments).
  // These static entries are kept only as fallback for the lookup table.
  '/staff': 'CLEANERS_LIST',
  '/invitations': 'STAFF_INVITES',
  '/onboarding': 'ONBOARDING',
  '/thank-you': 'THANK_YOU',
  '/audit': 'DASHBOARD',
};

// View to URL mapping
const VIEW_TO_URL: Record<AppView, string> = {
  'DASHBOARD': '/dashboard',
  'EMPLOYEE_COMPLIANCE': '/compliance',
  'TRAINING_CERTIFICATION': '/training',
  'TRAINING_DETAIL': '/training/record',
  'PPE_LIST': '/ppe',
  'CLIENTS_SITES': '/clients',
  'DOCUMENT_CONTROL': '/documents',
  'RISK_COSHH': '/risk',
  'INCIDENTS': '/incidents',
  'FINANCE': '/finance-management',
  'USER_ACCESS': '/users',
  'CLEANERS_LIST': '/staff',
  'CLEANER_DETAIL': '/staff', // Will be appended with firstName
  'REPORT': '/staff', // Will be appended with firstName/report
  'STAFF_INVITES': '/invitations',
  'ONBOARDING': '/onboarding',
  'ONBOARDING_AUTH': '/onboarding/auth', // Will be appended with token
  'THANK_YOU': '/thank-you',
};

// Helper function to get first name from full name
export const getFirstName = (fullName: string): string => {
  return fullName.split(' ')[0] || fullName;
};

// Helper function to create URL-friendly slug from name
export const createNameSlug = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

// Parse URL to determine view and extract parameters
export const getViewFromUrl = (pathname: string): { view: AppView; params?: { token?: string; firstName?: string; traineeId?: string } } => {
  // Training sub-routes (most specific first)
  if (pathname.startsWith('/training/record/')) {
    const id = pathname.split('/')[3];
    return { view: 'TRAINING_DETAIL', params: { traineeId: id } };
  }
  if (pathname.startsWith('/training')) {
    return { view: 'TRAINING_CERTIFICATION' };
  }

  // PPE sub-routes all resolve to PPE_LIST (internal routing handled by PPEModule)
  if (pathname.startsWith('/ppe')) {
    return { view: 'PPE_LIST' };
  }

  // Client & Sites sub-routes all resolve to CLIENTS_SITES
  // (internal routing handled by ClientSitesModule + csNavStore)
  if (
    pathname.startsWith('/clients') ||
    pathname.startsWith('/sites') ||
    pathname === '/site-allocation'
  ) {
    return { view: 'CLIENTS_SITES' };
  }

  // User Access sub-routes all resolve to USER_ACCESS
  // (internal routing handled by UserAccessModule + userNavStore)
  if (pathname.startsWith('/users')) {
    return { view: 'USER_ACCESS' };
  }

  // Document Control sub-routes all resolve to DOCUMENT_CONTROL
  // (internal routing handled by DocumentControlModule + docNavStore)
  if (pathname.startsWith('/documents')) {
    return { view: 'DOCUMENT_CONTROL' };
  }

  // Risk Assessment & COSHH sub-routes all resolve to RISK_COSHH
  // (internal routing handled by RiskCoshhModule + riskNavStore)
  if (pathname.startsWith('/risk')) {
    return { view: 'RISK_COSHH' };
  }

  // Incidents sub-routes all resolve to INCIDENTS
  // (internal routing handled by IncidentsModule + incidentNavStore)
  if (pathname.startsWith('/incidents')) {
    return { view: 'INCIDENTS' };
  }

  // Prospect routes resolve to FINANCE (Prospect lives in Finance secondary sidebar)
  if (pathname.startsWith('/prospects')) {
    return { view: 'FINANCE' };
  }

  // Finance module - /finance-management and /finance (legacy) both resolve to FINANCE
  if (pathname.startsWith('/finance-management') || pathname.startsWith('/finance')) {
    return { view: 'FINANCE' };
  }

  // Dashboard (also supports legacy /audit)
  if (pathname.startsWith('/audit')) {
    return { view: 'DASHBOARD' };
  }

  // Check for onboarding auth route: /onboarding/auth/:token
  const authMatch = pathname.match(/^\/onboarding\/auth\/([^\/]+)$/);
  if (authMatch) {
    return {
      view: 'ONBOARDING_AUTH',
      params: { token: authMatch[1] }
    };
  }

  // Check for cleaner detail route: /staff/:firstName
  const cleanerDetailMatch = pathname.match(/^\/staff\/([^\/]+)$/);
  if (cleanerDetailMatch) {
    return {
      view: 'CLEANER_DETAIL',
      params: { firstName: cleanerDetailMatch[1] }
    };
  }

  // Check for report route: /staff/:firstName/report
  const reportMatch = pathname.match(/^\/staff\/([^\/]+)\/report$/);
  if (reportMatch) {
    return {
      view: 'REPORT',
      params: { firstName: reportMatch[1] }
    };
  }

  // Check for onboarding with token: /onboarding?token=...
  if (pathname === '/onboarding') {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      return {
        view: 'ONBOARDING',
        params: { token }
      };
    }
    return { view: 'ONBOARDING' };
  }

  // Check standard routes
  const view = URL_TO_VIEW[pathname];
  if (view) {
    return { view };
  }

  // Default to dashboard
  return { view: 'DASHBOARD' };
};

// Generate URL for a view
export const getUrlForView = (view: AppView, params?: { cleanerId?: string; inviteToken?: string; cleaner?: Cleaner }): string => {
  switch (view) {
    case 'ONBOARDING_AUTH':
      if (params?.inviteToken) {
        return `/onboarding/auth/${params.inviteToken}`;
      }
      return '/onboarding/auth';
    
    case 'ONBOARDING':
      if (params?.inviteToken) {
        return `/onboarding?token=${params.inviteToken}`;
      }
      return '/onboarding';
    
    case 'CLEANER_DETAIL':
      if (params?.cleaner) {
        const firstName = getFirstName(params.cleaner.name);
        const firstNameSlug = createNameSlug(firstName);
        return `/staff/${firstNameSlug}`;
      }
      return '/staff';
    
    case 'REPORT':
      if (params?.cleaner) {
        const firstName = getFirstName(params.cleaner.name);
        const firstNameSlug = createNameSlug(firstName);
        return `/staff/${firstNameSlug}/report`;
      }
      return '/staff';
    
    default:
      return VIEW_TO_URL[view] || '/dashboard';
  }
};

// Navigate to URL and update browser history
export const navigateToUrl = (url: string, replace: boolean = false) => {
  if (replace) {
    window.history.replaceState({}, '', url);
  } else {
    window.history.pushState({}, '', url);
  }
  // Dispatch popstate event to trigger URL change handlers
  window.dispatchEvent(new PopStateEvent('popstate'));
};

// Legacy functions for backward compatibility
export const getInviteTokenFromUrl = (): string | null => {
  const path = window.location.pathname;
  const authMatch = path.match(/\/onboarding\/auth\/([^\/]+)/);
  if (authMatch) {
    return authMatch[1];
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
};

export const navigateToOnboardingAuth = (inviteToken: string) => {
  navigateToUrl(`/onboarding/auth/${inviteToken}`);
};

export const navigateToOnboarding = (inviteToken?: string) => {
  if (inviteToken) {
    navigateToUrl(`/onboarding?token=${inviteToken}`);
  } else {
    navigateToUrl('/onboarding');
  }
};
