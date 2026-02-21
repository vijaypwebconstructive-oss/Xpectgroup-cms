import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
import api from '../services/api';

interface OnboardingAuthProps {
  inviteToken: string;
  onNavigate: (view: AppView) => void;
}

/** Local types for API responses used only in this component */
interface InvitationByToken {
  status?: string;
  email?: string;
  id?: string;
}
interface VerifyOtpResult {
  token?: string;
  data?: { email?: string; employeeName?: string };
}

const OnboardingAuth: React.FC<OnboardingAuthProps> = ({ inviteToken, onNavigate }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    const checkInvitation = async () => {
      if (!inviteToken) {
        setError('Invalid invitation link');
        setCheckingToken(false);
        return;
      }

      try {
        const data = await api.invitations.getByToken(inviteToken) as InvitationByToken;
        setInvitation(data);
        
        // If already verified and has valid JWT, redirect to onboarding
        const existingJWT = sessionStorage.getItem('employeeJWT');
        if ((data.status === 'VERIFIED' || data.status === 'PENDING') && existingJWT) {
          // Verify JWT is still valid
          try {
            await api.invitations.verifyEmployeeToken(existingJWT, inviteToken);
            sessionStorage.setItem('onboardingToken', inviteToken);
            sessionStorage.setItem('onboardingEmail', data.email ?? '');
            onNavigate('ONBOARDING');
            return;
          } catch (err) {
            // JWT expired or invalid, need to verify OTP again
            sessionStorage.removeItem('employeeJWT');
          }
        } else if (data.status === 'COMPLETED') {
          setError('This invitation has already been completed.');
        } else if (data.status === 'EXPIRED') {
          setError('This invitation has expired. Please contact your administrator.');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Invalid invitation link');
      } finally {
        setCheckingToken(false);
      }
    };

    checkInvitation();
  }, [inviteToken, onNavigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError('');
      // Focus last input
      document.getElementById(`otp-5`)?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    if (!inviteToken) {
      setError('Invalid invitation token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.invitations.verifyOtp(inviteToken, otpString) as VerifyOtpResult;
      
      // Store JWT token and invitation data securely
      if (result.token) {
        console.log('[OnboardingAuth] ✅ OTP verified successfully, storing tokens...');
        
        // Save employee JWT token
        sessionStorage.setItem('employeeJWT', result.token);
        sessionStorage.setItem('onboardingToken', inviteToken);
        sessionStorage.setItem('onboardingEmail', result.data?.email ?? '');
        sessionStorage.setItem('onboardingEmployeeName', result.data?.employeeName ?? '');
        
        // Verify tokens are stored
        const storedJWT = sessionStorage.getItem('employeeJWT');
        const storedToken = sessionStorage.getItem('onboardingToken');
        console.log('[OnboardingAuth] 📦 Tokens stored:', { 
          hasJWT: !!storedJWT, 
          hasToken: !!storedToken,
          tokenLength: storedToken?.length 
        });
        
        // Use setTimeout to ensure sessionStorage is committed before navigation
        setTimeout(() => {
          console.log('[OnboardingAuth] 🔄 Redirecting to /onboarding...');
          // Redirect to onboarding form using window.location.href for reliable navigation
          window.location.href = '/onboarding';
        }, 300);
      } else {
        throw new Error('No access token received');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'OTP verification failed. Please try again.');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-[#f2f6f9] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full shadow-sm">
          <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="material-symbols-outlined text-gray-400 text-4xl animate-spin">hourglass_empty</span>
          </div>
          <p className="text-gray-600 font-semibold">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-[#f2f6f9] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full shadow-sm">
          <div className="size-16 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="material-symbols-outlined text-red-500 text-4xl">error</span>
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">{error || 'This invitation link is invalid or has expired.'}</p>
          <button
            onClick={() => onNavigate('DASHBOARD')}
            className="px-6 py-3 bg-[#2e4150] text-white font-bold rounded-full hover:bg-[#2e4150]/90 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f6f9] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm">
        <div className="text-center mb-8">
          <div className="size-16 bg-[#2e4150] rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="material-symbols-outlined text-white text-4xl">mail</span>
          </div>
          <h2 className="text-2xl font-bold font-black text-[#0d121b] mb-2">Verify Your Identity</h2>
          <p className="text-[#4c669a] text-sm">
            We've sent a 6-digit OTP to <span className="font-bold">{invitation.email}</span>
          </p>
          <p className="text-[#4c669a] text-sm mt-1">
            Please enter the code below to continue with onboarding.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#0d121b] mb-3 text-center">
              Enter OTP Code
            </label>
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:border-[#2e4150] focus:ring-2 focus:ring-[#2e4150]/20 outline-none transition-colors"
                  style={{
                    borderColor: error ? '#ef4444' : '#e7ebf3'
                  }}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            {error && (
              <p className="text-sm text-red-500 mt-3 text-center">{error}</p>
            )}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="w-full h-12 bg-[#2e4150] text-white font-bold rounded-full hover:bg-[#2e4150]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">hourglass_empty</span>
                <span>Verifying...</span>
              </>
            ) : (
              'Verify OTP'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
            <button
              onClick={async () => {
                if (!invitation) {
                  alert('Please wait for invitation details to load.');
                  return;
                }
                try {
                  setLoading(true);
                  await api.invitations.resendOtp(invitation.id);
                  alert('OTP has been resent! Please check your email inbox.');
                  // Clear OTP inputs
                  setOtp(['', '', '', '', '', '']);
                  document.getElementById('otp-0')?.focus();
                } catch (err: unknown) {
                  alert(`Failed to resend OTP: ${err instanceof Error ? err.message : 'Unknown error'}`);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || !invitation}
              className="text-sm text-[#000] font-bold hover:text-[#2e4150]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingAuth;
