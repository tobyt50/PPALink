import { CandidateProfileType, Role } from '@prisma/client';
import prisma from '../../config/db';
import { emitToAdmins } from '../../config/socket';
import { hashPassword, signToken, verifyPassword } from '../utils/crypto';
import { LoginInput, RegisterAgencyInput, RegisterCandidateInput } from './auth.types';
import { logActivity } from '../activity/activity.service';
import { logAdminAction } from '../auditing/audit.service';
import { validateTwoFactorToken } from './2fa.service';

// --- Candidate Registration Service ---
export async function registerCandidate(input: RegisterCandidateInput) {
  const { email, password, firstName, lastName, phone, profileType } = input;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      phone,
      role: Role.CANDIDATE,
      candidateProfile: {
        create: {
          firstName,
          lastName,
          phone,
          profileType: profileType || CandidateProfileType.NYSC,
        },
      },
    },
    include: {
      candidateProfile: true,
    },
  });

  // 1. Log the registration event to the user's own activity log.
  await logActivity(user.id, 'user.register', { role: user.role });
  
  // 2. After successfully creating the user, emit an event to all connected admins.
  emitToAdmins('admin:new_signup', {
      id: user.id,
      email: user.email,
      role: user.role,
      type: 'Candidate',
  });

  const { passwordHash: _, ...userWithoutPassword } = user;
  
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  
  return { user: userWithoutPassword, token };
}


// --- Agency Registration Service ---
export async function registerAgency(input: RegisterAgencyInput) {
  const { email, password, agencyName, phone } = input;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const passwordHash = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    const owner = await tx.user.create({
      data: {
        email,
        passwordHash,
        phone,
        role: Role.AGENCY,
      },
    });
    const agency = await tx.agency.create({
      data: {
        name: agencyName,
        ownerUserId: owner.id,
      },
    });
    await tx.agencyMember.create({
      data: {
        agencyId: agency.id,
        userId: owner.id,
        role: 'OWNER',
      },
    });
    return { owner, agency };
  });

  // 3. Log the registration event for the new agency owner.
  await logActivity(result.owner.id, 'user.register', { 
    role: result.owner.role,
    agencyId: result.agency.id,
    agencyName: result.agency.name,
  });

  // 4. Emit the event for agency signups as well.
  emitToAdmins('admin:new_signup', {
      id: result.owner.id,
      email: result.owner.email,
      role: result.owner.role,
      type: 'Agency',
  });
  
  const { passwordHash: _, ...ownerWithoutPassword } = result.owner;
  
  const token = signToken({ id: result.owner.id, email: result.owner.email, role: result.owner.role });
  
  return { owner: ownerWithoutPassword, agency: result.agency, token };
}

// --- Login Service ---
export async function login(input: LoginInput) {
  const { email, password, twoFactorToken } = input;
  
  const user = await prisma.user.findUnique({ where: { email },
      include: {
          candidateProfile: true,
          ownedAgencies: true,
      } });
  
  if (!user || user.status !== 'ACTIVE') {
      throw new Error('Invalid email or password');
  }

  const isPasswordValid = await verifyPassword(user.passwordHash, password);
  if (!isPasswordValid) {
      throw new Error('Invalid email or password');
  }

  if (user.isTwoFactorEnabled) {
    if (!twoFactorToken) {
      // 1. 2FA is required, but no token was provided.
      // Signal to the frontend that the 2FA step is needed.
      return { twoFactorRequired: true };
    }

    // 2. A 2FA token was provided, so we must validate it.
    const isTokenValid = await validateTwoFactorToken(user.id, twoFactorToken);
    if (!isTokenValid) {
      throw new Error('Invalid 2FA token.');
    }
  }

  await logActivity(user.id, 'user.login');
  
  const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
  });
  
  const { passwordHash: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
}

/**
 * Generates a short-lived, single-use token for an admin to impersonate another user.
 * @param targetUserId The ID of the user to be impersonated.
 * @param adminUserId The ID of the admin performing the action.
 */
export async function generateImpersonationToken(targetUserId: string, adminUserId: string) {
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    throw new Error('Target user not found.');
  }

  await logActivity(adminUserId, 'admin.user_impersonate', {
    targetUserId: targetUser.id,
    targetUserEmail: targetUser.email,
  });

  await logAdminAction(adminUserId, 'admin.user_impersonate', targetUserId, {
    targetUserEmail: targetUser.email,
  });

  const payload = {
    id: targetUser.id,
    email: targetUser.email,
    role: targetUser.role,
    impersonatorId: adminUserId,
    isImpersonation: true,
  };

  // 3. Sign the token with a very short expiration time (e.g., 60 seconds)
  // The user must use this token within 60 seconds to start the session.
  // The session itself will last for the standard duration.
  const token = signToken(payload, '60s');

  return { token, user: targetUser };
}

export async function changeUserPassword(userId: string, newPassword: string) {
  const passwordHash = await hashPassword(newPassword);
  return prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      passwordResetRequired: false, // UNSET THE FLAG
    },
  });
}

/**
 * Fetches the full user object, including nested profiles, for the currently authenticated user.
 * This is used by the frontend to get the most up-to-date user state after login.
 * @param userId The ID of the user to fetch.
 */
export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      candidateProfile: true,
      followingAgencies: {
        select: {
          agencyId: true,
        },
      },
      ownedAgencies: {
        include: {
          subscriptions: {
            include: {
              plan: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found.');
  }

  const followedAgencyIds = user.followingAgencies.map(f => f.agencyId);

  // Always omit the password hash
  const { passwordHash, followingAgencies, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    followedAgencyIds,
  };
}

/**
 * Updates the avatar key for a specific user.
 * @param userId The ID of the user to update.
 * @param avatarKey The new S3 key for their avatar image.
 */
export async function updateUserAvatar(userId: string, avatarKey: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { avatarKey },
  });
}