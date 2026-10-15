import React from "react";

/**
 * Shown to an applicant whose onboarding link has expired (3 working days).
 * Intentionally has no buttons: there is nowhere for the applicant to go —
 * they need a new invitation from the administrator.
 */
const LinkExpiredPopup: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f2f6f9]">
      <div
        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="link-expired-title"
      >
        <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-[#2e4150] px-7 py-6 text-white flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[30px]">
                link_off
              </span>
            </div>
            <div>
              <h2 id="link-expired-title" className="text-xl font-bold">
                Onboarding Link Expired
              </h2>
              <p className="text-sm text-white/80 mt-1">
                This link can no longer be used
              </p>
            </div>
          </div>

          <div className="px-7 py-7 space-y-4">
            <p className="text-base leading-7 text-[#4c669a]">
              Your onboarding link has expired. Onboarding must be completed
              within <b className="text-[#0d121b]">3 working days</b> of
              receiving the invitation.
            </p>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600">
                support_agent
              </span>
              <p className="text-sm leading-6 text-amber-800">
                Please contact your administrator or the Xpect Group HR &amp;
                Compliance Team to request a new invitation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkExpiredPopup;
