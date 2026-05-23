import {
  ROLE_PERMISSIONS,
  MODULE_KEY_TO_LABEL,
  ModuleKey,
  UserRole,
} from "../modules/user-access/types";
import type { AppView } from "../types";

/** Maps main CMS shell views to RBAC module keys (Step 10 modules only). */
export const viewToModuleKey = (view: AppView): ModuleKey | null => {
  switch (view) {
    case "DASHBOARD":
      return "dashboard";

    case "CLIENTS_SITES":
      return "client";

    case "RISK_COSHH":
      return "risk";

    case "FINANCE":
      return "finance";

    case "USER_ACCESS":
      return "users";

    case "DOCUMENT_CONTROL":
      return "document";

    case "INCIDENTS":
      return "incident";

    case "SITE_DETAIL":
      return "sites";

    case "INSPECTION_DETAIL":
      return "site inspection";

    case "EMPLOYEE_COMPLIANCE":
      return "employee compliance";

    case "ATTENDANCE":
      return "admin attendance";

    default:
      return null;
  }
};

/** Module-level gate: any access except `no_access` allows the route (fine-grained levels deferred). */
export const canAccessModule = (user: any, key: any): boolean => {
  if (!user) return false;

  // Admin → full access
  if (user.role === "Admin") return true;

  return user.module?.includes(key);
};
