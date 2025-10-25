import { PrismaClient } from '@prisma/client';

export async function cleanupDatabase(prisma: PrismaClient) {
    console.log('\n🗑️  Cleaning database (preserving key user data)...');

    // --- PRESERVED ENTITY IDs ---
    const preservedUserIds = [
        '5900ca1a-625c-4a14-8331-ee286900ad73', // Preserved Candidate's User ID
        '097944c2-3582-4220-ade4-4a93ab404375', // Preserved Agency's User ID
    ];
    const preservedCandidateProfileId = '243d4130-0256-4a3e-89f5-c99888237c0f';
    const preservedAgencyId = 'f7472be1-137d-42c4-b74a-9217988bd932';

    // --- Deletion Strategy ---
    // The order is critical. Delete records that depend on others first.

    // 1. Delete ALL transactional data that depends on static tables that are always wiped.
    // This MUST run first to free up constraints from ALL users, including preserved ones.
    await prisma.feedBoost.deleteMany({});
    await prisma.quizAttempt.deleteMany({});
    await prisma.candidateSkill.deleteMany({});
    await prisma.positionSkill.deleteMany({});

    // 2. Handle all data related to positions that WILL be deleted.
    const positionsToDelete = await prisma.position.findMany({
        where: { agencyId: { not: preservedAgencyId } },
        select: { id: true }
    });
    const positionIdsToDelete = positionsToDelete.map(p => p.id);

    if (positionIdsToDelete.length > 0) {
        await prisma.offer.deleteMany({ where: { application: { positionId: { in: positionIdsToDelete } } } });
        await prisma.interview.deleteMany({ where: { application: { positionId: { in: positionIdsToDelete } } } });
        await prisma.application.deleteMany({ where: { positionId: { in: positionIdsToDelete } } });
        await prisma.jobView.deleteMany({ where: { jobId: { in: positionIdsToDelete } } });
    }
    
    // 3. Clean applications TO the preserved agency FROM non-preserved candidates.
    await prisma.offer.deleteMany({ where: { application: { position: { agencyId: preservedAgencyId }, candidateId: { not: preservedCandidateProfileId } } } });
    await prisma.interview.deleteMany({ where: { application: { position: { agencyId: preservedAgencyId }, candidateId: { not: preservedCandidateProfileId } } } });
    await prisma.application.deleteMany({ where: { position: { agencyId: preservedAgencyId }, candidateId: { not: preservedCandidateProfileId } } });

    // 4. Clean up many-to-many relationships where EITHER party is not preserved.
    await prisma.shortlist.deleteMany({ where: { OR: [{ agencyId: { not: preservedAgencyId } }, { candidateId: { not: preservedCandidateProfileId } }] } });
    await prisma.agencyMember.deleteMany({ where: { OR: [{ agencyId: { not: preservedAgencyId } }, { userId: { notIn: preservedUserIds } }] } });
    await prisma.agencyFollow.deleteMany({ where: { OR: [{ agencyId: { not: preservedAgencyId } }, { followerId: { notIn: preservedUserIds } }] } });
    await prisma.invitation.deleteMany({ where: { OR: [{ agencyId: { not: preservedAgencyId } }, { inviterId: { notIn: preservedUserIds } }] } });
    await prisma.message.deleteMany({ where: { OR: [{ fromId: { notIn: preservedUserIds } }, { toId: { notIn: preservedUserIds } }] } });
    
    // 5. Clean up remaining relational data linked to non-preserved candidates.
    await prisma.workVerification.deleteMany({ where: { workExperience: { candidateId: { not: preservedCandidateProfileId } } } });
    await prisma.workExperience.deleteMany({ where: { candidateId: { not: preservedCandidateProfileId } } });
    await prisma.education.deleteMany({ where: { candidateId: { not: preservedCandidateProfileId } } });
    await prisma.credential.deleteMany({ where: { candidateId: { not: preservedCandidateProfileId } } });
    await prisma.candidateCertificate.deleteMany({ where: { candidateId: { not: preservedCandidateProfileId } } });
    
    // 6. Clean up data linked directly to non-preserved Users.
    await prisma.feedItem.deleteMany({ where: { userId: { notIn: preservedUserIds }, agencyId: { not: preservedAgencyId } } });
    await prisma.notification.deleteMany({ where: { userId: { notIn: preservedUserIds } } });
    await prisma.verification.deleteMany({ where: { userId: { notIn: preservedUserIds } } });
    await prisma.activityLog.deleteMany({ where: { userId: { notIn: preservedUserIds } } });
    await prisma.auditLog.deleteMany({ where: { actorId: { notIn: preservedUserIds } } });

    // 7. Delete the core entities themselves, now that dependents are gone.
    await prisma.position.deleteMany({ where: { agencyId: { not: preservedAgencyId } } });
    await prisma.candidateProfile.deleteMany({ where: { id: { not: preservedCandidateProfileId } } });
    await prisma.agency.deleteMany({ where: { id: { not: preservedAgencyId } } });
    await prisma.user.deleteMany({ where: { id: { notIn: preservedUserIds } } });

    // 8. Delete static lookup tables which are always fully re-seeded.
    await prisma.boostTier.deleteMany({});
    await prisma.quiz.deleteMany({});
    await prisma.skill.deleteMany({});
    await prisma.industry.deleteMany({});
    await prisma.setting.deleteMany({});
    await prisma.featureFlag.deleteMany({});

    console.log('  - ✅ Database cleaned successfully.');
}