import { PrismaClient, EmploymentType, PositionVisibility, PositionStatus, QuizLevel, JobLevel } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { rand, randRange } from '../utils/helpers';
import { careerArchetypes } from '../data/archetypes';

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
    console.log(`  - Generating ${count} realistic job positions...`);

    const allAgencies = await prisma.agency.findMany({ select: { id: true, name: true } });
    const allSkills = await prisma.skill.findMany();
    
    // --- THIS IS THE DEFINITIVE FIX ---
    // 1. Fetch from the new global location models.
    const allCountries = await prisma.country.findMany();
    const allRegions = await prisma.region.findMany({ include: { cities: true }});
    // --- END OF FIX ---

    if (allAgencies.length === 0) {
        console.warn('  - ⚠️ Cannot create jobs because no agencies exist. Skipping.');
        return;
    }

    for (let i = 0; i < count; i++) {
        const archetype = rand(careerArchetypes);
        const agency = rand(allAgencies);
        const title = rand(archetype.jobTitles);
        const description = generateDescription(title, agency.name, archetype);

        const minSalary = randRange(80000, 250000);
        const maxSalary = minSalary + randRange(50000, 200000);

        const isRemote = faker.datatype.boolean(0.3);
        
        // --- THIS IS THE DEFINITIVE FIX ---
        // 2. Select a random global location.
        const randomRegion = isRemote ? null : rand(allRegions);
        const randomCity = randomRegion?.cities.length ? rand(randomRegion.cities) : null;
        
        // 3. Generate random country restrictions for some jobs.
        const hasRestrictions = faker.datatype.boolean(0.2); // 20% of jobs have country restrictions
        const allowedCountryIds = hasRestrictions ? faker.helpers.arrayElements(allCountries, randRange(1, 3)).map(c => c.id) : [];
        // --- END OF FIX ---

        const relevantSkills = allSkills.filter(s => archetype.skills.includes(s.name));
        const skillSubset = faker.helpers.arrayElements(relevantSkills, randRange(3, 6));

        await prisma.position.create({
            data: {
                agencyId: agency.id,
                title,
                description,
                employmentType: rand(Object.values(EmploymentType)),
                level: rand(Object.values(JobLevel)),
                isRemote,
                countryId: randomRegion?.countryId,
                regionId: randomRegion?.id,
                cityId: randomCity?.id,
                allowedCountryIds: allowedCountryIds,

                minSalary,
                maxSalary,
                visibility: PositionVisibility.PUBLIC,
                status: PositionStatus.OPEN,
                skills: {
                    create: skillSubset.map(skill => ({
                        skillId: skill.id,
                        requiredLevel: rand(Object.values(QuizLevel)),
                    })),
                },
            }
        });
    }

    console.log(`  - ✅ ${count} realistic job positions created.`);
}