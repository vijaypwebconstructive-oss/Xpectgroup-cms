/**
 * Authentication utilities for employee onboarding
 */

export interface EmployeeToken {
  inviteToken: string;
  email: string;
  role: 'employee';
  onboardingAllowed: boolean;
  iat?: number;
  exp?: number;
}

/**
 * Get employee JWT token from sessionStorage
 */
export const getEmployeeToken = (): string | null => {
  return sessionStorage.getItem('employeeJWT');
};

/**
 * Save employee JWT token to sessionStorage
 */
export const saveEmployeeToken = (token: string): void => {
  sessionStorage.setItem('employeeJWT', token);
};

/**
 * Clear employee session data
 */
export const clearEmployeeSession = (): void => {
  sessionStorage.removeItem('employeeJWT');
  sessionStorage.removeItem('onboardingToken');
  sessionStorage.removeItem('onboardingEmail');
  sessionStorage.removeItem('onboardingEmployeeName');
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
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
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
