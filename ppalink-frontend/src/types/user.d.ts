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
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CANDIDATE' | 'AGENCY';
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  candidateProfile?: CandidateProfile;
  ownedAgencies?: Agency[];
  passwordResetRequired: boolean;
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

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
export interface AuditLog {
  id: string;
  actor: {
    email: string;
  };
  action: string;
  targetId: string | null;
  metadata: {
    // For user.status.update & verification.status.update
    previousStatus?: UserStatus | VerificationStatus;
    newStatus?: UserStatus | VerificationStatus;

    // For plan.create
    createdPlan?: Partial<SubscriptionPlan>;
    
    // For plan.update
    planName?: string;
    before?: Partial<SubscriptionPlan>;
    after?: Partial<SubscriptionPlan>;

    // For plan.delete
    deletedPlan?: {
        name: string;
        price: number;
    };

    // For admin.user_impersonate & verification.status.update
    targetUserEmail?: string;

    // For verification.status.update
    verificationId?: string;
    verificationType?: VerificationType;
    
    // For user.message.send
    recipientEmail?: string;
    messageExcerpt?: string;

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
    role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENCY' | 'CANDIDATE';
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