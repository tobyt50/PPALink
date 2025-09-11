import { UserStatus } from '@prisma/client';
import prisma from '../../config/db';

/**
 * Fetches a paginated list of all users.
 * Excludes sensitive information like password hashes.
 * @returns A list of all users.
 */
export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    // Explicitly select the fields to return, omitting the passwordHash
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      emailVerifiedAt: true,
      createdAt: true,
      updatedAt: true,
      // We can also include profile names for context
      candidateProfile: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      ownedAgencies: {
        select: {
          name: true,
        },
      },
    },
  });
}

/**
 * Updates the status of a specific user.
 * @param userId The ID of the user to update.
 * @param newStatus The new status for the user ('ACTIVE', 'SUSPENDED', 'DELETED').
 */
export async function updateUserStatus(userId: string, newStatus: UserStatus) {
  // Find the user first to ensure they exist
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found.');
  }

  // Prevent an admin from accidentally changing their own status
  if (user.role === 'ADMIN') {
      throw new Error('Cannot change the status of an admin account.');
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: newStatus,
    },
    // Return the updated user without the password hash
    select: {
      id: true, email: true, phone: true, role: true, status: true,
      emailVerifiedAt: true, createdAt: true, updatedAt: true,
    },
  });
}