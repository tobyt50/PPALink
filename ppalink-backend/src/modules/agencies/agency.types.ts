import { z } from 'zod';

export const updateAgencyProfileSchema = z.object({
  name: z.string().min(2, 'Agency name is required').optional(),
  rcNumber: z.string().optional().nullable(),
  industryId: z.number().int().positive().optional().nullable(),
  website: z.string().url().or(z.literal('')).optional().nullable(),
  sizeRange: z.string().optional().nullable(), // e.g., "1-10", "11-50"
  headquartersStateId: z.number().int().positive().optional().nullable(),
  lgaId: z.number().int().positive().optional().nullable(),
});

export type UpdateAgencyProfileInput = z.infer<typeof updateAgencyProfileSchema>;