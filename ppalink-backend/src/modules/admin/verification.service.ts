import prisma from '../../config/db';
import { VerificationLevel } from '@prisma/client';

/**
 * Admin action to forcefully mark a user's email as verified.
 */
export async function forceVerifyEmail(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { emailVerifiedAt: new Date() },
  });
}

/**
 * Admin action to forcefully mark a candidate's profile as NYSC verified.
 */
export async function forceVerifyNysc(userId: string) {
  return prisma.candidateProfile.update({
    where: { userId },
    data: {
      isVerified: true,
      verificationLevel: VerificationLevel.NYSC_VERIFIED,
    },
  });
}

/**
 * Admin action to forcefully mark an agency's domain as verified.
 */
export async function forceVerifyDomain(userId: string) {
  const agency = await prisma.agency.findFirst({ where: { ownerUserId: userId } });
  if (!agency) throw new Error('User is not an agency owner.');

  return prisma.agency.update({
    where: { id: agency.id },
    data: { domainVerified: true },
  });
}

/**
 * Admin action to forcefully mark an agency as CAC verified.
 */
export async function forceVerifyCac(userId: string) {
  const agency = await prisma.agency.findFirst({ where: { ownerUserId: userId } });
  if (!agency) throw new Error('User is not an agency owner.');

  return prisma.agency.update({
    where: { id: agency.id },
    data: { cacVerified: true },
  });
}