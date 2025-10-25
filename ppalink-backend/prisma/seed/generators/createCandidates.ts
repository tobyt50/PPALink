import {
  PrismaClient,
  Role,
  UserStatus,
  VerificationLevel,
} from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { rand, randRange } from "../utils/helpers";
import {
  nigerianFirstNames,
  nigerianLastNames,
  degrees,
  nigerianUniversities,
} from "../data/people-and-places";
import { careerArchetypes } from "../data/archetypes";

export async function createCandidates(prisma: PrismaClient, count: number) {
  console.log(`  - Generating ${count} candidates...`);

  const nigeria = await prisma.country.findUnique({ where: { iso2: "NG" } });
  if (!nigeria) {
    console.warn(
      "  - ⚠️ Nigeria not found in countries. Skipping candidate location assignment."
    );
    return;
  }
  const statesInNigeria = await prisma.region.findMany({
    where: { countryId: nigeria.id },
    include: { cities: true },
  });

  const hashedPassword = await bcrypt.hash("Password123!", 10);
  const allSkills = await prisma.skill.findMany();

  for (let i = 0; i < count; i++) {
    const archetype = rand(careerArchetypes);
    const firstName = rand(nigerianFirstNames);
    const lastName = rand(nigerianLastNames);
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const phone = `+23480${faker.string.numeric(8)}`;
    const dob = faker.date.birthdate({ min: 22, max: 30, mode: "age" });
    const salaryMin = randRange(80000, 250000);
    const salaryMax = salaryMin + randRange(50000, 150000);

    const randomState = rand(statesInNigeria);
    const randomCity =
      randomState.cities.length > 0 ? rand(randomState.cities) : null;

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash: hashedPassword,
        role: Role.CANDIDATE,
        emailVerifiedAt: new Date(),
        status: UserStatus.ACTIVE,
        hasCompletedAdminOnboarding: faker.datatype.boolean(),
      },
    });

    let totalYearsOfExperience = 0;
    const workExperiences = [];
    const workCount = randRange(1, 3);
    for (let w = 0; w < workCount; w++) {
      const start = faker.date.past({
        years: totalYearsOfExperience + randRange(1, 3),
      });
      const end =
        w > 0 || faker.datatype.boolean()
          ? faker.date.between({ from: start, to: new Date() })
          : null;
      const years = end
        ? end.getFullYear() - start.getFullYear()
        : new Date().getFullYear() - start.getFullYear();
      totalYearsOfExperience += years > 0 ? years : 1;
      workExperiences.push({
        company: faker.company.name(),
        title: rand(archetype.jobTitles),
        description: faker.lorem.sentences(2),
        startDate: start,
        endDate: end,
        isCurrent: !end,
      });
    }

    const educationField = rand(archetype.fieldsOfStudy);
    const keySkill = rand(archetype.skills);
    const jobTitleForSummary =
      workExperiences[0]?.title || rand(archetype.jobTitles);
    const professionalSummary = archetype.summaryTemplate(
      `${firstName} ${lastName}`,
      totalYearsOfExperience,
      jobTitleForSummary,
      keySkill
    );

    const candidateProfile = await prisma.candidateProfile.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        phone,
        dob,
        gender: faker.helpers.arrayElement(["Male", "Female"]),
        nyscNumber: `NYSC/${faker.string.alphanumeric(6).toUpperCase()}`,
        nyscBatch: faker.helpers.arrayElement(["A", "B", "C"]),
        nyscStream: faker.helpers.arrayElement(["I", "II"]),
        callupHash: faker.string.alphanumeric(12),
        stateCode: faker.string.alphanumeric(6).toUpperCase(),
        countryId: nigeria.id,
        regionId: randomState.id,
        cityId: randomCity?.id,
        disabilityInfo: faker.datatype.boolean()
          ? faker.lorem.sentence()
          : null,
        isVerified: faker.datatype.boolean(),
        verificationLevel: rand(Object.values(VerificationLevel)),
        isRemote: faker.datatype.boolean(),
        isOpenToReloc: faker.datatype.boolean(),
        salaryMin,
        salaryMax,
        availability: faker.date.future(),
        workAuth: "Nigerian Citizen",
        summary: professionalSummary,
        linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        portfolio: faker.internet.url(),
        graduationYear: randRange(2015, 2023),
        gpaBand: faker.helpers.arrayElement([
          "First Class",
          "Second Class Upper",
          "Second Class Lower",
          "Third Class",
        ]),
        cvFileKey: `cv_${faker.string.alphanumeric(8)}.pdf`,
        nyscFileKey: `nysc_${faker.string.alphanumeric(8)}.pdf`,
        hasCompletedOnboarding: true,
      },
    });

    const candidateId = candidateProfile.id;
    for (const exp of workExperiences) {
      await prisma.workExperience.create({ data: { ...exp, candidateId } });
    }

    const eduStartDate = faker.date.past({ years: randRange(5, 8) });
    const eduEndDate = new Date(
      eduStartDate.getFullYear() + 4,
      eduStartDate.getMonth(),
      eduStartDate.getDate()
    );
    await prisma.education.create({
      data: {
        candidateId,
        institution: rand(nigerianUniversities),
        degree: rand(degrees),
        field: educationField,
        grade: rand([
          "First Class",
          "Second Class Upper",
          "Second Class Lower",
        ]),
        startDate: eduStartDate,
        endDate: eduEndDate,
      },
    });

    const relevantSkills = allSkills.filter((skill) =>
      archetype.skills.includes(skill.name)
    );
    const skillSubset = faker.helpers.arrayElements(
      relevantSkills,
      randRange(2, 4)
    );
    for (const skill of skillSubset) {
      await prisma.candidateSkill.create({
        data: {
          candidateId,
          skillId: skill.id,
          level: randRange(3, 5),
          years: randRange(
            1,
            totalYearsOfExperience > 1 ? totalYearsOfExperience : 2
          ),
        },
      });
    }
    for (let c = 0; c < randRange(0, 2); c++) {
      await prisma.candidateCertificate.create({
        data: {
          candidateId,
          title: `${keySkill} Certification`,
          issuer: faker.company.name(),
          issuedAt: faker.date.past(),
          fileKey: faker.system.fileName(),
          fileHash: faker.string.alphanumeric(12),
          verified: faker.datatype.boolean(),
        },
      });
    }
    for (let c = 0; c < randRange(0, 2); c++) {
      await prisma.credential.create({
        data: {
          candidateId,
          fileUrl: faker.internet.url(),
          type: rand(["Transcript", "Recommendation", "Portfolio"]),
          hash: faker.string.alphanumeric(12),
          verified: faker.datatype.boolean(),
        },
      });
    }
  }
  console.log(`  - ✅ ${count} candidates created.`);
}
