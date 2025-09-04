import argon2 from "argon2";
import type { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import env from "../../config/env";

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

export function signToken(
  payload: object,
  expiresIn: SignOptions["expiresIn"] = "7d"
): string {
  return jwt.sign(payload, env.JWT_SECRET as Secret, { expiresIn });
}

export function verifyToken<T extends object = JwtPayload>(token: string): T {
  return jwt.verify(token, env.JWT_SECRET as Secret) as T;
}
