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
import SitesList from "./modules/clients-sites/SitesList";
import SiteAllocation from "./modules/clients-sites/SiteAllocation";
import SiteInspection from "./modules/clients-sites/SiteInspection";
import PPEInvoiceList from "./views/PPEInvoiceList";
import AdminAttendance from "./modules/attendance/AdminAttendance";
import EmployeeAttendance from "./modules/attendance/EmployeeAttendance";
import AttendanceRegularization from "./modules/attendance/AttendanceRegularization";
import {
  getViewFromUrl,
  getUrlForView,
  navigateToUrl,
  findCleanerBySlug,
} from "./utils/routing";
import { isEmployee } from "./utils/auth";
import { useAuth } from "./context/AuthContext";
import { canAccessModule, viewToModuleKey } from "./utils/permissions";
import AccessDenied from "./views/AccessDenied";
import MyApplication from "./views/MyApplication";
import Login from "./views/Login";
import SiteDetail from "./modules/clients-sites/SiteDetail";
import InspectionDetail from "./modules/clients-sites/InspectionDetail";
import {
  CSState,
  getState,
  subscribe,
  syncFromPathname,
  csNavigate,
} from "./modules/clients-sites/csNavStore";
import { useCurrentUser } from "./hook/useCurrentUser";
import api from "./services/api";
// import AttendanceModule from "./modules/attendance/AttendanceModule";
const getDefaultView = (user: any): AppView => {
  if (!user) return "DASHBOARD";

  // Dashboard
  if (canAccessModule(user, "dashboard")) {
    return "DASHBOARD";
  }

  // Employee Compliance
  if (canAccessModule(user, "employee compliance")) {
    return "EMPLOYEE_COMPLIANCE";
  }

  // Client / Sites
  if (canAccessModule(user, "client")) {
    return "CLIENTS_SITES";
  }
  if (canAccessModule(user, "sites")) {
    return "SITES";
  }

  if (canAccessModule(user, "site allocation")) {
    return "SITE_ALLOCATION";
  }

  if (canAccessModule(user, "site inspection")) {
    return "INSPECTION";
  }

  if (canAccessModule(user, "ppe")) {
    return "PPE";
  }

  // Risk
  if (canAccessModule(user, "risk")) {
    return "RISK_COSHH";
  }

  // Incident
  if (canAccessModule(user, "incident")) {
    return "INCIDENTS";
  }

  // Attendance
  if (canAccessModule(user, "admin attendance")) {
    return "ADMIN_ATTENDANCE";
  }

  // employee attendance
  if (canAccessModule(user, "employee attendance")) {
    return "EMPLOYEE_ATTENDANCE";
  }

  // Regularization
  if (canAccessModule(user, "regularization")) {
    return "REGULARIZATION";
  }

  // Document
  if (canAccessModule(user, "document")) {
    return "DOCUMENT_CONTROL";
  }

  // Finance
  if (
    canAccessModule(user, "finance") ||
    canAccessModule(user, "payroll") ||
    canAccessModule(user, "invoice") ||
    canAccessModule(user, "quotation") ||
    canAccessModule(user, "prospect") ||
    canAccessModule(user, "performance")
  ) {
    return "FINANCE";
  }

  // Users
  if (canAccessModule(user, "users")) {
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
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [selectedInspectionId, setSelectedInspectionId] = useState<string>("");
  const [onboardingInviteToken, setOnboardingInviteToken] = useState<
    string | null
  >(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  // Employees (users linked to a staff record) may only use the ERP once
  // their verification is "Verified". Until checked, nothing is rendered.
  const [verificationGate, setVerificationGate] = useState<{
    state: "checking" | "allowed" | "blocked" | "docsRequired";
    status?: string;
    notes?: string;
    resubmitted?: boolean;
  }>(() => {
    const path = window.location.pathname;
    const isPublicPath =
      path === "/login" ||
      path.startsWith("/onboarding") ||
      path === "/thank-you";
    const storedUser = JSON.parse(localStorage.getItem("xpect_user") || "{}");
    return storedUser?.cleanerId && !isPublicPath
      ? { state: "checking" }
      : { state: "allowed" };
  });
  const goToClients = () => csNavigate("clients");
  const goToClient = (id: string) => csNavigate("client-detail", id);
  const goToSites = () => csNavigate("sites");
  const goToSite = (id: string) => {
    setSelectedSiteId(id);

    navigateTo("SITE_DETAIL");

    navigateToUrl(`/sites/${id}`);
  };
  const goToAllocation = () => csNavigate("allocation");
  const goToInspectionDetail = (id: string) => {
    setSelectedInspectionId(id);

    navigateTo("INSPECTION_DETAIL");

    navigateToUrl("/inspectionDetail");
  };

  const goToCreateInspection = () => csNavigate("inspection-create");
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

    if (view === "SITE_DETAIL") {
      return {
        view,
        siteId: params?.siteId || "",
      };
    }

    // Handle cleaner detail and report views - find cleaner by URL slug
    if ((view === "CLEANER_DETAIL" || view === "REPORT") && params?.firstName) {
      const cleaner = findCleanerBySlug(cleaners, params.firstName);

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

  const localUser = JSON.parse(localStorage.getItem("xpect_user") || "{}");
  const hasCleanerId = !!localUser?.cleanerId;

  useEffect(() => {
    const checkVerification = async () => {
      // Normal admin/custom users and public pages are not gated
      if (verificationGate.state !== "checking") {
        return;
      }

      try {
        // onboarding employee users — read their own application
        const application: any = await api.myApplication.get();

        const status = application?.verificationStatus?.trim() || "Pending";

        if (status.toLowerCase() === "verified") {
          setVerificationGate({ state: "allowed" });
        } else if (status.toLowerCase() === "docs required") {
          // Can log in to re-upload documents on the My Application page
          setVerificationGate({ state: "docsRequired" });
        } else {
          // Pending or Rejected → no ERP access
          setVerificationGate({
            state: "blocked",
            status,
            notes: application?.auditorNotes || "",
            resubmitted: !!application?.resubmittedAt,
          });
        }
      } catch (err: any) {
        console.error(err);
        if (err?.status === 401) {
          // Session expired → log in again
          handleEmployeeLogout();
          return;
        }
        // If the status cannot be confirmed, do not grant access
        setVerificationGate({ state: "blocked", status: "Unknown" });
      }
    };

    checkVerification();
  }, []);

  const handleEmployeeLogout = () => {
    localStorage.removeItem("xpect_authToken");
    localStorage.removeItem("xpect_user");
    localStorage.removeItem("xpect_currentUser");
    window.location.href = "/login";
  };

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
      if (initialState.siteId) {
        setSelectedSiteId(initialState.siteId);
      }
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
    if (!canAccessModule(user, key)) {
      setCurrentView("ACCESS_DENIED");
      navigateToUrl("/access-denied", true);
    }
  }, [currentView, user]);

  // Listen for URL changes (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const initialState = initializeState();
      setCurrentView(initialState.view);
      if (initialState.siteId) {
        setSelectedSiteId(initialState.siteId);
      }
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
    if (
      currentView === "CLIENTS_SITES" ||
      currentView === "SITE_DETAIL" ||
      currentView === "INSPECTION_DETAIL"
    )
      return;
    if (currentView === "DOCUMENT_CONTROL") return;
    if (currentView === "RISK_COSHH") return;
    if (currentView === "INCIDENTS") return;
    // if (currentView === "PROSPECT") return;
    if (currentView === "FINANCE") return;
    if (currentView === "TRAINING_DETAIL") return;
    if (currentView === "USER_ACCESS") return;
    if (currentView === "ACCESS_DENIED") return;
    // if (currentView === "PPE_LIST") return;
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
      if (key && user?.role && !canAccessModule(user, key)) {
        console.log("runn");
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
    if (
      view === "CLIENTS_SITES" ||
      view === "SITE_DETAIL" ||
      view === "INSPECTION_DETAIL"
    )
      return;
    if (view === "DOCUMENT_CONTROL") return;
    if (view === "RISK_COSHH") return;
    if (view === "INCIDENTS") return;
    if (view === "FINANCE") return;
    if (view === "TRAINING_DETAIL") return;
    if (view === "USER_ACCESS") return;
    if (view === "ACCESS_DENIED") return;
    // if (view === "PPE_LIST") return;
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
            case "ACCESS_DENIED":
              return <AccessDenied onNavigate={navigateTo} />;
            case "DASHBOARD":
              return <ComplianceDashboardView onNavigate={navigateTo} />;
            case "ATTENDANCE":
              return <AttendanceModule />;
            case "ADMIN_ATTENDANCE":
              return <AdminAttendance />;

            case "EMPLOYEE_ATTENDANCE":
              return <EmployeeAttendance />;
            case "REGULARIZATION":
              return <AttendanceRegularization />;
            case "INSPECTION":
              return (
                <SiteInspection
                  onView={goToInspectionDetail}
                  onCreate={goToCreateInspection}
                />
              );
            case "SITE_ALLOCATION":
              return <SiteAllocation onBack={goToSites} />;
            case "SITES":
              return (
                <SitesList
                  onSelectSite={goToSite}
                  onNavigateAllocation={goToAllocation}
                />
              );

            case "INSPECTION_DETAIL":
              return (
                <InspectionDetail
                  inspectionId={selectedInspectionId}
                  onBack={() => navigateTo("INSPECTION")}
                />
              );
            case "SITE_DETAIL":
              return (
                <SiteDetail
                  siteId={selectedSiteId}
                  onBack={() => navigateTo("SITES")}
                />
              );
            case "EMPLOYEE_COMPLIANCE":
              return <EmployeeCompliance onNavigate={navigateTo} />;
            case "TRAINING_CERTIFICATION":
              return <TrainingCertification onNavigate={navigateTo} />;
            case "TRAINING_DETAIL":
              return <TrainingDetail onNavigate={navigateTo} />;
            case "PPE":
              return <PPEModule onNavigate={navigateTo} />;
            case "CLEANERS_LIST":
              return (
                <CleanersList onNavigate={navigateTo} cleaners={cleaners} />
              );
            case "CLEANER_DETAIL":
              // Use the latest data for the selected cleaner (matched by id)
              const detailCleaner = selectedCleaner
                ? cleaners.find((c) => c.id === selectedCleaner.id) ||
                  selectedCleaner
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
              // Use the latest data for the selected cleaner (matched by id)
              const reportCleaner = selectedCleaner
                ? cleaners.find((c) => c.id === selectedCleaner.id) ||
                  selectedCleaner
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
              return <ClientSitesModule />;
            case "DOCUMENT_CONTROL":
              return <DocumentControlModule />;
            case "RISK_COSHH":
              return <RiskCoshhModule />;
            case "INCIDENTS":
              return <IncidentsModule />;
            case "FINANCE":
              return (
                <FinanceModule
                  sidebar={showSidebar}
                  handlesidebar={handlefinancesidebar}
                />
              );
            case "USER_ACCESS":
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

  if (verificationGate.state === "checking") {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-sm text-gray-500">
          Checking your verification status...
        </div>
      </div>
    );
  }

  if (verificationGate.state === "docsRequired") {
    return (
      <MyApplication
        onSubmitted={() =>
          setVerificationGate({
            state: "blocked",
            status: "Pending",
            resubmitted: true,
          })
        }
        onLogout={handleEmployeeLogout}
      />
    );
  }

  if (verificationGate.state === "blocked") {
    const gateStatus = (verificationGate.status || "").toLowerCase();
    const isRejected = gateStatus === "rejected";
    const isUnknown = gateStatus === "unknown";
    const isResubmitted = !!verificationGate.resubmitted;

    const title = isRejected
      ? "Verification Rejected"
      : isUnknown
        ? "Unable to Check Verification"
        : isResubmitted
          ? "Documents Resubmitted"
          : "Verification Pending";

    return (
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#2e4150] px-7 py-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[30px]">
                  {isRejected ? "gpp_bad" : "pending_actions"}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold">{title}</h2>

                <p className="text-sm text-white/80 mt-1">
                  ERP access is restricted until your verification is approved
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-7 py-8">
            <h3 className="text-xl font-bold text-[#0d121b]">
              You have successfully logged in to XpectGroup ERP
            </h3>

            {isRejected ? (
              <>
                <p className="mt-4 text-base leading-7 text-[#4c669a]">
                  Unfortunately, your background verification has been
                  rejected. Please check the email we sent you for details.
                </p>
                {verificationGate.notes && (
                  <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                    <p className="text-sm font-semibold text-red-700">
                      Reason
                    </p>
                    <p className="mt-1 text-sm text-red-600 leading-6">
                      {verificationGate.notes}
                    </p>
                  </div>
                )}
                <p className="mt-4 text-sm leading-6 text-[#4c669a]">
                  Please contact the administration team if you need help.
                </p>
              </>
            ) : isUnknown ? (
              <p className="mt-4 text-base leading-7 text-[#4c669a]">
                We couldn't confirm your verification status right now. Please
                try again in a few minutes.
              </p>
            ) : (
              <>
                <p className="mt-4 text-base leading-7 text-[#4c669a]">
                  {isResubmitted
                    ? "Thank you — your updated documents have been submitted successfully."
                    : "Your onboarding form has been submitted successfully."}
                </p>

                <p className="mt-3 text-base leading-7 text-[#4c669a]">
                  {isResubmitted
                    ? "Your application status is pending while the administration team reviews your documents again."
                    : "However, your application status is still pending while the administration team reviews it."}
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
                        Please wait, or check back after 24 hours.
                      </p>

                      <p className="mt-1 text-xs text-amber-600 leading-6">
                        Once your verification has been completed, your ERP
                        access will automatically become active.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleEmployeeLogout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  logout
                </span>
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{renderView()}</>;
};

export default App;
