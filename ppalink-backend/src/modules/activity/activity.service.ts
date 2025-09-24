import prisma from '../../config/db';
import { Prisma } from '@prisma/client';

/**
 * A central function to record a user's action in the activity log.
 * This function is designed to be "fire-and-forget" and should not throw errors
 * that would interrupt the parent operation.
 * 
 * @param userId The ID of the user performing the action.
 * @param action A machine-readable string for the action (e.g., "user.login").
 * @param details Optional JSON object for additional context.
 */
export async function logActivity(
  userId: string,
  action: string,
  details?: Prisma.JsonObject
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details,
      },
    });
  } catch (error) {
    // We log the error but don't re-throw it.
    // An activity logging failure should never cause a core feature (like logging in) to fail.
    console.error(`Failed to log activity '${action}' for user ${userId}:`, error);
  }
}

/**
 * Fetches the activity log for a specific user, ordered chronologically.
 * @param userId The ID of the user whose activity is being fetched.
 */
export async function getActivityLogForUser(userId: string) {
    return prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit to the 50 most recent activities for performance
    });
}