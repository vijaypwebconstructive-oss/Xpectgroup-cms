import React, { useState, useEffect } from 'react';
import { AppView, Cleaner } from './types';
import ComplianceDashboardView from './modules/compliance-dashboard/ComplianceDashboard';
import CleanersList from './views/CleanersList';
import CleanerDetail from './views/CleanerDetail';
import OnboardingFlow from './views/OnboardingFlow';
import OnboardingAuth from './views/OnboardingAuth';
import ReportView from './views/ReportView';
import ThankYouView from './views/ThankYouView';
import StaffInvites from './views/StaffInvites';
import EmployeeCompliance from './views/EmployeeCompliance';
import TrainingCertification from './views/TrainingCertification';
import TrainingDetail from './views/TrainingDetail';
import PPEModule from './views/PPEModule';
import ClientSitesModule from './modules/clients-sites/ClientSitesModule';
import DocumentControlModule from './modules/document-control/DocumentControlModule';
import RiskCoshhModule from './modules/risk-coshh/RiskCoshhModule';
import IncidentsModule from './modules/incidents/IncidentsModule';
import UserAccessModule from './modules/user-access/UserAccessModule';
import AdminLayout from './components/AdminLayout';
import EmployeeLayout from './components/EmployeeLayout';
import EmployeeRouteGuard from './components/EmployeeRouteGuard';
import { useCleaners } from './context/CleanersContext';
import { getViewFromUrl, getUrlForView, navigateToUrl, getFirstName, createNameSlug } from './utils/routing';
import { isEmployee } from './utils/auth';

