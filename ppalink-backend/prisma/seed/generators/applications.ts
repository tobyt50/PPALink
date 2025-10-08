import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function createApplicationsForSpecificPosition(prisma: PrismaClient, count: number, positionId: string) {
    console.log(`\n🌱 Creating ${count} applications for position: ${positionId}...`);

    const targetPosition = await prisma.position.findUnique({ where: { id: positionId } });
    if (!targetPosition) {
        console.warn(`⚠️ Target position with ID ${positionId} not found. Cannot create applications. Skipping.`);
        return;
    }

    const candidates = await prisma.candidateProfile.findMany({ select: { id: true } });
    if (candidates.length === 0) {
        console.warn("⚠️ Cannot create applications because there are no candidates. Skipping.");
        return;
    }

    const uniqueCandidates = faker.helpers.shuffle(candidates).slice(0, count);
    let createdCount = 0;

    for (const candidate of uniqueCandidates) {
        const existingApplication = await prisma.application.findFirst({
            where: {
                candidateId: candidate.id,
                positionId: positionId,
            }
        });

        if (!existingApplication) {
            await prisma.application.create({
                data: {
                    candidateId: candidate.id,
                    positionId: positionId,
                }
            });
            createdCount++;
        }
    }
    console.log(`✅ ${createdCount} new applications created for the specified position.`);
}