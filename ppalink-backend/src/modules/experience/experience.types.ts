import { z } from 'zod';

// --- Work Experience Schemas ---
export const workExperienceSchema = z.object({
  title: z.string().min(2, 'Job title is required.'),
  company: z.string().min(2, 'Company name is required.'),
  startDate: z.coerce.date().refine(
    (val) => !!val,
    { message: 'Start date is required.' }
  ),
  endDate: z.coerce.date().optional().nullable(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional().nullable(),
}).refine(data => !data.isCurrent ? !!data.endDate : true, {
  message: "End date is required unless it's your current job.",
  path: ["endDate"],
});

export const updateWorkExperienceSchema = workExperienceSchema.partial();


// --- Education Schemas ---
export const educationSchema = z.object({
  institution: z.string().min(3, 'Institution name is required.'),
  degree: z.string().min(2, 'Degree is required.'),
  field: z.string().optional().nullable(),
  grade: z.string().optional().nullable(),
  startDate: z.coerce.date().refine(
    (val) => !!val,
    { message: 'Start date is required.' }
  ),
  endDate: z.coerce.date().refine(
    (val) => !!val,
    { message: 'End date is required.' }
  ),
  
});

export const updateEducationSchema = educationSchema.partial();