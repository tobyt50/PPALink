import { z } from 'zod';

export const reportFiltersSchema = z.object({
  startDate: z.string().datetime(), // Expect ISO 8601 format
  endDate: z.string().datetime(),
  groupBy: z.enum(['day', 'week', 'month']),

  // --- ALL CANDIDATE-RELATED FILTERS ---
  countryId: z.number().optional(),
  regionId: z.number().optional(),
  cityId: z.number().optional(),
  nyscBatch: z.string().optional(),
  nyscStream: z.string().optional(),
  gpaBand: z.string().optional(),
  graduationYear: z.number().optional(),
  isVerified: z.boolean().optional(),
  isOpenToReloc: z.boolean().optional(),
  fieldOfStudy: z.string().optional(),

  // --- ALL AGENCY-RELATED FILTERS ---
  industryId: z.number().optional(),
  planId: z.string().uuid().optional(),
  isDomainVerified: z.boolean().optional(),
  isCacVerified: z.boolean().optional(),
});

export type ReportFilters = z.infer<typeof reportFiltersSchema>;