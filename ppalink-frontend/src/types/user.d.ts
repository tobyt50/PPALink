// This interface defines the shape of a single verification request
// as it comes from our new backend endpoint.

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
    candidateProfile: {
      firstName: string;
      lastName: string;
    } | null;
  };
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