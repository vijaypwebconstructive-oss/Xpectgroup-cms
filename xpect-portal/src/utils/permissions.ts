import {
  ROLE_PERMISSIONS,
  MODULE_KEY_TO_LABEL,
  ModuleKey,
  UserRole,
} from "../modules/user-access/types";
import type { AppView } from "../types";

/** Maps main CMS shell views to RBAC module keys (Step 10 modules only). */
export const viewToModuleKey = (view: AppView): string | null => {
  switch (view) {
    case "DASHBOARD":
      return "dashboard";

    case "EMPLOYEE_COMPLIANCE":
    case "CLEANERS_LIST":
    case "CLEANER_DETAIL":
    case "REPORT":
    case "STAFF_INVITES":
    case "TRAINING_CERTIFICATION":
      return "employee compliance";

    case "CLIENTS_SITES":
      return "sites";

    case "RISK_COSHH":
      return "risk";

    case "INCIDENTS":
      return "incident";

    case "DOCUMENT_CONTROL":
      return "document";

    case "FINANCE":
      return "finance";

    case "USER_ACCESS":
      return "users";

    case "ATTENDANCE":
      return "timesheet";

    default:
      return null;
  }
};

/** Module-level gate: any access except `no_access` allows the route (fine-grained levels deferred). */
export const canAccessModule = (user: any, moduleKey: string) => {
  if (!user) return false;

  // Admin full access
  if (user.role === "Admin") return true;

  console.log("module key", moduleKey);
  console.log("usermodules", user.module);

  // // Safety check
  // if (!Array.isArray(user.module)) return false;

  return user.module.includes(moduleKey);
};
