import { useState } from "react";
import api from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);

  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  // LOGIN
  const handleLogin = async (e: any) => {
    e.preventDefault();

    setError("");

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    try {
      setLoading(true);

      const data = await api.auth.login({
        username,
        password,
      });

      localStorage.setItem("xpect_authToken", data.token);

      localStorage.setItem("xpect_user", JSON.stringify(data.user));

      window.location.href = "/";
    } catch (err: any) {
      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Invalid username or password",
      );
    } finally {
      setLoading(false);
    }
  };

  // SEND OTP
  const handleSendOtp = async () => {
    try {
      setError("");
      setSuccessMessage("");

      if (!username.trim()) {
        setError("Please enter username");
        return;
      }

      setLoading(true);

      const res = await api.auth.forgotPassword({
        username,
      });

      setOtpSent(true);

      setSuccessMessage(res.message || "OTP sent successfully");
    } catch (err: any) {
      setError(
        err?.message || err?.response?.data?.message || "Failed to send OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  // RESET PASSWORD
  const handleResetPassword = async () => {
    try {
      setError("");
      setSuccessMessage("");

      if (!otp.trim()) {
        setError("OTP is required");
        return;
      }

      if (!newPassword.trim()) {
        setError("New password is required");
        return;
      }

      setLoading(true);

      const res = await api.auth.resetPassword({
        username,
        otp,
        newPassword,
      });

      alert(res.message || "Password reset successfully");

      // reset modal after success
      setTimeout(() => {
        setShowForgotPassword(false);

        setOtpSent(false);

        setOtp("");

        setNewPassword("");

        setPassword("");

        setSuccessMessage("");
      }, 2000);
    } catch (err: any) {
      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Failed to reset password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="h-screen flex items-center justify-center bg-[#f4f6f9]">
        <div className="w-[420px] bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Login</h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  error
                </span>

                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  check_circle
                </span>

                <span>{successMessage}</span>
              </div>
            )}

            {/* Username */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1">
                USERNAME
              </label>

              <input
                className={`px-3 py-3 rounded-lg border bg-gray-50 text-sm focus:outline-none focus:ring-2 ${
                  error
                    ? "border-red-200 focus:ring-red-200"
                    : "border-gray-200 focus:ring-gray-300"
                }`}
                placeholder="e.g. John Smith"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);

                  setError("");
                }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1">
                PASSWORD
              </label>

              <input
                type="password"
                className={`px-3 py-3 rounded-lg border bg-gray-50 text-sm focus:outline-none focus:ring-2 ${
                  error
                    ? "border-red-200 focus:ring-red-200"
                    : "border-gray-200 focus:ring-gray-300"
                }`}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);

                  setError("");
                }}
              />
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end -mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(true);

                  setError("");

                  setSuccessMessage("");
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 text-blue-600 text-xs p-3 rounded-lg">
              Login credentials are securely handled. Please keep your password
              confidential.
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 py-3 rounded-lg bg-gray-800 text-white font-semibold hover:bg-gray-900 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#2e4150] px-6 py-5 text-white">
              <h2 className="text-xl font-bold">Reset Password</h2>

              <p className="text-sm text-white/80 mt-1">
                Verify your identity using OTP
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Username */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  USERNAME
                </label>

                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                  placeholder="Enter username"
                />
              </div>

              {/* OTP */}
              {otpSent && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">
                      OTP CODE
                    </label>

                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                      placeholder="Enter OTP"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">
                      NEW PASSWORD
                    </label>

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                      placeholder="Enter new password"
                    />
                  </div>
                </>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowForgotPassword(false);

                    setOtpSent(false);

                    setOtp("");

                    setNewPassword("");

                    setError("");

                    setSuccessMessage("");
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium"
                >
                  Cancel
                </button>

                {!otpSent ? (
                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-[#2e4150] text-white text-sm font-semibold"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                ) : (
                  <button
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-[#2e4150] text-white text-sm font-semibold"
                  >
                    {loading ? "Updating..." : "Reset Password"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
