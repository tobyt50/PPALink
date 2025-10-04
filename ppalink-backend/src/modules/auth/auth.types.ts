import { z } from 'zod';

// Candidate registration schema (matches User + CandidateProfile)
export const RegisterCandidateSchema = z.object({
  email: z.string().email('A valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  dob: z.string().optional(), // ISO date string, can parse to Date later
  gender: z.enum(['male', 'female']).optional(),
  nyscNumber: z.string().optional(),
  nyscBatch: z.string().optional(),
  nyscStream: z.string().optional(),
  stateCode: z.string().optional(),
  primaryStateId: z.number().optional(),
  lgaId: z.number().optional(),
  disabilityInfo: z.string().optional(),
  isRemote: z.boolean().optional(),
  isOpenToReloc: z.boolean().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  workAuth: z.string().optional(),
  summary: z.string().optional(),
  linkedin: z.string().optional(),
  portfolio: z.string().optional(),
  graduationYear: z.number().optional(),
  gpaBand: z.string().optional(),
});

// Agency registration schema (matches User + Agency)
export const RegisterAgencySchema = z.object({
  email: z.string().email('A valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  agencyName: z.string().min(3, 'Agency name is required'),
  phone: z.string().optional(),
  website: z.string().optional(),
  rcNumber: z.string().optional(),
  industryId: z.number().optional(),
  sizeRange: z.string().optional(),
  headquartersStateId: z.number().optional(),
  lgaId: z.number().optional(),
});

// User login schema
export const LoginSchema = z.object({
  email: z.string().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
  twoFactorToken: z.string().optional(),
});

export const changePasswordSchema = z.object({
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// TypeScript types
export type RegisterCandidateInput = z.infer<typeof RegisterCandidateSchema>;
export type RegisterAgencyInput = z.infer<typeof RegisterAgencySchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
