import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';
import env from '../../config/env';
import prisma from '../../config/db';

sgMail.setApiKey(env.SMTP_PASS!);

const DOMAIN_VERIFY_SECRET = env.JWT_SECRET + '-domain-verification';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Initiates the domain verification process by sending an email.
 * @param agencyId The ID of the agency to verify.
 * @param domain The domain name the agency wants to verify.
 * @param userEmail The email of the user initiating the request.
 */
export async function initiateDomainVerification(agencyId: string, domain: string, userEmail: string) {
  // Check if the domain is already verified by another agency
  const existingAgency = await prisma.agency.findFirst({
    where: { domain: domain, domainVerified: true }
  });
  if (existingAgency && existingAgency.id !== agencyId) {
    throw new Error('This domain is already in use by another verified agency.');
  }

  // Create a short-lived JWT for this verification attempt
  const verificationToken = jwt.sign({ agencyId, domain }, DOMAIN_VERIFY_SECRET, {
    expiresIn: '1h', // Link is valid for 1 hour
  });

  const verificationLink = `${FRONTEND_URL}/verify-domain?token=${verificationToken}`;
  const verificationEmail = `verify@${domain}`; // Or admin@, webmaster@, etc.

  // Send the verification email
  const msg = {
    to: verificationEmail,
    from: env.SMTP_FROM_EMAIL!,
    subject: `Verify your domain for ${userEmail} on PPALink`,
    html: `
      <p>A user (${userEmail}) has requested to verify the domain <strong>${domain}</strong> for their agency on PPALink.</p>
      <p>If this was you or your team, please click the link below to confirm ownership of this domain. This link is valid for 1 hour.</p>
      <a href="${verificationLink}">Verify Domain Ownership</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  await sgMail.send(msg);
  return { message: `Verification email sent to ${verificationEmail}. Please click the link in the email to complete the process.` };
}


/**
 * Verifies the domain verification token and updates the agency's status.
 * @param token The JWT from the verification link.
 */
export async function finalizeDomainVerification(token: string) {
  let decoded: any;
  try {
    decoded = jwt.verify(token, DOMAIN_VERIFY_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired verification token.');
  }

  const { agencyId, domain } = decoded;

  // Update the agency in the database
  const updatedAgency = await prisma.agency.update({
    where: { id: agencyId },
    data: {
      domain: domain,
      domainVerified: true,
    },
  });

  return updatedAgency;
}