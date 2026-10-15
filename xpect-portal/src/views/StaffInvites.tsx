import React, { useState, useMemo, useEffect, useRef } from "react";
import { AppView, InvitationStatus, StaffInvitation } from "../types";
import SendInviteModal from "../components/SendInviteModal";
import LoadingOverlay from "../components/LoadingOverlay";
import api from "../services/api";

// e.g. "21 Oct, 10:00"
const formatLinkDate = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

interface StaffInvitesProps {
  onNavigate: (view: AppView) => void;
}

const StaffInvites: React.FC<StaffInvitesProps> = () => {
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  // Floating message (top-right) instead of browser alerts
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Fetch invitations from backend
  const fetchInvitations = async (showLoading: boolean = false) => {
    try {
      if (showLoading) setLoading(true);
      setError("");
      const data = await api.invitations.getAll();
      setInvitations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch invitations:", err);
      setError(err.message || "Failed to load invitations");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations(true); // Initial load shows loading

    // Auto-refresh invitations every 10 seconds to sync progress
    const interval = setInterval(() => {
      fetchInvitations(); // Auto-refresh does not show loading
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Generate onboarding URL
  const generateInvitationUrl = (inviteToken: string) => {
    return `${window.location.origin}/onboarding/auth/${inviteToken}`;
  };

  const handleSendInvite = async (
    name: string,
    email: string,
    senderName: string,
    senderDesignation: string,
    salaryType: string,
    salaryAmount: number,
  ): Promise<boolean> => {
    try {
      setLoadingMessage("Sending invitation...");
      await api.invitations.send({
        employeeName: name,
        email,
        senderName,
        senderDesignation,
        salaryType,
        salaryAmount,
      });

      // Refresh invitations list
      await fetchInvitations();

      showToast(
        "success",
        `Onboarding invitation has been sent successfully to ${email}.`,
      );
      return true;
    } catch (err: any) {
      showToast(
        "error",
        `Failed to send invitation: ${err.message || "Unknown error"}`,
      );
      return false;
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleResendOtp = async (invitation: StaffInvitation) => {
    try {
      setLoadingMessage("Resending OTP...");
      await api.invitations.resendOtp(invitation.id);
      showToast("success", `OTP resent to ${invitation.email}.`);
      // Refresh invitations to show updated status
      await fetchInvitations();
    } catch (err: any) {
      showToast(
        "error",
        `Failed to resend OTP: ${err.message || "Unknown error"}`,
      );
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleCopyLink = async (invitation: StaffInvitation) => {
    const url = generateInvitationUrl(invitation.inviteToken);
    try {
      await navigator.clipboard.writeText(url);
      showToast("success", "Invitation link copied to clipboard.");
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showToast("success", "Invitation link copied to clipboard.");
    }
  };

  const handleDelete = async (invitation: StaffInvitation) => {
    // Confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete the invitation for ${invitation.employeeName} (${invitation.email})?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoadingMessage("Deleting invitation...");
      await api.invitations.delete(invitation.id);

      // Refresh invitations list without showing loading spinner
      await fetchInvitations();

      showToast(
        "success",
        `Invitation for ${invitation.employeeName} deleted.`,
      );
    } catch (err: any) {
      console.error("Failed to delete invitation:", err);
      showToast(
        "error",
        `Failed to delete invitation: ${err.message || "Unknown error"}`,
      );
    } finally {
      setLoadingMessage(null);
    }
  };

  const getStatusStyles = (status: InvitationStatus) => {
    switch (status) {
      case InvitationStatus.SENT:
        return "bg-blue-100 text-blue-700";
      case InvitationStatus.VERIFIED:
        return "bg-amber-100 text-amber-700";
      case InvitationStatus.PENDING:
        return "bg-yellow-100 text-yellow-700";
      case InvitationStatus.COMPLETED:
        return "bg-green-100 text-green-700";
      case InvitationStatus.EXPIRED:
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredInvitations = useMemo(() => {
    return invitations.filter(
      (inv) =>
        inv.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [invitations, searchTerm]);

  return (
    <div className="flex-1 flex flex-col w-full py-[15px] sm:py-8 px-4 sm:px-6 md:px-10 animate-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-160px)]">
      <LoadingOverlay message={loadingMessage} />

      {/* Floating message */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 left-5 sm:left-auto z-[9999] animate-in slide-in-from-top-3 duration-300"
        >
          <div
            className={`sm:min-w-[320px] sm:max-w-[420px] rounded-2xl px-5 py-4 shadow-2xl border flex items-start gap-3 ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            <span className="material-symbols-outlined text-[22px] shrink-0">
              {toast.type === "success" ? "check_circle" : "error"}
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold">
                {toast.type === "success" ? "Success" : "Error"}
              </p>
              <p className="text-sm mt-0.5 leading-6 break-words">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="shrink-0 opacity-60 hover:opacity-100"
              aria-label="Close message"
            >
              <span className="material-symbols-outlined text-[18px]">
                close
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="w-full space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-black font-bold">
              Staff Invitations
            </h1>
            <p className="text-[#4c669a] text-base">
              Send onboarding form links and track invitation status.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150] transition-all px-[30px] py-[15px] h-10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] display-none sm:block">
                mail
              </span>
              <span>Send Invite</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-2 rounded-2xl border border-[#e7ebf3] shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="w-full lg:flex-1">
              <label className="flex items-center w-full h-11 bg-[#f6f6f8] rounded-lg px-4 border border-transparent transition-all">
                <span className="material-symbols-outlined text-[#4c669a] mr-2">
                  search
                </span>
                <input
                  className="w-full bg-transparent border-none text-[#0d121b] placeholder:text-[#4c669a] text-sm outline-none"
                  placeholder="Search invitations by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-[#e7ebf3] p-20 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-gray-300 text-4xl animate-spin">
                hourglass_empty
              </span>
            </div>
            <p className="text-[#4c669a]">Loading invitations...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-[#e7ebf3] p-20 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="size-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-red-500 text-4xl">
                error
              </span>
            </div>
            <h3 className="text-xl font-black text-gray-900">
              Failed to load invitations
            </h3>
            <p className="text-[#4c669a] max-w-sm mt-2">{error}</p>
          </div>
        ) : filteredInvitations.length > 0 ? (
          <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm lg:overflow-x-scroll scrollbar-thin employee-list">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[#e7ebf3] text-[#4c669a] text-[10px] uppercase tracking-widest font-black">
                  <th className="px-[16px] sm:px-6 py-4 text-sm font-medium text-[#0d121b] capitalize">
                    Employee
                  </th>
                  <th className="px-[16px] sm:px-6 py-4 text-sm font-medium text-[#0d121b] capitalize">
                    Status
                  </th>
                  <th className="px-[16px] whitespace-nowrap sm:px-6 py-4 text-sm font-medium text-[#0d121b] capitalize">
                    Current Step
                  </th>
                  <th className="px-[16px] sm:px-6 py-4 text-sm font-medium text-[#0d121b] capitalize">
                    Type
                  </th>
                  <th className="px-[16px] sm:px-6 py-4 text-sm font-medium text-[#0d121b] capitalize">
                    Progress
                  </th>
                  <th className="px-[16px] whitespace-nowrap sm:px-6 py-4 text-sm font-medium text-[#0d121b] capitalize">
                    Link Status
                  </th>
                  <th className="px-[16px] sm:px-6 py-4 text-right text-sm font-medium text-[#0d121b] capitalize">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {filteredInvitations.map((invitation) => (
                  <tr
                    key={invitation.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-[16px] sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-12 sm:size-14 rounded-full border border-[#e7ebf3] overflow-hidden bg-gray-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-400 text-2xl">
                            person
                          </span>
                        </div>
                        <div>
                          <p className="text-base sm:text-base font-bold text-[#0d121b]">
                            {invitation.employeeName}
                          </p>
                          <p className="text-sm text-[#4c669a]">
                            {invitation.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-[16px] sm:px-6 py-4">
                      <span
                        className={` text-xs  font-bold px-2 py-1 rounded-full ${getStatusStyles(invitation.status)}`}
                      >
                        {invitation.status}
                      </span>
                    </td>
                    <td className="px-[16px] sm:px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">
                      {invitation.currentStepName || "—"}
                    </td>
                    <td className="px-[16px] sm:px-6 py-4 text-sm font-medium text-[#0d121b]">
                      Onboarding
                    </td>
                    <td className="px-[16px] sm:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#34d399] h-full rounded-full"
                            style={{
                              width: `${invitation.onboardingProgress}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-500">
                          {invitation.onboardingProgress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-[16px] sm:px-6 py-4 whitespace-nowrap">
                      {/* Onboarding link: active until 3 working days after sending */}
                      {invitation.status === InvitationStatus.COMPLETED ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                          Completed
                        </span>
                      ) : invitation.status === InvitationStatus.EXPIRED ? (
                        <>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                            Expired
                          </span>
                          {invitation.expiresAt && (
                            <p className="text-[11px] text-gray-500 mt-1.5">
                              on {formatLinkDate(invitation.expiresAt)}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                            Active
                          </span>
                          {invitation.expiresAt && (
                            <p className="text-[11px] text-gray-500 mt-1.5">
                              Expires {formatLinkDate(invitation.expiresAt)}
                            </p>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-[16px] sm:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* OTP cannot be resent once onboarding is completed */}
                        {invitation.status !== InvitationStatus.COMPLETED &&
                          invitation.status !== InvitationStatus.EXPIRED && (
                          <>
                            <button
                              onClick={() => handleResendOtp(invitation)}
                              className="text-[#2e4150] font-bold text-xs cursor-pointer hover:text-[#135bec] transition-colors"
                              title="Resend OTP"
                            >
                              Resend OTP
                            </button>
                            <span className="text-gray-300">|</span>
                          </>
                        )}
                        <button
                          onClick={() => handleCopyLink(invitation)}
                          className="text-[#2e4150] font-bold text-xs cursor-pointer hover:text-[#135bec] transition-colors"
                          title="Copy Link"
                        >
                          Copy Link
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDelete(invitation)}
                          className="text-red-600 font-bold text-xs cursor-pointer hover:text-red-700 transition-colors"
                          title="Delete Invitation"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e7ebf3] p-20 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-black text-4xl">
                mail_outline
              </span>
            </div>
            <h3 className="text-xl font-black text-gray-900 font-bold">
              No invitations sent yet
            </h3>
            <p className="text-[#4c669a] max-w-sm mt-2">
              Start by sending your first invitation to a new staff member.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 bg-[#2e4150] text-white font-bold px-8 py-3 rounded-full hover:bg-[#2e4150]/90 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined">mail</span>
              Send First Invitation
            </button>
          </div>
        )}
      </div>

      <SendInviteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSend={handleSendInvite}
      />
    </div>
  );
};

export default StaffInvites;
