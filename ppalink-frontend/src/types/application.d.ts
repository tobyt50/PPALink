import type { CandidateProfile } from './candidate';
import type { Position } from './job';

export type ApplicationStatus = 'APPLIED' | 'REVIEWING' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN';

export interface Application {
  id: string;
  positionId: string;
  candidateId: string;
  status: ApplicationStatus;
  notes: string | null;
  createdAt: string;
  
  candidate: CandidateProfile;

  position: Position; 
}