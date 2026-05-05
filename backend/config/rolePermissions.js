export const ROLES = {
  ADMIN: "Admin",
  SUPERVISOR: "Supervisor",
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: ["users", "sites", "risk", "finance", "compliance"],
  [ROLES.SUPERVISOR]: ["sites", "risk", "compliance"],
};
