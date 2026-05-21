import React, { useState, useEffect } from "react";
import { AppView, Cleaner } from "./types";
import ComplianceDashboardView from "./modules/compliance-dashboard/ComplianceDashboard";
import CleanersList from "./views/CleanersList";
import CleanerDetail from "./views/CleanerDetail";
import OnboardingFlow from "./views/OnboardingFlow";
import OnboardingAuth from "./views/OnboardingAuth";
import ReportView from "./views/ReportView";
import ThankYouView from "./views/ThankYouView";
import StaffInvites from "./views/StaffInvites";
import EmployeeCompliance from "./views/EmployeeCompliance";
import TrainingCertification from "./views/TrainingCertification";
import TrainingDetail from "./views/TrainingDetail";
import PPEModule from "./views/PPEModule";
import ClientSitesModule from "./modules/clients-sites/ClientSitesModule";
import DocumentControlModule from "./modules/document-control/DocumentControlModule";
import RiskCoshhModule from "./modules/risk-coshh/RiskCoshhModule";
import IncidentsModule from "./modules/incidents/IncidentsModule";
import FinanceModule from "./modules/finance/FinanceModule";
import UserAccessModule from "./modules/user-access/UserAccessModule";
import AdminLayout from "./components/AdminLayout";
import EmployeeLayout from "./components/EmployeeLayout";
import EmployeeRouteGuard from "./components/EmployeeRouteGuard";
import { useCleaners } from "./context/CleanersContext";
import AttendanceModule from "./modules/attendance/AttendanceModule";
import {
  getViewFromUrl,
  getUrlForView,
  navigateToUrl,
  getFirstName,
  createNameSlug,
} from "./utils/routing";
import { isEmployee } from "./utils/auth";
import { useAuth } from "./context/AuthContext";
import { canAccessModule, viewToModuleKey } from "./utils/permissions";
import AccessDenied from "./views/AccessDenied";
import Login from "./views/Login";
import { useCurrentUser } from "./hook/useCurrentUser";
import api from "./services/api";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
// import AttendanceModule from "./modules/attendance/AttendanceModule";
const getDefaultView = (user: any): AppView => {
  if (!user) return "DASHBOARD";

  // Dashboard
  if (canAccessModule(user.role, "compliance")) {
    return "DASHBOARD";
  }

  // Employee Compliance
  if (canAccessModule(user.role, "employee compliance")) {
    return "EMPLOYEE_COMPLIANCE";
  }

  // Client / Sites
  if (canAccessModule(user.role, "sites")) {
    return "CLIENTS_SITES";
  }

  // Risk
  if (canAccessModule(user.role, "rams")) {
    return "RISK_COSHH";
  }

  // Incident
  if (canAccessModule(user.role, "incident")) {
    return "INCIDENTS";
  }

  // Document
  if (canAccessModule(user.role, "document")) {
    return "DOCUMENT_CONTROL";
  }

  // Finance
  if (canAccessModule(user.role, "payroll")) {
    return "FINANCE";
  }

  // Users
  if (canAccessModule(user.role, "users")) {
    return "USER_ACCESS";
  }

  return "ACCESS_DENIED";
};

