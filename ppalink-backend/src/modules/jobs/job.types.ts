import { EmploymentType, PositionStatus, PositionVisibility, JobLevel } from '@prisma/client';
import { z } from 'zod';

// Schema for CREATING a new position
export const createJobPositionSchema = z.object({
  title: z.string().min(5, 'Job title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  employmentType: z.nativeEnum(EmploymentType),
  isRemote: z.boolean().default(false),
  stateId: z.number().int().positive().optional().nullable(),
  lgaId: z.number().int().positive().optional().nullable(),
  minSalary: z.number().int().positive().optional().nullable(),
  maxSalary: z.number().int().positive().optional().nullable(),
  level: z.nativeEnum(JobLevel),
  skills: z.any().optional().nullable(),
  visibility: z.nativeEnum(PositionVisibility),
  status: z.nativeEnum(PositionStatus).default(PositionStatus.OPEN),
}).refine(data => {
    // Ensure that if maxSalary is provided, minSalary is also provided and is less than or equal to maxSalary
    if (data.maxSalary !== null && data.maxSalary !== undefined) {
      return data.minSalary !== null && data.minSalary !== undefined && data.minSalary <= data.maxSalary;
    }
    return true;
  }, {
    message: 'minSalary must be less than or equal to maxSalary',
    path: ['minSalary'], // Point error to the minSalary field
});


// Schema for UPDATING an existing position
// All fields are optional
export const updateJobPositionSchema = createJobPositionSchema.partial();

export type CreateJobPositionInput = z.infer<typeof createJobPositionSchema>;
export type UpdateJobPositionInput = z.infer<typeof updateJobPositionSchema>;