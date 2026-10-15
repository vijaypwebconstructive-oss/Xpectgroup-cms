/**
 * Authentication utilities for employee onboarding
 */

export interface EmployeeToken {
  inviteToken: string;
  email: string;
  role: "employee";
  onboardingAllowed: boolean;
  iat?: number;
  exp?: number;
}

/**
 * Get employee JWT token from sessionStorage
 */
export const getEmployeeToken = (): string | null => {
  return sessionStorage.getItem("employeeJWT");
};

/**
 * Save employee JWT token to sessionStorage
 */
export const saveEmployeeToken = (token: string): void => {
  sessionStorage.setItem("employeeJWT", token);
};

/**
 * Clear employee session data
 */
export const clearEmployeeSession = (): void => {
  sessionStorage.removeItem("employeeJWT");
  sessionStorage.removeItem("onboardingToken");
  sessionStorage.removeItem("onboardingEmail");
  sessionStorage.removeItem("onboardingEmployeeName");
  try {
    localStorage.removeItem(PERSISTED_SESSION_KEY);
  } catch {
    /* storage unavailable */
  }
};

/**
 * The onboarding session lives in sessionStorage, which the browser clears
 * when the tab is closed. A copy is kept in localStorage so an applicant who
 * closes the tab by mistake can come back without verifying the OTP again
 * (until the token expires).
 */
const PERSISTED_SESSION_KEY = "xpect_onboarding_session";
const SESSION_KEYS = [
  "employeeJWT",
  "onboardingToken",
  "onboardingEmail",
  "onboardingEmployeeName",
];

/** Copy the current onboarding session into localStorage */
export const persistEmployeeSession = (): void => {
  try {
    const data: Record<string, string> = {};
    SESSION_KEYS.forEach((key) => {
      const value = sessionStorage.getItem(key);
      if (value !== null) data[key] = value;
    });
    if (data.employeeJWT) {
      localStorage.setItem(PERSISTED_SESSION_KEY, JSON.stringify(data));
    }
  } catch {
    /* storage unavailable */
  }
};

/**
 * Restore the onboarding session after the tab was closed and reopened.
 * Call once at startup, before the app renders. Expired sessions are removed.
 */
export const restoreEmployeeSession = (): void => {
  try {
    // Only on onboarding pages, so an admin tab in the same browser is
    // never treated as an applicant session
    if (!window.location.pathname.startsWith("/onboarding")) return;
    if (sessionStorage.getItem("employeeJWT")) return;

    const raw = localStorage.getItem(PERSISTED_SESSION_KEY);
    if (!raw) return;

    const data = JSON.parse(raw) as Record<string, string>;
    if (!data.employeeJWT || isTokenExpired(data.employeeJWT)) {
      localStorage.removeItem(PERSISTED_SESSION_KEY);
      return;
    }

    SESSION_KEYS.forEach((key) => {
      if (data[key] != null) sessionStorage.setItem(key, data[key]);
    });
  } catch {
    /* storage unavailable or corrupt data */
  }
};

/**
 * Check if user is an employee (has employee JWT)
 */
export const isEmployee = (): boolean => {
  return !!getEmployeeToken();
};

/**
 * Decode JWT token (without verification - for client-side checks only)
 * Note: Real verification must be done on backend
 */
export const decodeToken = (token: string): EmployeeToken | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

/**
 * Check if token is expired (client-side check only)
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("xpect_user");
  return user ? JSON.parse(user) : null;
};
