import type { CandidateProfile } from './candidate';
import type { Position } from './job';

export type ApplicationStatus = 'APPLIED' | 'REVIEWING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
export type InterviewMode = 'INPERSON' | 'REMOTE' | 'PHONE';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED';
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
export interface Application {
  id: string;
  positionId: string;
  candidateId: string;
  status: ApplicationStatus;
  notes: string | null;

  matchScore: number | null;
  createdAt: string;
  
  candidate: CandidateProfile;

  position: Position; 

  interviews?: Interview[];
  offers?: Offer[];
}
export interface Interview {
  id: string;
  applicationId: string;
  scheduledAt: string;
  mode: InterviewMode;
  location: string | null;
  details: string | null;
  status: InterviewStatus;
}
export interface Offer {
  id: string;
  applicationId: string;
  salary: number | null;
  startDate: string | null;
  status: OfferStatus;
}
export interface InterviewPipelineData {
  unscheduled: Application[];
  scheduled: Application[];
}