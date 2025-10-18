import { NotificationType, Prisma, PositionVisibility, PositionStatus, Role, UserStatus, VerificationStatus } from '@prisma/client';
import { subDays, startOfDay } from 'date-fns';
import prisma from '../../config/db';
import env from '../../config/env';
import { randomBytes } from 'crypto';
import { hashPassword } from '../utils/crypto';
import sgMail from '@sendgrid/mail';
import { onlineUsers, ioInstance } from '../../config/socket';
import { createNotification } from '../notifications/notification.service';
import { logAdminAction } from '../auditing/audit.service';

/**
 * Fetches a paginated list of all users.
 * Excludes sensitive information like password hashes.
 * @returns A list of all users.
 */
export async function getAllUsers(queryParams: {
  q?: string;
  role?: Role;
  status?: UserStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const { q, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = queryParams;

  const where: Prisma.UserWhereInput = {};

  if (role) { where.role = role; }
  if (status) { where.status = status; }

  if (q) {
    where.OR = [
      { email: { contains: q, mode: 'insensitive' } },
      { candidateProfile: { firstName: { contains: q, mode: 'insensitive' } } },
      { candidateProfile: { lastName: { contains: q, mode: 'insensitive' } } },
      { ownedAgencies: { some: { name: { contains: q, mode: 'insensitive' } } } },
    ];
  }

  const orderBy: Prisma.UserOrderByWithRelationInput = {};
  if (sortBy === 'email') {
    orderBy.email = sortOrder;
  } else {
    orderBy.createdAt = sortOrder;
  }

  return prisma.user.findMany({
    where,
    orderBy,
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      emailVerifiedAt: true,
      createdAt: true,
      updatedAt: true,
      candidateProfile: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      ownedAgencies: {
        select: {
          id: true,
          name: true,
          domainVerified: true,
          cacVerified: true,
          subscriptions: {
            include: {
              plan: true,
            },
          },
          members: true,
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
export async function updateUserStatus(userId: string, newStatus: UserStatus, adminUserId: string) {
  // Find the user first to ensure they exist
  const userBefore = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userBefore) {
    throw new Error('User not found.');
  }

  // Prevent an admin from accidentally changing their own status
  if (userBefore.role === 'ADMIN') {
      throw new Error('Cannot change the status of an admin account.');
  }

  const updatedUser = await prisma.user.update({
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

  await logAdminAction(adminUserId, 'user.status.update', userId, {
    targetUserEmail: updatedUser.email,
    previousStatus: userBefore?.status,
    newStatus: updatedUser.status,
  });
}

/**
 * Fetches aggregated analytics for the admin dashboard.
 */
export async function getAdminDashboardAnalytics() {
  // Use Prisma's interactive transactions to run all queries concurrently
  const [
    // 1. Get total user count
    totalUsers,
    // 2. Get user counts grouped by role
    userCountsByRole,
    // 3. Get total job postings
    totalJobs,
    // 4. Get total applications
    totalApplications,
    // 5. Get count of pending verifications
    pendingVerifications,
    // 6. Get total job views
    totalJobViews,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.groupBy({
      by: ['role'],
      _count: {
        _all: true, // count all users in each role group
      },
      orderBy: {
        role: 'asc', // Required for deterministic results
      },
    }),
    prisma.position.count(),
    prisma.application.count(),
    prisma.verification.count({
      where: { status: VerificationStatus.PENDING },
    }),
    prisma.jobView.count(),
  ]);

  // 6. Process the grouped data into a more friendly format
  const roles = userCountsByRole.reduce((acc, group) => {
    const count = group._count as { _all: number };
    acc[group.role] = count._all;
    return acc;
  }, {} as Record<Role, number>);

  // 7. Return structured analytics
  return {
    totalUsers,
    userDistribution: {
      candidates: roles.CANDIDATE || 0,
      agencies: roles.AGENCY || 0,
      admins: roles.ADMIN || 0,
    },
    totalJobs,
    totalApplications,
    pendingVerifications,
    totalJobViews,
  };
}

/**
 * Fetches time-series analytics for the main admin dashboard.
 */
export async function getAdminTimeSeriesAnalytics() {
  const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));

  // Run all time-series queries in parallel
  const [
    userSignups,
    jobsPosted,
    applicationsSubmitted
  ] = await prisma.$transaction([
    // Get daily user signups (grouped by role) for the last 30 days
    prisma.user.groupBy({
      by: ['createdAt', 'role'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { _all: true },
      orderBy: { createdAt: 'asc' },
    }),
    // Get daily job postings for the last 30 days
    prisma.position.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { _all: true },
      orderBy: { createdAt: 'asc' },
    }),
    // Get daily applications for the last 30 days
    prisma.application.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { _all: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // We will process this raw data in the controller or frontend
  // to format it correctly for the charting library.
  return {
    userSignups,
    jobsPosted,
    applicationsSubmitted,
  };
}

/**
 * Fetches the complete details for a single user for the admin panel.
 * @param userId The ID of the user to fetch.
 */
export async function getUserDetails(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      // Include all relevant relations for a comprehensive view
      candidateProfile: {
        include: {
          skills: { include: { skill: true } },
          workExperiences: true,
          education: true,
        },
      },
      ownedAgencies: {
        include: {
          subscriptions: { include: { plan: true } },
          members: true,
        },
      },
      // We can add more relations here later, like applications or jobs
    },
  });

  if (!user) {
    throw new Error('User not found.');
  }

  // Omit the password hash before sending the user object
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Fetches all job positions posted by a specific agency owner.
 * @param userId The ID of the agency's owner user.
 */
export async function getJobsForAgencyUser(userId: string) {
  const agency = await prisma.agency.findFirst({
    where: { ownerUserId: userId },
    select: { id: true },
  });

  if (!agency) {
    // If the user owns no agency, they have no jobs. Return an empty array.
    return [];
  }

  return prisma.position.findMany({
    where: { agencyId: agency.id },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Fetches all applications submitted by a specific candidate.
 * @param userId The ID of the candidate's user account.
 */
export async function getApplicationsForCandidateUser(userId: string) {
  const candidate = await prisma.candidateProfile.findFirst({
    where: { userId: userId },
    select: { id: true },
  });

  if (!candidate) {
    // If the user has no candidate profile, they have no applications.
    return [];
  }

  return prisma.application.findMany({
    where: { candidateId: candidate.id },
    include: {
      position: { // Include position details for context
        select: {
          title: true,
          agency: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Allows an admin to send a direct message to a user from the system account.
 * @param toUserId The ID of the user receiving the message.
 * @param body The content of the message.
 */
export async function sendSystemMessage(toUserId: string, body: string, adminUserId: string) {
  if (!env.SYSTEM_USER_ID) {
    throw new Error('System User ID is not configured.');
  }

  const recipient = await prisma.user.findUnique({ where: { id: toUserId }, select: { email: true } });
  
  const message = await prisma.message.create({
    data: {
      fromId: env.SYSTEM_USER_ID,
      toId: toUserId,
      body: body,
    },
  });

  // 2. After sending the message, emit a 'new_message' event to the recipient
  // so their inbox updates in real-time if it's open.
  const recipientSocketId = onlineUsers.get(toUserId);
  if (recipientSocketId) {
      ioInstance.to(recipientSocketId).emit('new_message', message);
  }

  await createNotification({
      userId: toUserId,
      message: 'You have a new message from PPALink Support',
      link: `/inbox?with=${env.SYSTEM_USER_ID}`,
      type: NotificationType.MESSAGE,
      meta: {
          lastMessage: body,
      }
  }, ioInstance);

  await logAdminAction(adminUserId, 'user.message.send', toUserId, {
    recipientEmail: recipient?.email,
    messageExcerpt: body.substring(0, 50) + (body.length > 50 ? '...' : ''),
  });
  return message;
}

/**
 * Fetches all job positions on the platform for the admin panel, with filtering and searching.
 */
export async function getAllJobs(queryParams: { q?: string; status?: string; visibility?: string; industryId?: string }) {
  const { q, status, visibility, industryId } = queryParams;

  const where: Prisma.PositionWhereInput = {};
  const orderBy: Prisma.PositionOrderByWithRelationInput = { createdAt: 'desc' };

  if (status) { where.status = status as any; }
  if (visibility) { where.visibility = visibility as any; }
  if (industryId) { where.agency = { industryId: parseInt(industryId) }; }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { agency: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  return prisma.position.findMany({
    where,
    include: { agency: { select: { id: true, name: true } } },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Admin action to update any job posting.
 * Bypasses the agency ownership check.
 */
export async function adminUpdateJob(jobId: string, data: any) { // Using `any` for flexibility, will be validated by Zod
  // We can reuse the existing job update logic from the job service if it's refactored
  // For simplicity here, we'll call prisma directly.
  return prisma.position.update({
    where: { id: jobId },
    data,
  });
}

/**
 * Admin action to quickly unpublish a job (set its visibility to PRIVATE).
 */
export async function adminUnpublishJob(jobId: string) {
  return prisma.position.update({
    where: { id: jobId },
    data: {
      visibility: PositionVisibility.PRIVATE,
    },
  });
}

/**
 * Admin action to quickly republish a job (set its visibility to PUBLIC).
 */
export async function adminRepublishJob(jobId: string) {
  return prisma.position.update({
    where: { id: jobId },
    data: {
      visibility: PositionVisibility.PUBLIC,
    },
  });
}

/**
 * Admin action to fetch the full details of any job on the platform.
 * @param jobId The ID of the job to fetch.
 */
export async function adminGetJobById(jobId: string) {
  const job = await prisma.position.findUnique({
    where: { id: jobId },
    include: {
      agency: { select: { id: true, name: true, domainVerified: true, cacVerified: true } },
      skills: { include: { skill: true } },
    },
  });

  if (!job) {
    throw new Error('Job not found.');
  }
  return job;
}

/**
 * Fetches all users with ADMIN or SUPER_ADMIN roles.
 */
export async function getAllAdmins(query: any) {
  const { sortBy = 'createdAt', sortOrder = 'desc', q } = query;
  
  const where: Prisma.UserWhereInput = {
    role: { in: [Role.ADMIN, Role.SUPER_ADMIN] },
    // Add a search clause for email
    ...(q && { email: { contains: q, mode: 'insensitive' } }),
  };
  
  return prisma.user.findMany({
    where,
    select: { id: true, email: true, role: true, status: true, createdAt: true },
    orderBy: { [sortBy]: sortOrder },
  });
}

/**
 * Creates a new admin user and sends them an email with a temporary password.
 * @param email The new admin's email.
 * @param role The role to assign (ADMIN or SUPER_ADMIN).
 * @param actorId The ID of the Super Admin performing the action (for auditing).
 */

export async function createAdmin(email: string, role: Role, actorId: string) {
  if (role !== Role.ADMIN && role !== Role.SUPER_ADMIN) {
    throw new Error('Invalid role specified for an admin user.');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('A user with this email already exists.');
  }

  const temporaryPassword = randomBytes(12).toString('hex');
  const passwordHash = await hashPassword(temporaryPassword);

  const newAdmin = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      emailVerifiedAt: new Date(),
      passwordResetRequired: true,
    },
  });

  await logAdminAction(actorId, 'admin.create', newAdmin.id, {
    newAdminEmail: newAdmin.email,
    assignedRole: newAdmin.role,
  });

  const msg = {
    to: email,
    from: env.SMTP_FROM_EMAIL!,
    subject: 'Your PPALink Admin Account has been created',
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to the PPALink Admin Team</h2>
        <p>An administrator account has been created for you.</p>
        <p>Your username is: <strong>${email}</strong></p>
        <p>Your temporary password is: <strong style="font-family: monospace; background-color: #f1f5f9; padding: 4px 8px; border-radius: 4px;">${temporaryPassword}</strong></p>
        <p>For security, you will be required to change this password upon your first login.</p>
        <a href="${env.FRONTEND_URL}/login" style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: bold; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
            Log In Now
        </a>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Admin invitation email sent successfully to ${email}`);
  } catch (error) {
    console.error("CRITICAL: Failed to send admin creation email:", error);
    // In a real production app, you would add this to a retry queue.
    // We will still proceed to create the user, but this error must be logged.
  }

  return newAdmin;
}

/**
 * Updates the role of an admin/super_admin user.
 * Can only be performed by a Super Admin.
 */
export async function updateAdminRole(targetUserId: string, newRole: Role, actorId: string) {
  if (newRole !== Role.ADMIN && newRole !== Role.SUPER_ADMIN) {
    throw new Error('Can only assign ADMIN or SUPER_ADMIN roles.');
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) throw new Error('Target user not found.');

  if (targetUser.id === actorId) {
    throw new Error('You cannot change your own role.');
  }

  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });

  await logAdminAction(actorId, 'admin.role.update', targetUserId, {
    targetUserEmail: updatedUser.email,
    previousRole: targetUser.role,
    newRole: updatedUser.role,
  });

  return updatedUser;
}

/**
 * Deletes an admin user.
 * @param targetUserId The ID of the admin to delete.
 * @param actorId The ID of the Super Admin performing the action.
 */
export async function deleteAdmin(targetUserId: string, actorId: string) {
    const adminToDelete = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!adminToDelete) throw new Error('Admin user not found.');

    if (adminToDelete.id === actorId) {
        throw new Error('You cannot delete your own account.');
    }
    
    await prisma.user.delete({ where: { id: targetUserId } });

    await logAdminAction(actorId, 'admin.delete', targetUserId, {
        deletedAdminEmail: adminToDelete.email,
        deletedAdminRole: adminToDelete.role,
    });
}

/**
 * Marks an admin's onboarding process as complete.
 * @param adminUserId The ID of the admin user to update.
 */
export async function markAdminOnboardingComplete(adminUserId: string) {
  return prisma.user.update({
    where: { id: adminUserId },
    data: { hasCompletedAdminOnboarding: true },
  });
}