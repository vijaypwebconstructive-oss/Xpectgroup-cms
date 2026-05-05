import React from "react";
import type { AppView } from "../types";

interface AccessDeniedProps {
  onNavigate: (view: AppView) => void;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-16">
      <span className="material-symbols-outlined text-[64px] text-amber-600 mb-4">
        lock
      </span>
      <h1 className="text-2xl font-bold text-[#0d121b] mb-2">Access Denied</h1>
      <p className="text-[#6b7a99] text-center max-w-md mb-8">
        You do not have permission to access this module.
      </p>
      <button
        type="button"
        onClick={() => onNavigate("DASHBOARD")}
        className="px-6 py-3 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default AccessDenied;
