import { z } from 'zod';

// REMOVED the z.object({ body: ... }) wrapper.
// The schema now directly represents the payload.
export const UpdateCandidateProfileSchema = z.object({
  firstName: z.string().min(2, 'First name is required').optional(),
  lastName: z.string().min(2, 'Last name is required').optional(),
  phone: z.string().optional().nullable(),
  dob: z.coerce.date().optional().nullable(),
  gender: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  linkedin: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
  portfolio: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
  isRemote: z.boolean().optional(),
  isOpenToReloc: z.boolean().optional(),
  salaryMin: z.number().int().positive().optional().nullable(),
  salaryMax: z.number().int().positive().optional().nullable(),
  availability: z.coerce.date().optional().nullable(),
  nyscBatch: z.string().optional().nullable(),
  nyscStream: z.string().optional().nullable(),
  stateCode: z.string().optional().nullable(),
  graduationYear: z.number().int().min(1960).optional().nullable(),
  gpaBand: z.string().optional().nullable(),
  primaryStateId: z.number().int().optional().nullable(),
  lgaId: z.number().int().optional().nullable(),
});

// The exported type is now simpler and correctly inferred.
export type UpdateCandidateProfileInput = z.infer<typeof UpdateCandidateProfileSchema>;