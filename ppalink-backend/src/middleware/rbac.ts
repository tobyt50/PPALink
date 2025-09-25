import { Role } from "@prisma/client";
import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth";

/**
 * Middleware to check if a user has one of the required roles.
 * A SUPER_ADMIN is granted access to any route requiring an ADMIN role.
 */
export const requireRole = (requiredRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const userRole = req.user.role;
    
    // If the user is a SUPER_ADMIN, they can access any route.
    // Or if an ADMIN route is required, a SUPER_ADMIN also gets access.
    const hasPermission = 
      userRole === 'SUPER_ADMIN' ||
      requiredRoles.includes(userRole) ||
      (requiredRoles.includes('ADMIN') && userRole === 'SUPER_ADMIN');
    
    if (hasPermission) {
      return next();
    }

    return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
  };
};