export const canAccessModule = (user: any, module: any) => {
  if (!user) return false;

  // Admin → full access
  if (user.role === "Admin") return true;

  return user.module?.includes(module);
};
