import React, { useState, useEffect } from 'react';
import { getEmployeeToken, isTokenExpired, decodeToken, clearEmployeeSession } from '../utils/auth';
import api from '../services/api';

interface EmployeeRouteGuardProps {
  inviteToken: string | null;
  children: React.ReactNode;
  onRedirectToAuth: (token: string) => void;
}

const EmployeeRouteGuard: React.FC<EmployeeRouteGuardProps> = ({
  inviteToken,
  children,
  onRedirectToAuth
}) => {
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verifyAccess = async () => {
      setIsChecking(true);
      setError('');

      // Get employee JWT token
      const token = getEmployeeToken();
      
      if (!token) {
        setError('No authentication token found');
        setIsValid(false);
        setIsChecking(false);
        if (inviteToken) {
          onRedirectToAuth(inviteToken);
        }
        return;
      }

      // Check if token is expired (client-side check)
      if (isTokenExpired(token)) {
        setError('Your session has expired. Please verify your OTP again.');
        clearEmployeeSession();
        setIsValid(false);
        setIsChecking(false);
        if (inviteToken) {
          onRedirectToAuth(inviteToken);
        }
        return;
      }

      // Verify token with backend if inviteToken is available
      if (inviteToken) {
        try {
          const result: any = await api.invitations.verifyEmployeeToken(token, inviteToken);
          
          if (result.success && result.data.role === 'employee' && result.data.onboardingAllowed) {
            setIsValid(true);
          } else {
            setError('Access denied. Invalid token or insufficient permissions.');
            clearEmployeeSession();
            setIsValid(false);
            if (inviteToken) {
              onRedirectToAuth(inviteToken);
            }
          }
        } catch (err: any) {
          console.error('Token verification failed:', err);
          // If backend verification fails but token exists and isn't expired, allow access
          // This handles cases where backend is temporarily unavailable
          const decoded = decodeToken(token);
          if (decoded && decoded.role === 'employee' && decoded.onboardingAllowed) {
            console.warn('[EmployeeRouteGuard] Backend verification failed, but token is valid. Allowing access.');
            setIsValid(true);
          } else {
            setError(err.message || 'Token verification failed');
            clearEmployeeSession();
            setIsValid(false);
            if (inviteToken) {
              onRedirectToAuth(inviteToken);
            }
          }
        } finally {
          setIsChecking(false);
        }
      } else {
        // No inviteToken but we have a valid JWT - allow access (for direct navigation)
        const decoded = decodeToken(token);
        if (decoded && decoded.role === 'employee' && decoded.onboardingAllowed) {
          setIsValid(true);
        } else {
          setError('Invalid invitation token');
          setIsValid(false);
        }
        setIsChecking(false);
      }
    };

    verifyAccess();
  }, [inviteToken, onRedirectToAuth]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#f2f6f9] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full shadow-sm">
          <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="material-symbols-outlined text-gray-400 text-4xl animate-spin">hourglass_empty</span>
          </div>
          <p className="text-gray-600 font-semibold">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-[#f2f6f9] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full shadow-sm">
          <div className="size-16 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="material-symbols-outlined text-red-500 text-4xl">error</span>
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error || 'You do not have access to this page.'}</p>
          {inviteToken && (
            <button
              onClick={() => onRedirectToAuth(inviteToken)}
              className="px-6 py-3 bg-[#2e4150] text-white font-bold rounded-full hover:bg-[#2e4150]/90 transition-colors"
            >
              Go to Verification
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default EmployeeRouteGuard;
