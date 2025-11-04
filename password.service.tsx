import sgMail from '@sendgrid/mail';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db';
import env from '../../config/env';
import { hashPassword } from '../utils/crypto';

sgMail.setApiKey(env.SMTP_PASS!);

const RESET_TOKEN_SECRET = env.JWT_SECRET + '-password-reset';
const RESET_TOKEN_EXPIRES_IN = '15m';

export async function sendPasswordResetEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`Password reset requested for non-existent user: ${email}`);
    return;
  }

  const resetToken = jwt.sign({ userId: user.id }, RESET_TOKEN_SECRET, {
    expiresIn: RESET_TOKEN_EXPIRES_IN,
  });

  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const msg = {
    to: user.email,
    from: env.SMTP_FROM_EMAIL!,
    subject: 'Your PPALink Password Reset Request',
    html: `
      <p>Hello,</p>
      <p>You requested a password reset. Please click the link below to set a new password:</p>
      <a href="${resetLink}" style="font-size: 16px; font-weight: bold; padding: 10px 20px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 15 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Password reset email sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
}

export async function resetPassword(token: string, newPassword: string) {
  let decoded: any;
  try {
    decoded = jwt.verify(token, RESET_TOKEN_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired password reset token.');
  }
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: decoded.userId },
    data: { passwordHash },
  });
}