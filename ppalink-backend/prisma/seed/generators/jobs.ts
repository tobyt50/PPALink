import { PrismaClient, EmploymentType, PositionVisibility, PositionStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { rand, randRange } from '../utils';
import { careerArchetypes } from '../../seed-candidates-agencies-data';

// A helper to generate realistic job descriptions
const generateDescription = (title: string, company: string, archetype: typeof careerArchetypes[0]): string => {
    return `
**About ${company}**
${faker.company.catchPhrase()} We are a leading firm in the ${archetype.name} sector, committed to innovation and excellence. Our team is growing, and we are looking for a passionate and driven individual to join us.

**Role Overview**
We are seeking a talented ${title} to contribute to our dynamic team. The ideal candidate will be responsible for [Primary Responsibility 1, e.g., developing scalable web applications], [Primary Responsibility 2, e.g., collaborating with cross-functional teams], and [Primary Responsibility 3, e.g., maintaining code quality and best practices]. This role offers a unique opportunity to work on exciting projects and make a significant impact.

**Key Responsibilities**
- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}

**Qualifications**
- Bachelor's degree in ${rand(archetype.fieldsOfStudy)} or a related field.
- Proven experience with technologies like ${rand(archetype.skills)}.
- Strong problem-solving skills and attention to detail.
- Excellent communication and teamwork abilities.
    `;
};

export async function createJobs(prisma: PrismaClient, count: number) {
    console.log(`\n🌱 Creating ${count} realistic Job Positions...`);
    
    const allAgencies = await prisma.agency.findMany({ select: { id: true, name: true } });
    const allSkills = await prisma.skill.findMany();
    const statesWithLgas = await prisma.locationState.findMany({ include: { lgas: true } });

    if (allAgencies.length === 0) {
        console.warn('⚠️ Cannot create jobs because no agencies exist. Skipping.');
        return;
    }

    for (let i = 0; i < count; i++) {
        const archetype = rand(careerArchetypes);
        const agency = rand(allAgencies);
        const title = rand(archetype.jobTitles);
        const description = generateDescription(title, agency.name, archetype);
        
        // Generate a realistic salary range
        const minSalary = randRange(80000, 250000);
        const maxSalary = minSalary + randRange(50000, 200000);
        
        // Determine location and remote status
        const isRemote = faker.datatype.boolean(0.3); // 30% chance of being remote
        const randomState = isRemote ? null : rand(statesWithLgas);
        const randomLga = randomState?.lgas.length ? rand(randomState.lgas) : null;
        
        // Select relevant skills for the job
        const relevantSkills = allSkills.filter(s => archetype.skills.includes(s.name));
        const skillSubset = faker.helpers.arrayElements(relevantSkills, randRange(3, 6));

        await prisma.position.create({
            data: {
                agencyId: agency.id,
                title,
                description,
                employmentType: rand(Object.values(EmploymentType)),
                isRemote,
                stateId: randomState?.id,
                lgaId: randomLga?.id,
                minSalary,
                maxSalary,
                visibility: PositionVisibility.PUBLIC,
                status: PositionStatus.OPEN,
                skills: {
                    create: skillSubset.map(skill => ({
                        skillId: skill.id,
                        requiredLevel: rand(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
                    })),
                },
            }
        });
    }

    console.log(`✅ ${count} realistic Job Positions created.`);
}