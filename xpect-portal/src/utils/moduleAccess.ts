export const canAccessModule = (user: any, module: any) => {
  console.log("runned");
  if (!user) return false;

  // Admin → full access
  if (user.role === "Admin") return true;

  return user.module?.includes(module);
};
