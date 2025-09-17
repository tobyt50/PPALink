import { Prisma, VerificationStatus, VerificationType } from '@prisma/client';
import prisma from '../../config/db';

/**
 * Fetches all verification requests that are currently pending.
 */
export async function getPendingVerifications() {
  return prisma.verification.findMany({
    where: {
      status: VerificationStatus.PENDING,
    },
    // Include user details for context in the admin panel
    include: {
      user: {
        select: {
          email: true,
          candidateProfile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'asc', // Show the oldest requests first
    },
  });
}

/**
 * Updates the status of a specific verification request.
 * @param verificationId The ID of the verification to update.
 * @param newStatus The new status ('APPROVED' or 'REJECTED').
 * @param adminUserId The ID of the admin performing the action.
 */
export async function updateVerificationStatus(
  verificationId: string,
  newStatus: VerificationStatus,
  adminUserId: string
) {
  if (newStatus === VerificationStatus.PENDING) {
    throw new Error('Cannot set verification status back to PENDING.');
  }

  return prisma.verification.update({
    where: {
      id: verificationId,
    },
    data: {
      status: newStatus,
      reviewedBy: adminUserId, // Record which admin reviewed the request
    },
  });
}

/**
 * Creates a new verification submission for a user.
 * Prevents creating a new request if one is already pending for the same type.
 * @param userId The ID of the user submitting the request.
 * @param type The type of verification being requested.
 * @param evidence The JSON object containing the fileKey and fileName.
 */
export async function createVerificationSubmission(
  userId: string,
  type: VerificationType,
  evidence: Prisma.JsonObject
) {
  // Check for an existing pending request of the same type for this user
  const existingPending = await prisma.verification.findFirst({
    where: {
      userId,
      type,
      status: VerificationStatus.PENDING,
    },
  });

  if (existingPending) {
    throw new Error(`You already have a pending ${type} verification request.`);
  }

  return prisma.verification.create({
    data: {
      userId,
      type,
      evidence,
      status: VerificationStatus.PENDING,
    },
  });
}

/**
 * Fetches a single verification request by its ID, including the full user profile.
 * @param verificationId The ID of the verification request.
 */
export async function getVerificationDetails(verificationId: string) {
  const verification = await prisma.verification.findUnique({
    where: {
      id: verificationId,
    },
    include: {
      // Include the full user object
      user: {
        include: {
          // And within the user, include their full candidate profile
          candidateProfile: true,
        },
      },
    },
  });

  if (!verification) {
    throw new Error('Verification request not found.');
  }

  return verification;
}