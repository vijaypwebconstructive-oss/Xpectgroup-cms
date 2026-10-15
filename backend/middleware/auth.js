import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "xpect-onboarding-secret-key-change-in-production";

const CMS_ROLES = ["Admin", "Supervisor", "CMS Operator"];

// Verify JWT token
export const verifyOnboardingToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Middleware to verify employee session
 * Ensures user has valid employee JWT with onboarding access
 */
export const verifyEmployeeSession = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "No valid authentication token provided",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyOnboardingToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired authentication token",
      });
    }

    // Verify employee role and onboarding access
    if (decoded.role !== "employee") {
      return res.status(403).json({
        error: "Forbidden",
        message: "Access denied. Employee role required.",
      });
    }

    if (decoded.onboardingAllowed !== true) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Onboarding access not granted",
      });
    }

    // Attach decoded token data to request
    req.employee = {
      inviteToken: decoded.inviteToken,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Token verification failed",
    });
  }
};

// /**
//  * Middleware to verify onboarding JWT token (legacy - use verifyEmployeeSession)
//  * Protects onboarding routes from unauthorized access
//  */
// export const verifyOnboardingAccess = (req, res, next) => {
//   return verifyEmployeeSession(req, res, next);
// };

/**
 * Verify JWT for CMS (SystemUser) API access.
 * Rejects employee/onboarding tokens and any role not in CMS_ROLES.
 * Attaches req.user = { id, role } (id = SystemUser string id from token).
 */
export const authenticate = (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing bearer token",
    });
  }
  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded?.id || !CMS_ROLES.includes(decoded.role)) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid token for CMS API",
      });
    }
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired token",
    });
  }
};

/**
 * Verify the ERP login JWT of an employee (a User linked to a staff record).
 * Attaches req.employeeUser = { userId, cleanerId, username }.
 * Used by /api/my-application so employees can only access their own record.
 */
export const authenticateEmployeeUser = async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Please log in again.",
    });
  }

  try {
    // Read the secret at request time: .env is loaded after route modules
    const secret =
      process.env.JWT_SECRET ||
      "xpect-onboarding-secret-key-change-in-production";
    const decoded = jwt.verify(header.slice(7), secret);

    const user = await User.findById(decoded?.id).lean();
    if (!user || !user.cleanerId) {
      return res.status(403).json({
        error: "Forbidden",
        message: "This account is not linked to a staff record.",
      });
    }

    req.employeeUser = {
      userId: String(user._id),
      cleanerId: user.cleanerId,
      username: user.username,
    };
    next();
  } catch {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Your session has expired. Please log in again.",
    });
  }
};