const App: React.FC = () => {
  const { cleaners } = useCleaners();
  const [currentView, setCurrentView] = useState<AppView>('DASHBOARD');
  const [selectedCleaner, setSelectedCleaner] = useState<Cleaner | null>(null);
  const [onboardingInviteToken, setOnboardingInviteToken] = useState<string | null>(null);

  // Initialize state from URL on mount
  const initializeState = () => {
    const pathname = window.location.pathname;
    
    // Redirect root path to dashboard
    if (pathname === '/') {
      navigateToUrl('/dashboard', true);
      return {
        view: 'DASHBOARD' as AppView,
        token: null,
        cleanerId: undefined
      };
    }

    const { view, params } = getViewFromUrl(pathname);
    
    // Handle cleaner detail and report views - find cleaner by firstName slug
    if ((view === 'CLEANER_DETAIL' || view === 'REPORT') && params?.firstName) {
      const firstNameSlug = params.firstName;
      const cleaner = cleaners.find(c => {
        const firstName = getFirstName(c.name);
        return createNameSlug(firstName) === firstNameSlug;
      });
      
      if (cleaner) {
        return {
          view,
          token: params.token || null,
          cleaner
        };
      }
    }

    return {
      view,
      token: params?.token || null,
      cleaner: undefined
    };
  };

  // Initialize from URL on mount
  useEffect(() => {
    const initialState = initializeState();
    console.log('[App] 🚀 Initializing from URL:', { 
      pathname: window.location.pathname, 
      view: initialState.view,
      hasToken: !!initialState.token 
    });
    
    // For onboarding routes, initialize immediately (don't wait for cleaners)
    if (initialState.view === 'ONBOARDING_AUTH' || initialState.view === 'ONBOARDING' || initialState.view === 'THANK_YOU') {
      setCurrentView(initialState.view);
      // Get token from URL params or sessionStorage
      const token = initialState.token || sessionStorage.getItem('onboardingToken');
      console.log('[App] 📍 Onboarding route detected:', { 
        view: initialState.view, 
        tokenFromURL: !!initialState.token,
        tokenFromStorage: !!sessionStorage.getItem('onboardingToken'),
        finalToken: !!token
      });
      if (token) {
        setOnboardingInviteToken(token);
      }
      return;
    }
    
    // For other routes, wait for cleaners to load if needed
    if (cleaners.length === 0 && (initialState.view === 'CLEANER_DETAIL' || initialState.view === 'REPORT')) {
      return; // Wait for cleaners to load
    }
    
    setCurrentView(initialState.view);
    if (initialState.token) {
      setOnboardingInviteToken(initialState.token);
    }
    if (initialState.cleaner) {
      setSelectedCleaner(initialState.cleaner);
    }
  }, [cleaners.length]); // Re-run when cleaners are loaded

  // Listen for URL changes (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const initialState = initializeState();
      setCurrentView(initialState.view);
      if (initialState.token) {
        setOnboardingInviteToken(initialState.token);
      } else {
        setOnboardingInviteToken(null);
      }
      if (initialState.cleaner) {
        setSelectedCleaner(initialState.cleaner);
      } else {
        setSelectedCleaner(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [cleaners]);

  // Update URL when view changes (but skip initial mount to avoid double navigation)
  const [isInitialMount, setIsInitialMount] = useState(true);
  
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }
    
    // These modules own their own URLs via their nav stores.
    // App.tsx must NOT overwrite sub-paths back to the canonical root.
    if (currentView === 'CLIENTS_SITES') return;
    if (currentView === 'DOCUMENT_CONTROL') return;
    if (currentView === 'RISK_COSHH') return;
    if (currentView === 'INCIDENTS') return;
    if (currentView === 'TRAINING_DETAIL') return;
    if (currentView === 'USER_ACCESS') return;
    if (currentView === 'PPE_LIST') return;

    const url = getUrlForView(currentView, {
      inviteToken: onboardingInviteToken || undefined,
      cleaner: selectedCleaner || undefined
    });
    
    const currentUrl = window.location.pathname + window.location.search;
    
    // Only update URL if it's different from current
    if (currentUrl !== url) {
      navigateToUrl(url, false);
    }
  }, [currentView, selectedCleaner, onboardingInviteToken, isInitialMount]);

  const navigateTo = (view: AppView, cleaner?: Cleaner) => {
    // CRITICAL: Block ALL admin routes for employees
    if (isEmployee()) {
      const adminViews: AppView[] = ['DASHBOARD', 'CLEANERS_LIST', 'CLEANER_DETAIL', 'STAFF_INVITES', 'REPORT'];
      if (adminViews.includes(view)) {
        console.log('[App] 🚫 Employee tried to navigate to admin view:', view, '- Blocking and redirecting to onboarding');
        const tokenFromStorage = sessionStorage.getItem('onboardingToken');
        if (tokenFromStorage) {
          setOnboardingInviteToken(tokenFromStorage);
          setCurrentView('ONBOARDING');
          navigateToUrl('/onboarding', true); // Use routing utility
        }
        return;
      }
      // Only allow employee views
      const allowedEmployeeViews: AppView[] = ['ONBOARDING', 'ONBOARDING_AUTH', 'THANK_YOU'];
      if (!allowedEmployeeViews.includes(view)) {
        console.log('[App] 🚫 Employee tried to navigate to unauthorized view:', view, '- Blocking');
        const tokenFromStorage = sessionStorage.getItem('onboardingToken');
        if (tokenFromStorage) {
          setOnboardingInviteToken(tokenFromStorage);
          setCurrentView('ONBOARDING');
          navigateToUrl('/onboarding', true); // Use routing utility
        }
        return;
      }
    }

    setCurrentView(view);
    if (cleaner) setSelectedCleaner(cleaner);

    // These modules own their own URLs — don't call navigateToUrl here.
    // navigateToUrl fires popstate which would interfere with the module's
    // own popstate handler and potentially overwrite the sub-path URL.
    if (view === 'CLIENTS_SITES') return;
    if (view === 'DOCUMENT_CONTROL') return;
    if (view === 'RISK_COSHH') return;
    if (view === 'INCIDENTS') return;
    if (view === 'TRAINING_DETAIL') return;
    if (view === 'USER_ACCESS') return;
    if (view === 'PPE_LIST') return;

    // Update URL based on view and cleaner (if applicable)
    const url = getUrlForView(view, { 
      cleanerId: cleaner?.id, 
      inviteToken: onboardingInviteToken || undefined,
      cleaner: cleaner 
    });
    navigateToUrl(url);
  };

  const redirectToAuth = (token: string) => {
    setOnboardingInviteToken(token);
    setCurrentView('ONBOARDING_AUTH' as AppView);
    navigateToUrl(`/onboarding/auth/${token}`, true);
  };

  const renderView = () => {
    // Employee onboarding routes - use EmployeeLayout
    if (currentView === 'ONBOARDING_AUTH') {
      if (onboardingInviteToken) {
        return (
          <EmployeeLayout>
            <OnboardingAuth inviteToken={onboardingInviteToken} onNavigate={navigateTo} />
          </EmployeeLayout>
        );
      }
      return (
        <AdminLayout currentView={currentView} onNavigate={navigateTo}>
          <ComplianceDashboardView onNavigate={navigateTo} />
        </AdminLayout>
      );
    }

    if (currentView === 'ONBOARDING') {
      const token = onboardingInviteToken || sessionStorage.getItem('onboardingToken');
      
      // If we have a token in sessionStorage but not in state, update state
      if (token && !onboardingInviteToken) {
        setOnboardingInviteToken(token);
      }
      
      // If no token at all, redirect to auth or dashboard
      if (!token) {
        // Try to get token from URL if available
        const urlToken = getViewFromUrl(window.location.pathname).params?.token;
        if (urlToken) {
          setOnboardingInviteToken(urlToken);
          return (
            <EmployeeLayout>
              <EmployeeRouteGuard inviteToken={urlToken} onRedirectToAuth={redirectToAuth}>
                <OnboardingFlow 
                  onComplete={() => navigateTo('THANK_YOU')} 
                  onCancel={() => {
                    redirectToAuth(urlToken);
                  }} 
                  onNavigate={navigateTo} 
                />
              </EmployeeRouteGuard>
            </EmployeeLayout>
          );
        }
        // No token found, redirect to dashboard
        navigateTo('DASHBOARD');
        return null;
      }
      
      return (
        <EmployeeLayout>
          <EmployeeRouteGuard inviteToken={token} onRedirectToAuth={redirectToAuth}>
            <OnboardingFlow 
              onComplete={() => navigateTo('THANK_YOU')} 
              onCancel={() => {
                // Clear session and redirect to auth if token exists
                if (token) {
                  redirectToAuth(token);
                } else {
                  navigateTo('DASHBOARD');
                }
              }} 
              onNavigate={navigateTo} 
            />
          </EmployeeRouteGuard>
        </EmployeeLayout>
      );
    }

    if (currentView === 'THANK_YOU') {
      // Thank you page should always use EmployeeLayout (no header) for employees
      // Check if user is an employee or has onboarding token
      const token = onboardingInviteToken || sessionStorage.getItem('onboardingToken');
      const hasEmployeeToken = sessionStorage.getItem('employeeJWT');
      
      // If employee token exists or onboarding token exists, use EmployeeLayout
      if (isEmployee() || token || hasEmployeeToken) {
        return (
          <EmployeeLayout>
            <ThankYouView onNavigate={navigateTo} />
          </EmployeeLayout>
        );
      }
      // For admins viewing thank you page, also use EmployeeLayout (no header)
      return (
        <EmployeeLayout>
          <ThankYouView onNavigate={navigateTo} />
        </EmployeeLayout>
      );
    }

    // Admin routes - use AdminLayout
    return (
      <AdminLayout currentView={currentView} onNavigate={navigateTo}>
        {(() => {
          switch (currentView) {
            case 'DASHBOARD':
              return <ComplianceDashboardView onNavigate={navigateTo} />;
            case 'EMPLOYEE_COMPLIANCE':
              return <EmployeeCompliance onNavigate={navigateTo} />;
            case 'TRAINING_CERTIFICATION':
              return <TrainingCertification onNavigate={navigateTo} />;
            case 'TRAINING_DETAIL':
              return <TrainingDetail onNavigate={navigateTo} />;
            case 'PPE_LIST':
              return <PPEModule onNavigate={navigateTo} />;
            case 'CLEANERS_LIST':
              return <CleanersList onNavigate={navigateTo} cleaners={cleaners} />;
            case 'CLEANER_DETAIL':
              // Find cleaner by firstName slug from URL or use selectedCleaner
              const detailCleaner = selectedCleaner 
                ? cleaners.find(c => {
                    const firstName = getFirstName(c.name);
                    const firstNameSlug = createNameSlug(firstName);
                    const selectedFirstName = getFirstName(selectedCleaner.name);
                    const selectedSlug = createNameSlug(selectedFirstName);
                    return firstNameSlug === selectedSlug;
                  }) || selectedCleaner
                : cleaners.length > 0 ? cleaners[0] : undefined;
              if (!detailCleaner) {
                return <div className="p-8 text-center">Employee not found</div>;
              }
              return <CleanerDetail cleaner={detailCleaner} onNavigate={navigateTo} />;
            case 'REPORT':
              // Find cleaner by firstName slug from URL or use selectedCleaner
              const reportCleaner = selectedCleaner 
                ? cleaners.find(c => {
                    const firstName = getFirstName(c.name);
                    const firstNameSlug = createNameSlug(firstName);
                    const selectedFirstName = getFirstName(selectedCleaner.name);
                    const selectedSlug = createNameSlug(selectedFirstName);
                    return firstNameSlug === selectedSlug;
                  }) || selectedCleaner
                : cleaners.length > 0 ? cleaners[0] : undefined;
              if (!reportCleaner) {
                return <div className="p-8 text-center">Employee not found</div>;
              }
              return <ReportView cleaner={reportCleaner} onNavigate={navigateTo} />;
            case 'STAFF_INVITES':
              return <StaffInvites onNavigate={navigateTo} />;
            case 'CLIENTS_SITES':
              return <ClientSitesModule />;
            case 'DOCUMENT_CONTROL':
              return <DocumentControlModule />;
            case 'RISK_COSHH':
              return <RiskCoshhModule />;
            case 'INCIDENTS':
              return <IncidentsModule />;
            case 'USER_ACCESS':
              return <UserAccessModule />;
            default:
              return <ComplianceDashboardView onNavigate={navigateTo} />;
          }
        })()}
      </AdminLayout>
    );
  };

  return <>{renderView()}</>;
};

export default App;
