import type { Agency } from './agency';
import type { Application } from './application';

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
  skillsReq: any | null;
  visibility: PositionVisibility;
  status: PositionStatus;
  createdAt: string;
  updatedAt: string;
  
  // 3. Add the nested applications property
  // This will only be present when fetching the full pipeline
  applications?: Application[]; 

  agency?: Pick<Agency, 'name'>;
}