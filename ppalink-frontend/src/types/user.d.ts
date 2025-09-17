import type { CandidateProfile } from './candidate';

export type VerificationType = 'EMAIL' | 'DOMAIN' | 'CAC' | 'NYSC' | 'NIN' | 'CERTIFICATE';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface VerificationRequest {
  id: string;
  userId: string;
  type: VerificationType;
  status: VerificationStatus;
  evidence: {
    fileKey: string;
    fileName: string;
  } | null; // Assuming evidence is a JSON object with this shape
  createdAt: string;
  user: {
    email: string;
    candidateProfile: CandidateProfile | null;
    candidateProfile: {
      firstName: string;
      lastName: string;
    } | null;
  };
}

export interface AgencyMember {
  id: string;
  userId: string;
  role: 'OWNER' | 'MANAGER' | 'RECRUITER';
  user: { // The nested user object
      id: string;
      email: string;
      status: User['status'];
      candidateProfile?: {
          firstName: string;
          lastName: string;
      } | null;
  }
}

// This type should mirror the User model from Prisma, excluding sensitive fields.
export interface User {
  id: string;
  email: string;
  phone: string | null;
  role: 'ADMIN' | 'CANDIDATE' | 'AGENCY';
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  createdAt: string;
  updatedAt: string;
  candidateProfile?: {
    firstName: string;
    lastName: string;
  } | null;
  ownedAgencies?: {
    name: string;
  }[];
}