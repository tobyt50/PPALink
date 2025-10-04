import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import prisma from '../../config/db';

/**
 * Generates a new 2FA secret and a QR code data URL for a user.
 * This is the first step of the setup process.
 */
export async function generateTwoFactorSecret(userId: string, email: string) {
  // 1. Generate a new secret using otplib
  const secret = authenticator.generateSecret();
  const appName = 'PPALink';

  // 2. Create the key URI for the authenticator app
  const otpAuthUrl = authenticator.keyuri(email, appName, secret);

  // 3. Update the user's record in the database with the new secret
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret },
  });

  // 4. Generate the QR code as a data URL
  const qrCodeDataUrl = await qrcode.toDataURL(otpAuthUrl);

  return { secret, qrCodeDataUrl };
}

/**
 * Verifies a 2FA token provided by the user and enables 2FA if it's valid.
 * This is the final step of the setup process.
 */
export async function verifyAndEnableTwoFactor(userId: string, token: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorSecret) {
    throw new Error('2FA secret not found. Please try setting up again.');
  }

  // 1. Check if the token is valid for the user's secret
  const isValid = authenticator.check(token, user.twoFactorSecret);

  if (!isValid) {
    throw new Error('Invalid 2FA token. Please try again.');
  }

  // 2. If valid, permanently enable 2FA for the user
  await prisma.user.update({
    where: { id: userId },
    data: { isTwoFactorEnabled: true },
  });

  return { success: true };
}

/**
 * Validates a 2FA token during the login process.
 */
export async function validateTwoFactorToken(userId: string, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
        return false;
    }
    return authenticator.check(token, user.twoFactorSecret);
}

/**
 * Disables 2FA for a user after verifying their current 2FA token.
 * @param userId The ID of the user disabling 2FA.
 * @param token The current 2FA token to verify the action.
 */
export async function disableTwoFactor(userId: string, token: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
    throw new Error('2FA is not currently enabled for this account.');
  }

  // 1. Verify the provided token is valid before allowing the disable action
  const isValid = authenticator.check(token, user.twoFactorSecret);

  if (!isValid) {
    throw new Error('Invalid 2FA token. Disabling failed.');
  }

  // 2. If valid, disable 2FA by clearing the secret and the flag
  return prisma.user.update({
    where: { id: userId },
    data: {
      isTwoFactorEnabled: false,
      twoFactorSecret: null, // Clear the secret for security
    },
  });
}