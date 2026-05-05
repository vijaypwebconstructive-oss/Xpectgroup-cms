import { PERMISSIONS } from "../config/rolePermissions.js";

export const allowModule = (module) => {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role) {
      return res.status(403).json({ message: "No role found" });
    }

    const allowedModules = PERMISSIONS[role];

    if (!allowedModules || !allowedModules.includes(module)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};
