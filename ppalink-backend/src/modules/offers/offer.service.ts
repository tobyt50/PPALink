import prisma from '../../config/db';
import { OfferStatus, ApplicationStatus, PositionStatus } from '@prisma/client';

interface CreateOfferInput {
  applicationId: string;
  agencyId: string; // For security
  salary?: number;
  startDate?: string; // ISO string
}

/**
 * Creates a new job offer for an application.
 * Also updates the application status to OFFER.
 */
export async function createOffer(data: CreateOfferInput) {
  const { applicationId, agencyId, salary, startDate } = data;

  return prisma.$transaction(async (tx) => {
    const application = await tx.application.findFirst({
      where: { id: applicationId, position: { agencyId } },
      select: { id: true, candidateId: true },
    });
    if (!application) throw new Error('Application not found or you do not have permission to modify it.');

    const offer = await tx.offer.create({
      data: {
        applicationId,
        salary,
        startDate: startDate ? new Date(startDate) : undefined,
      },
    });

    await tx.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.OFFER },
    });
    
    // (Future) Notify candidate about the offer
    // await createNotification(...)

    return offer;
  });
}

/**
 * Allows a candidate to respond to a job offer (ACCEPT or DECLINE).
 */
export async function respondToOffer(offerId: string, candidateId: string, response: 'ACCEPTED' | 'DECLINED') {
  const newStatus = response === 'ACCEPTED' ? OfferStatus.ACCEPTED : OfferStatus.DECLINED;

  return prisma.$transaction(async (tx) => {
    const offer = await tx.offer.findFirst({
      where: { id: offerId, application: { candidateId } },
      include: { application: true },
    });
    if (!offer) throw new Error('Offer not found or you do not have permission to respond to it.');

    // 1. Update the Offer status
    const updatedOffer = await tx.offer.update({
      where: { id: offerId },
      data: { status: newStatus },
    });

    if (newStatus === OfferStatus.ACCEPTED) {
      // 2. Update Application to HIRED
      await tx.application.update({
        where: { id: offer.applicationId },
        data: { status: ApplicationStatus.HIRED },
      });
      // 3. Close the Position
      await tx.position.update({
        where: { id: offer.application.positionId },
        data: { status: PositionStatus.CLOSED },
      });
      // 4. (Optional but recommended) Reject other active applications for this job
      await tx.application.updateMany({
        where: {
            positionId: offer.application.positionId,
            id: { not: offer.applicationId },
            status: { notIn: ['HIRED', 'REJECTED', 'WITHDRAWN'] }
        },
        data: { status: ApplicationStatus.REJECTED }
      });
    } else { // If declined
      await tx.application.update({
        where: { id: offer.applicationId },
        data: { status: ApplicationStatus.WITHDRAWN }, // Or REJECTED, depending on flow
      });
    }

    return updatedOffer;
  });
}