import { z } from 'zod';

export const UpdateCandidateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, 'First name is required').optional(),
    lastName: z.string().min(2, 'Last name is required').optional(),
    phone: z.string().optional().nullable(),
    dob: z.coerce.date().optional().nullable(), // z.coerce attempts to convert string to date
    gender: z.string().optional().nullable(),
    summary: z.string().optional().nullable(),
    linkedin: z.string().url('Must be a valid URL').optional().nullable(),
    portfolio: z.string().url('Must be a valid URL').optional().nullable(),

    // Job Preferences
    isRemote: z.boolean().optional(),
    isOpenToReloc: z.boolean().optional(),
    salaryMin: z.number().int().positive().optional().nullable(),
    salaryMax: z.number().int().positive().optional().nullable(),
    availability: z.coerce.date().optional().nullable(),
    
    // NYSC & Education
    nyscBatch: z.string().optional().nullable(),
    nyscStream: z.string().optional().nullable(),
    stateCode: z.string().optional().nullable(),
    graduationYear: z.number().int().min(1960).max(new Date().getFullYear() + 5).optional().nullable(),
    gpaBand: z.string().optional().nullable(),

    // Location
    primaryStateId: z.number().int().optional().nullable(),
    lgaId: z.number().int().optional().nullable(),
  }),
});


export type UpdateCandidateProfileInput = z.infer<typeof UpdateCandidateProfileSchema>['body'];