const App: React.FC = () => {
  const { cleaners } = useCleaners();
  const { user } = useAuth();
  const { currentUser, loading } = useCurrentUser();
  const [currentView, setCurrentView] = useState<AppView>(() =>
    getDefaultView(user),
  );
  const [selectedCleaner, setSelectedCleaner] = useState<Cleaner | null>(null);
  const [onboardingInviteToken, setOnboardingInviteToken] = useState<
    string | null
  >(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [showVerificationPendingModal, setShowVerificationPendingModal] =
    useState(false);

  // Initialize state from URL on mount
  const initializeState = () => {
    const pathname = window.location.pathname;
    if (pathname === "/login") {
      return {
        view: "LOGIN" as AppView,
        token: null,
      };
    }
    // Redirect root path to dashboard
    if (pathname === "/") {
      const defaultView = getDefaultView(user);

      const defaultUrl = getUrlForView(defaultView);

      navigateToUrl(defaultUrl, true);

      return {
        view: defaultView,
        token: null,
        cleanerId: undefined,
      };
    }

    const { view, params } = getViewFromUrl(pathname);

    // Handle cleaner detail and report views - find cleaner by firstName slug
    if ((view === "CLEANER_DETAIL" || view === "REPORT") && params?.firstName) {
      const firstNameSlug = params.firstName;
      const cleaner = cleaners.find((c) => {
        const firstName = getFirstName(c.name);
        return createNameSlug(firstName) === firstNameSlug;
      });

      if (cleaner) {
        return {
          view,
          token: params.token || null,
          cleaner,
        };
      }
    }

    return {
      view,
      token: params?.token || null,
      cleaner: undefined,
    };
  };
  //   let hasCleanerId;
  // const isVerificationPending =
  //   currentUser?.verificationStatus
  //     ?.trim()
  //     .toLowerCase() === "pending";
  //   useEffect(() => {
  //     const fetchCleaner = async () => {
  //       try {
  //         const localuser = JSON.parse(
  //           localStorage.getItem("xpect_user") || "{}",
  //         );

  //         if (localuser.cleanerId !== "") {
  //           hasCleanerId == true;
  //         }

  //         const cleaner = await api.cleaners.getById(localuser.cleanerId);
  //         console.log("cleanerrrrr", cleaner);
  //         // if (!localuser?.cleanerId) return;
  //       } catch (err) {
  //         console.error(err);
  //       }
  //     };

  //     fetchCleaner();
  //   }, []);

  const localUser = JSON.parse(localStorage.getItem("xpect_user") || "{}");
  const hasCleanerId = !!localUser?.cleanerId;

  useEffect(() => {
    const checkVerification = async () => {
      try {
        // normal admin/custom users
        if (!localUser?.cleanerId) {
          return;
        }

        // onboarding employee users
        const cleaner = await api.cleaners.getById(localUser.cleanerId);

        console.log("cleaner", cleaner);

        const status = cleaner?.verificationStatus?.trim().toLowerCase();

        if (status === "pending") {
          setShowVerificationPendingModal(true);
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkVerification();
  }, []);

  // Initialize from URL on mount
  useEffect(() => {
    const initialState = initializeState();
    console.log("[App] 🚀 Initializing from URL:", {
      pathname: window.location.pathname,
      view: initialState.view,
      hasToken: !!initialState.token,
    });

    // For onboarding routes, initialize immediately (don't wait for cleaners)
    if (
      initialState.view === "ONBOARDING_AUTH" ||
      initialState.view === "ONBOARDING" ||
      initialState.view === "THANK_YOU"
    ) {
      setCurrentView(initialState.view);
      // Get token from URL params or sessionStorage
      const token =
        initialState.token || sessionStorage.getItem("onboardingToken");
      console.log("[App] 📍 Onboarding route detected:", {
        view: initialState.view,
        tokenFromURL: !!initialState.token,
        tokenFromStorage: !!sessionStorage.getItem("onboardingToken"),
        finalToken: !!token,
      });
      if (token) {
        setOnboardingInviteToken(token);
      }
      return;
    }

    // For other routes, wait for cleaners to load if needed
    if (
      cleaners.length === 0 &&
      (initialState.view === "CLEANER_DETAIL" || initialState.view === "REPORT")
    ) {
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

  // RBAC: deep-linked URLs — redirect when role lacks module access
  useEffect(() => {
    if (isEmployee()) return;
    const key = viewToModuleKey(currentView);
    if (!key || !user?.role) return;
    if (!canAccessModule(user.role, key)) {
      setCurrentView("ACCESS_DENIED");
      navigateToUrl("/access-denied", true);
    }
  }, [currentView, user?.role]);

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

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [cleaners]);

  // Update URL when view changes (but skip initial mount to avoid double navigation)
  const [isInitialMount, setIsInitialMount] = useState(true);
  const token = localStorage.getItem("xpect_authToken");
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    // These modules own their own URLs via their nav stores.
    // App.tsx must NOT overwrite sub-paths back to the canonical root.
    if (currentView === "CLIENTS_SITES") return;
    if (currentView === "DOCUMENT_CONTROL") return;
    if (currentView === "RISK_COSHH") return;
    if (currentView === "INCIDENTS") return;
    if (currentView === "PROSPECT") return;
    if (currentView === "FINANCE") return;
    if (currentView === "TRAINING_DETAIL") return;
    if (currentView === "USER_ACCESS") return;
    if (currentView === "ACCESS_DENIED") return;
    if (currentView === "PPE_LIST") return;
    if (currentView === "ATTENDANCE") return;

    const url = getUrlForView(currentView, {
      inviteToken: onboardingInviteToken || undefined,
      cleaner: selectedCleaner || undefined,
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
      const adminViews: AppView[] = [
        "DASHBOARD",
        "CLEANERS_LIST",
        "CLEANER_DETAIL",
        "STAFF_INVITES",
        "REPORT",
      ];
      if (adminViews.includes(view)) {
        console.log(
          "[App] 🚫 Employee tried to navigate to admin view:",
          view,
          "- Blocking and redirecting to onboarding",
        );
        const tokenFromStorage = sessionStorage.getItem("onboardingToken");
        if (tokenFromStorage) {
          setOnboardingInviteToken(tokenFromStorage);
          setCurrentView("ONBOARDING");
          navigateToUrl("/onboarding", true); // Use routing utility
        }
        return;
      }
      // Only allow employee views
      const allowedEmployeeViews: AppView[] = [
        "ONBOARDING",
        "ONBOARDING_AUTH",
        "THANK_YOU",
      ];
      if (!allowedEmployeeViews.includes(view)) {
        console.log(
          "[App] 🚫 Employee tried to navigate to unauthorized view:",
          view,
          "- Blocking",
        );
        const tokenFromStorage = sessionStorage.getItem("onboardingToken");
        if (tokenFromStorage) {
          setOnboardingInviteToken(tokenFromStorage);
          setCurrentView("ONBOARDING");
          navigateToUrl("/onboarding", true); // Use routing utility
        }
        return;
      }
    }

    if (!isEmployee()) {
      const key = viewToModuleKey(view);
      if (key && user?.role && !canAccessModule(user.role, key)) {
        setCurrentView("ACCESS_DENIED");
        navigateToUrl("/access-denied");
        return;
      }
    }
    setCurrentView(view);
    if (cleaner) setSelectedCleaner(cleaner);

    // These modules own their own URLs — don't call navigateToUrl here.
    // navigateToUrl fires popstate which would interfere with the module's
    // own popstate handler and potentially overwrite the sub-path URL.
    if (view === "CLIENTS_SITES") return;
    if (view === "DOCUMENT_CONTROL") return;
    if (view === "RISK_COSHH") return;
    if (view === "INCIDENTS") return;
    if (view === "FINANCE") return;
    if (view === "TRAINING_DETAIL") return;
    if (view === "USER_ACCESS") return;
    if (view === "ACCESS_DENIED") return;
    if (view === "PPE_LIST") return;
    if (view === "ATTENDANCE") return;

    // Update URL based on view and cleaner (if applicable)
    const url = getUrlForView(view, {
      cleanerId: cleaner?.id,
      inviteToken: onboardingInviteToken || undefined,
      cleaner: cleaner,
    });
    navigateToUrl(url);
  };

  const redirectToAuth = (token: string) => {
    setOnboardingInviteToken(token);
    setCurrentView("ONBOARDING_AUTH" as AppView);
    navigateToUrl(`/onboarding/auth/${token}`, true);
  };

  const handlefinancesidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  const renderView = () => {
    // Employee onboarding routes - use EmployeeLayout

    if (currentView === "LOGIN") {
      return <Login />;
    }
    if (currentView === "ONBOARDING_AUTH") {
      if (onboardingInviteToken) {
        return (
          <EmployeeLayout>
            <OnboardingAuth
              inviteToken={onboardingInviteToken}
              onNavigate={navigateTo}
            />
          </EmployeeLayout>
        );
      }
      return (
        <AdminLayout
          currentView={currentView}
          onNavigate={navigateTo}
          handleSidebar={handlefinancesidebar}
        >
          <ComplianceDashboardView onNavigate={navigateTo} />
        </AdminLayout>
      );
    }

    if (currentView === "ONBOARDING") {
      const token =
        onboardingInviteToken || sessionStorage.getItem("onboardingToken");

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
              <EmployeeRouteGuard
                inviteToken={urlToken}
                onRedirectToAuth={redirectToAuth}
              >
                <OnboardingFlow
                  onComplete={() => navigateTo("THANK_YOU")}
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
        navigateTo("DASHBOARD");
        return null;
      }

      return (
        <EmployeeLayout>
          <EmployeeRouteGuard
            inviteToken={token}
            onRedirectToAuth={redirectToAuth}
          >
            <OnboardingFlow
              onComplete={() => navigateTo("THANK_YOU")}
              onCancel={() => {
                // Clear session and redirect to auth if token exists
                if (token) {
                  redirectToAuth(token);
                } else {
                  navigateTo("DASHBOARD");
                }
              }}
              onNavigate={navigateTo}
            />
          </EmployeeRouteGuard>
        </EmployeeLayout>
      );
    }

    if (currentView === "THANK_YOU") {
      // Thank you page should always use EmployeeLayout (no header) for employees
      // Check if user is an employee or has onboarding token
      const token =
        onboardingInviteToken || sessionStorage.getItem("onboardingToken");
      const hasEmployeeToken = sessionStorage.getItem("employeeJWT");

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
      <AdminLayout
        currentView={currentView}
        onNavigate={navigateTo}
        handleSidebar={handlefinancesidebar}
      >
        {(() => {
          switch (currentView) {
            case "ATTENDANCE":
              return <AttendanceModule />;
            case "ACCESS_DENIED":
              return <AccessDenied onNavigate={navigateTo} />;
            case "DASHBOARD":
              if (user?.role && !canAccessModule(user.role, "compliance")) {
                return <AccessDenied onNavigate={navigateTo} />;
              }
              return <ComplianceDashboardView onNavigate={navigateTo} />;
            // case "ATTENDANCE":
            //   return <AttendanceModule />;
            case "EMPLOYEE_COMPLIANCE":
              return <EmployeeCompliance onNavigate={navigateTo} />;
            case "TRAINING_CERTIFICATION":
              return <TrainingCertification onNavigate={navigateTo} />;
            case "TRAINING_DETAIL":
              return <TrainingDetail onNavigate={navigateTo} />;
            case "PPE_LIST":
              return <PPEModule onNavigate={navigateTo} />;
            case "CLEANERS_LIST":
              return (
                <CleanersList onNavigate={navigateTo} cleaners={cleaners} />
              );
            case "CLEANER_DETAIL":
              // Find cleaner by firstName slug from URL or use selectedCleaner
              const detailCleaner = selectedCleaner
                ? cleaners.find((c) => {
                    const firstName = getFirstName(c.name);
                    const firstNameSlug = createNameSlug(firstName);
                    const selectedFirstName = getFirstName(
                      selectedCleaner.name,
                    );
                    const selectedSlug = createNameSlug(selectedFirstName);
                    return firstNameSlug === selectedSlug;
                  }) || selectedCleaner
                : cleaners.length > 0
                  ? cleaners[0]
                  : undefined;
              if (!detailCleaner) {
                return (
                  <div className="p-8 text-center">Employee not found</div>
                );
              }
              return (
                <CleanerDetail
                  cleaner={detailCleaner}
                  onNavigate={navigateTo}
                />
              );
            case "REPORT":
              // Find cleaner by firstName slug from URL or use selectedCleaner
              const reportCleaner = selectedCleaner
                ? cleaners.find((c) => {
                    const firstName = getFirstName(c.name);
                    const firstNameSlug = createNameSlug(firstName);
                    const selectedFirstName = getFirstName(
                      selectedCleaner.name,
                    );
                    const selectedSlug = createNameSlug(selectedFirstName);
                    return firstNameSlug === selectedSlug;
                  }) || selectedCleaner
                : cleaners.length > 0
                  ? cleaners[0]
                  : undefined;
              if (!reportCleaner) {
                return (
                  <div className="p-8 text-center">Employee not found</div>
                );
              }
              return (
                <ReportView cleaner={reportCleaner} onNavigate={navigateTo} />
              );
            case "STAFF_INVITES":
              return <StaffInvites onNavigate={navigateTo} />;
            case "CLIENTS_SITES":
              if (user?.role && !canAccessModule(user.role, "sites")) {
                return <AccessDenied onNavigate={navigateTo} />;
              }
              return <ClientSitesModule />;
            case "DOCUMENT_CONTROL":
              return <DocumentControlModule />;
            case "RISK_COSHH":
              if (user?.role && !canAccessModule(user.role, "rams")) {
                return <AccessDenied onNavigate={navigateTo} />;
              }
              return <RiskCoshhModule />;
            case "INCIDENTS":
              return <IncidentsModule />;
            case "FINANCE":
              if (user?.role && !canAccessModule(user.role, "payroll")) {
                return <AccessDenied onNavigate={navigateTo} />;
              }
              return (
                <FinanceModule
                  sidebar={showSidebar}
                  handlesidebar={handlefinancesidebar}
                />
              );
            case "USER_ACCESS":
              if (user?.role && !canAccessModule(user.role, "users")) {
                return <AccessDenied onNavigate={navigateTo} />;
              }
              return <UserAccessModule />;
            default:
              return <AccessDenied onNavigate={navigateTo} />;
          }
        })()}
      </AdminLayout>
    );
  };

  // 🚨 Block app if not logged in
  // if (!token) {
  //   return <Login />;
  // }

  useEffect(() => {
    const pathname = window.location.pathname;

    // PUBLIC ROUTES
    const isOnboardingAuthRoute = pathname.startsWith("/onboarding/auth");

    const isOnboardingRoute = pathname === "/onboarding";

    const isThankYouRoute = pathname === "/thank-you";

    const isPublicRoute =
      isOnboardingAuthRoute || isOnboardingRoute || isThankYouRoute;

    // If public onboarding route → allow access
    if (isPublicRoute) {
      return;
    }

    // All other routes require admin auth
    if (!token) {
      setCurrentView("LOGIN");

      navigateToUrl("/login", true);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (showVerificationPendingModal) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#2e4150] px-7 py-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[30px]">
                  pending_actions
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold">Verification Pending</h2>

                <p className="text-sm text-white/80 mt-1">
                  ERP access is temporarily restricted
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-7 py-8">
            <div className="flex items-start gap-4">
              {/* <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[34px] text-amber-600">
                  hourglass_top
                </span>
              </div> */}

              <div>
                <h3 className="text-xl font-bold text-[#0d121b]">
                  You have successfully logged in to XpectGroup ERP
                </h3>

                <p className="mt-4 text-base  leading-7 text-[#4c669a]">
                  Your onboarding form has been submitted successfully.
                </p>

                <p className="mt-3 text-base leading-7 text-[#4c669a]">
                  However, your background verification is currently under
                  review by the administration team.
                </p>

                <p className="mt-3 text-base leading-7 text-[#4c669a]">
                  You cannot access the ERP portal until your verification
                  process has been approved.
                </p>

                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-600">
                      schedule
                    </span>

                    <div>
                      <p className="text-sm font-semibold text-amber-700">
                        Please check again after 5 hours.
                      </p>

                      <p className="mt-1 text-xs text-amber-600 leading-6">
                        Once your verification has been completed, your ERP
                        access will automatically become active.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{renderView()}</>;
};

export default App;
