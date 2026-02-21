import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'xpect-onboarding-secret-key-change-in-production';

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
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authentication token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyOnboardingToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired authentication token'
      });
    }

    // Verify employee role and onboarding access
    if (decoded.role !== 'employee') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied. Employee role required.'
      });
    }

    if (decoded.onboardingAllowed !== true) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Onboarding access not granted'
      });
    }

    // Attach decoded token data to request
    req.employee = {
      inviteToken: decoded.inviteToken,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token verification failed'
    });
  }
};

/**
 * Middleware to verify onboarding JWT token (legacy - use verifyEmployeeSession)
 * Protects onboarding routes from unauthorized access
 */
export const verifyOnboardingAccess = (req, res, next) => {
  return verifyEmployeeSession(req, res, next);
};
