export type Role = "Admin" | "Supervisor";

export const PERMISSIONS: Record<Role, string[]> = {
  Admin: [
    "dashboard",
    "users",
    "sites",
    "risk",
    "finance",
    "compliance",
    "incident",
    "document",
  ],
  Supervisor: ["sites", "risk", "compliance", "incident"],
};

export const canAccess = (role: string, module: string) => {
  return PERMISSIONS[role as Role]?.includes(module);
};
