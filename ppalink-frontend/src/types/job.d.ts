import type { Agency } from './agency';
import type { Application } from './application';

interface Skill {
  id: number;
  name: string;
}
interface PositionSkill {
  requiredLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  skill: Skill;
}

export type EmploymentType = 'INTERN' | 'NYSC' | 'FULLTIME' | 'PARTTIME' | 'CONTRACT';
export type PositionVisibility = 'PUBLIC' | 'PRIVATE';
export type PositionStatus = 'DRAFT' | 'OPEN' | 'CLOSED';
export type JobLevel = 'ENTRY' | 'INTERMEDIATE' | 'SENIOR' | 'PRINCIPAL';

export interface Position {
  id: string;
  agencyId: string;
  title: string;
  description: string;
  employmentType: EmploymentType;
  isRemote: boolean;
  countryId: number | null;
  regionId: number | null;
  cityId: number | null;
  minSalary: number | null;
  maxSalary: number | null;
  currency: string | null;
  visibility: PositionVisibility;
  status: PositionStatus;
  createdAt: string;
  updatedAt: string;
  level: JobLevel;
  allowedCountryIds: number[];
  skills?: PositionSkill[];
  applications?: Application[]; 
  pipelineInstitutions?: string[];

  agency?: Pick<Agency, 'id' | 'name' | 'domainVerified' | 'cacVerified' | 'logoKey'>;
  metrics?: Record<ApplicationStatus, { avgDaysInStage: number }>;
}