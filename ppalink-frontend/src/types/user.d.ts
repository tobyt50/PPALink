import type { CandidateProfile } from './candidate';
import type { Agency } from './agency';

export type Role = 'CANDIDATE' | 'AGENCY' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
export type VerificationType = 'EMAIL' | 'DOMAIN' | 'CAC' | 'NYSC' | 'NIN' | 'CERTIFICATE';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// This type should mirror the User model from Prisma, excluding sensitive fields.
export interface User {
  id: string;
  email: string;
  phone: string | null;
  role: 'ADMIN' | 'CANDIDATE' | 'AGENCY';
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  candidateProfile?: CandidateProfile;
  ownedAgencies?: Agency[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: {
    jobId?: string;
    jobTitle?: string;
    applicationId?: string;
    positionId?: string;
    fromStatus?: string;
    toStatus?: string;
    changes?: string[];
  } | null;
  createdAt: string;
}

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
    role: 'ADMIN' | 'CANDIDATE' | 'AGENCY';
    candidateProfile: CandidateProfile | null;
    ownedAgencies?: Agency[];
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