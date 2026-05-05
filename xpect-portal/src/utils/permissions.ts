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
      return "compliance";
    case "CLIENTS_SITES":
      return "sites";
    case "RISK_COSHH":
      return "rams";
    case "FINANCE":
      return "payroll";
    case "USER_ACCESS":
      return "users";
    default:
      return null;
  }
};

/** Module-level gate: any access except `no_access` allows the route (fine-grained levels deferred). */
export const canAccessModule = (
  role: UserRole | null | undefined,
  key: ModuleKey,
): boolean => {
  if (!role) return false;
  const label = MODULE_KEY_TO_LABEL[key];
  const entry = ROLE_PERMISSIONS[role]?.find((p) => p.module === label);
  return !!entry && entry.access !== "no_access";
};
