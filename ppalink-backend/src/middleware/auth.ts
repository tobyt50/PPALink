import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";
import type { Role } from "@prisma/client";

// -- Extend the JWT payload type for better typing without breaking existing code.
interface JwtPayload {
  id?: string;
  email?: string;
  role?: Role;
  iat?: number;
  exp?: number;
}

// -- Backward-compatible request type
export interface AuthRequest extends Request {
  user?: JwtPayload | any;
}

/**
 * Strict authentication middleware.
 * Enforces a valid Bearer token, else 401.
 * This is 100% backward compatible with the original version.
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

/**
 * Optional authentication middleware.
 * Attempts to decode a JWT if present, but never fails.
 * Useful for public routes where authentication is optional.
 */
export function authenticateOptional(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
  } catch {
    // Ignore invalid/expired token
  }

  next();
}
