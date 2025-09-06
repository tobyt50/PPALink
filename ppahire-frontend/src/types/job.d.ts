// This type should mirror the `Position` model in your Prisma schema.

export type EmploymentType = 'INTERN' | 'NYSC' | 'FULLTIME' | 'PARTTIME' | 'CONTRACT';
export type PositionVisibility = 'PUBLIC' | 'PRIVATE';
export type PositionStatus = 'DRAFT' | 'OPEN' | 'CLOSED';

export interface Position {
  id: string;
  agencyId: string;
  title: string;
  description: string;
  employmentType: EmploymentType;
  isRemote: boolean;
  stateId: number | null;
  lgaId: number | null;
  minSalary: number | null;
  maxSalary: number | null;
  skillsReq: any | null; // Prisma's Json type maps to `any`
  visibility: PositionVisibility;
  status: PositionStatus;
  createdAt: string; // Dates are typically strings in JSON payloads
  updatedAt: string;
}