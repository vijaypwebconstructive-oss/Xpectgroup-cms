// import { rolePermissions } from "../config/rolePermissions.js";

// /**
//  * Requires authenticate middleware first (req.user.role).
//  * @param {string} moduleName — one of rolePermissions values: users, sites, rams, payroll, compliance
//  */
// export const checkModuleAccess = (moduleName) => (req, res, next) => {
//   const role = req.user?.role;
//   const allowed = role && rolePermissions[role]?.includes(moduleName);
//   if (!allowed) {
//     return res.status(403).json({
//       error: "Forbidden",
//       message: `Role '${role || "unknown"}' does not have access to '${moduleName}'`,
//     });
//   }
//   next();
// };
