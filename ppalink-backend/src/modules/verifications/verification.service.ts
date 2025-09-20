import { Prisma, VerificationStatus, VerificationType, VerificationLevel } from '@prisma/client';
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
          role: true,
          candidateProfile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          ownedAgencies: {
            select: {
                name: true,
            }
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
 * If the request is a CAC approval, it also updates the agency's status.
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

  // Use a transaction to ensure both updates happen or neither do
  return prisma.$transaction(async (tx) => {
    // 1. Update the verification record itself
    const verification = await tx.verification.update({
      where: { id: verificationId },
      data: {
        status: newStatus,
        reviewedBy: adminUserId,
      },
      include: {
        user: { include: { ownedAgencies: true, candidateProfile: true } }
      }
    });

    // 2. THIS IS THE NEW LOGIC: If a CAC request was approved, update the agency
    if (verification.type === 'CAC' && newStatus === 'APPROVED' && verification.user.ownedAgencies.length > 0) {
      const agencyId = verification.user.ownedAgencies[0].id;
      await tx.agency.update({
        where: { id: agencyId },
        data: { cacVerified: true },
      });
    }

    if (verification.user.candidateProfile) {
        let newLevel = verification.user.candidateProfile.verificationLevel;

        // You can create a hierarchy of verification here.
        // For example, NYSC verification is a higher level than email.
        if (verification.type === 'NYSC' && newLevel !== 'NYSC_VERIFIED') {
          newLevel = VerificationLevel.NYSC_VERIFIED;
        } else if (verification.type === 'CERTIFICATE' && newLevel !== 'CERTS_VERIFIED') {
           // Add more levels as needed
        }

        // Update the candidate's main profile with the new status
        await tx.candidateProfile.update({
          where: { id: verification.user.candidateProfile.id },
          data: {
            isVerified: true, // Set the general verified flag
            verificationLevel: newLevel,
          },
        });
      }

    return verification;
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
        candidateProfile: true,
        ownedAgencies: true,
        },
      },
    },
  });

  if (!verification) {
    throw new Error('Verification request not found.');
  }

  return verification;
}