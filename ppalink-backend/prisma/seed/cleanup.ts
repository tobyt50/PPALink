import { PrismaClient, Role } from '@prisma/client';

export async function cleanupDatabase(prisma: PrismaClient) {
    const preservedUserIds = ['c1cfe44e-a176-474b-bf35-48398dca09c9', '5900ca1a-625c-4a14-8331-ee286900ad73', '459295d9-9960-4a22-a8a3-8ad12c585f96', '24561236-b941-4ff8-ad41-b9b71adcafdd', 'fcd910ed-f411-4524-bdb1-23de83a9e4d1', '097944c2-3582-4220-ade4-4a93ab404375', 'b03bd9b9-eaa1-4181-912d-8bda864e1f08'];

    console.log('\n🗑️ Clearing all data (respecting preserved users)...');

    // The order of deletion is critical. We delete from the "many" side of relationships first.

    // 1. Clear all "many-to-many" and transactional data that isn't directly tied to a user.
    await prisma.activityLog.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.invitation.deleteMany({});

    // 2. Clear data related to positions and applications.
    // Applications MUST be deleted before Positions.
    await prisma.application.deleteMany({});
    await prisma.positionSkill.deleteMany({});
    await prisma.position.deleteMany({});
    
    // 3. Clear data related to candidates.
    // CandidateSkills and QuizAttempts MUST be deleted before Skills.
    await prisma.quizAttempt.deleteMany({});
    await prisma.candidateSkill.deleteMany({});
    await prisma.workExperience.deleteMany({});
    await prisma.education.deleteMany({});
    await prisma.candidateCertificate.deleteMany({});
    await prisma.credential.deleteMany({});

    // 4. Clear data related to agencies.
    await prisma.agencyMember.deleteMany({ where: { user: { id: { notIn: preservedUserIds } } } });
    await prisma.agencySubscription.deleteMany({}); // Subscriptions are tied to agencies we are about to delete
    
    // 5. Clear the main entities, respecting the preserved list.
    await prisma.candidateProfile.deleteMany({ where: { user: { id: { notIn: preservedUserIds } } } });
    await prisma.agency.deleteMany({ where: { owner: { id: { notIn: preservedUserIds } } } });
    await prisma.user.deleteMany({ where: { id: { notIn: preservedUserIds } } });

    // 6. Clear all static lookup tables that are re-seeded every time.
    await prisma.quiz.deleteMany({});
    await prisma.skill.deleteMany({});
    await prisma.industry.deleteMany({});
    await prisma.locationLGA.deleteMany({});
    await prisma.locationState.deleteMany({});
    
    console.log('✅ Database cleaned successfully.');
}