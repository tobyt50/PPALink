import type { User } from './user';
import { z } from 'zod';

// --- Zod Schemas for Frontend Validation (if needed) ---
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required.'),
  twoFactorToken: z.string().optional(),
});

// --- Type Payloads for Service Functions ---
export type LoginPayload = z.infer<typeof loginSchema>;

export const registerCandidateSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});
export type RegisterCandidatePayload = z.infer<typeof registerCandidateSchema>;

export const registerAgencySchema = z.object({
  agencyName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});
export type RegisterAgencyPayload = z.infer<typeof registerAgencySchema>;


// --- API Response Types ---
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
  twoFactorRequired?: boolean;
}

export interface Generate2faResponse {
  qrCodeDataUrl: string;
}