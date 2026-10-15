import React from "react";

interface LoadingOverlayProps {
  /** Overlay is shown while a message is set; pass null to hide it. */
  message: string | null;
}

/**
 * Full-screen loading overlay shown while a change (save, delete, upload, send)
 * is in progress. Blocks interaction until the request finishes.
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/30 backdrop-blur-[1px] animate-in fade-in duration-200"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="bg-white rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center gap-3 min-w-[220px]">
        <span className="material-symbols-outlined animate-spin text-[#2e4150] text-4xl">
          progress_activity
        </span>
        <p className="text-sm font-bold text-[#0d121b]">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
