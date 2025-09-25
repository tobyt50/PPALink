import { InvitationStatus, Role } from '@prisma/client';
import sgMail from '@sendgrid/mail';
import { randomBytes } from 'crypto';
import { addHours } from 'date-fns';
import prisma from '../../config/db';
import env from '../../config/env';
import { hashPassword } from '../utils/crypto';

// Configure the library with the API key from our environment variables
sgMail.setApiKey(env.SMTP_PASS!);

interface SendInviteInput {
  agencyId: string;
  inviterId: string;
  inviteeEmail: string;
}

/**
 * Creates and sends a new team member invitation.
 * Enforces subscription limits.
 */
export async function sendInvitation({ agencyId, inviterId, inviteeEmail }: SendInviteInput) {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    include: {
      members: true,
      subscriptions: { include: { plan: true } },
    },
  });

  if (!agency) throw new Error('Agency not found.');

  const activeSub = agency.subscriptions.find(s => s.status === 'ACTIVE');
  let memberLimit: number;
  let planName: string;

  if (activeSub?.plan) {
    memberLimit = activeSub.plan.memberLimit;
    planName = activeSub.plan.name;
  } else {
    const freeMemberLimitSetting = await prisma.setting.findUnique({ where: { key: 'freeMemberLimit' } });
    memberLimit = freeMemberLimitSetting?.value as number ?? 1;
    planName = 'Free';
  }

  const currentMemberCount = agency.members.length;
  if (memberLimit !== -1 && currentMemberCount >= memberLimit) {
    throw new Error(`Your "${planName}" plan is limited to ${memberLimit} team member(s). Please upgrade to invite more.`);
  }

  const token = randomBytes(32).toString('hex');
  const expiresAt = addHours(new Date(), 48);

  const invitation = await prisma.invitation.create({
    data: {
      email: inviteeEmail.toLowerCase(),
      agencyId,
      inviterId,
      token,
      expiresAt,
    },
  });
    
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

    const inviteLink = `${FRONTEND_URL}/handle-invite?token=${token}`;
    console.log("INVITE LINK (for testing):", inviteLink);
  
  const msg = {
    to: inviteeEmail,
    from: env.SMTP_FROM_EMAIL!,
    subject: `You've been invited to join ${agency.name} on PPALink`,
    html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>You're Invited!</h2>
            <p>You have been invited to join the <strong>${agency.name}</strong> hire team on PPALink.</p>
            <p>Click the link below to create your account and accept the invitation. This link will expire in 48 hours.</p>
            <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: bold; background-color: #22c55e; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                Accept Invitation
            </a>
            <p style="margin-top: 20px; font-size: 12px; color: #888;">If you were not expecting this invitation, you can safely ignore this email.</p>
        </div>
    `,
  };

  try {
      await sgMail.send(msg);
      console.log(`Invitation email sent successfully to ${inviteeEmail}`);
  } catch (error) {
      console.error("Error sending invitation email:", error);
  }

  return invitation;
}

/**
 * Verifies an invitation token and returns the invitation details.
 */
export async function verifyInvitationToken(token: string) {
  const invitation = await prisma.invitation.findFirst({
    where: {
      token,
      status: 'PENDING',
      expiresAt: {
        gt: new Date(),
      },
    },
  });
  
  if (!invitation) {
    throw new Error('This invitation is invalid or has expired.');
  }
    
  const userExists = await prisma.user.findUnique({
    where: { email: invitation.email },
    select: { id: true }, // Select a minimal field to check for existence
  });
  
  return { email: invitation.email, userExists: !!userExists };
}
  
interface AcceptInviteInput {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
}

/**
 * Finalizes the invitation acceptance process for both NEW and EXISTING users.
 */
export async function acceptInvitation({ token, firstName, lastName, password, existingUserId }: {
    token: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    existingUserId?: string; // ID of the user who is already logged in
  }) {
    const invitation = await prisma.invitation.findFirst({
      where: { token, status: 'PENDING', expiresAt: { gt: new Date() } },
    });
    if (!invitation) throw new Error('This invitation is invalid or has expired.');
  
    let userToJoin: { id: string; role: Role };
  
    if (existingUserId) {
      // --- SCENARIO 2: Existing, Logged-in User is Accepting ---
      const existingUser = await prisma.user.findUnique({ where: { id: existingUserId } });
      if (!existingUser) throw new Error('Logged in user not found.');
      if (existingUser.email.toLowerCase() !== invitation.email.toLowerCase()) {
        throw new Error('This invitation is for a different email address.');
      }
      
      // Check if they are already in an agency
      const existingMembership = await prisma.agencyMember.findFirst({ where: { userId: existingUser.id } });
      if (existingMembership) {
        throw new Error('This user is already a member of another agency.');
      }
      
      userToJoin = existingUser;
  
    } else {
      // --- SCENARIO 1: New User is Signing Up ---
      if (!firstName || !lastName || !password) throw new Error('First name, last name, and password are required for new users.');
      
      const existingUserByEmail = await prisma.user.findUnique({ where: { email: invitation.email } });
      if (existingUserByEmail) throw new Error('An account with this email already exists. Please log in to accept.');
  
      const passwordHash = await hashPassword(password);
      userToJoin = await prisma.user.create({
        data: {
          email: invitation.email,
          passwordHash,
          role: Role.CANDIDATE, // Create as CANDIDATE first
          emailVerifiedAt: new Date(),
          candidateProfile: { create: { firstName, lastName } },
        },
      });
    }
  
    // --- Perform the final transaction for either user type ---
    await prisma.$transaction(async (tx) => {
      // a. If the user was a CANDIDATE, upgrade their role to AGENCY
      if (userToJoin.role === 'CANDIDATE') {
        await tx.user.update({
          where: { id: userToJoin.id },
          data: { role: Role.AGENCY },
        });
      }
  
      // b. Create the AgencyMember record
      await tx.agencyMember.create({
        data: {
          userId: userToJoin.id,
          agencyId: invitation.agencyId,
          role: 'RECRUITER',
        },
      });
  
      // c. Mark the invitation as ACCEPTED
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.ACCEPTED },
      });
    });
  
    return userToJoin;
  }

  /**
 * Deletes a pending invitation.
 * Includes a security check to ensure the user deleting it is from the same agency.
 * @param invitationId The ID of the invitation to delete.
 * @param userId The ID of the user attempting to delete the invitation.
 */
export async function deleteInvitation(invitationId: string, userId: string) {
    // Find the agency the current user belongs to
    const agencyMember = await prisma.agencyMember.findFirst({
      where: { userId },
      select: { agencyId: true },
    });
  
    if (!agencyMember) {
      throw new Error('User does not belong to any agency.');
    }
  
    // Find the invitation and ensure it belongs to the user's agency
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        agencyId: agencyMember.agencyId,
      },
    });
  
    if (!invitation) {
      throw new Error('Invitation not found or you do not have permission to delete it.');
    }
  
    // If all checks pass, delete the invitation
    await prisma.invitation.delete({
      where: { id: invitationId },
    });
  }