import { PrismaClient, Role, UserStatus, VerificationLevel, PositionStatus, ApplicationStatus, EmploymentType, PositionVisibility } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { statesAndLgas } from './seed-data';
import { industries } from './industries.data';
import { 
  nigerianFirstNames, 
  nigerianLastNames, 
  skillsList, 
  degrees,
  nigerianUniversities,
  careerArchetypes,
  categorizedAgencyNames
} from './seed-candidates-agencies-data';

const prisma = new PrismaClient();

// Helper functions
function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function createCandidates(count: number) {
  console.log(`\n🌱 Creating ${count} Candidates...`);
  
  const statesWithLgas = await prisma.locationState.findMany({ include: { lgas: true } });
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  for (const skillName of skillsList) {
    const slug = skillName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await prisma.skill.upsert({
      where: { name: skillName },
      update: {},
      create: { name: skillName, slug: slug },
    });
  }
  const allSkills = await prisma.skill.findMany();

  for (let i = 0; i < count; i++) {
    const archetype = rand(careerArchetypes);
    const firstName = rand(nigerianFirstNames);
    const lastName = rand(nigerianLastNames);
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const phone = `+23480${faker.string.numeric(8)}`;
    const dob = faker.date.birthdate({ min: 22, max: 30, mode: 'age' });
    const salaryMin = randRange(80000, 250000);
    const salaryMax = salaryMin + randRange(50000, 150000);
    
    const randomState = rand(statesWithLgas);
    const randomLga = randomState.lgas.length > 0 ? rand(randomState.lgas) : null;

    const user = await prisma.user.create({
      data: { email, phone, passwordHash: hashedPassword, role: Role.CANDIDATE, emailVerifiedAt: new Date(), status: UserStatus.ACTIVE, hasCompletedAdminOnboarding: faker.datatype.boolean() },
    });

    let totalYearsOfExperience = 0;
    const workExperiences = [];
    const workCount = randRange(1, 3);
    for (let w = 0; w < workCount; w++) {
        const start = faker.date.past({ years: totalYearsOfExperience + randRange(1, 3) });
        const end = (w > 0 || faker.datatype.boolean()) ? faker.date.between({ from: start, to: new Date() }) : null;
        const years = end ? (end.getFullYear() - start.getFullYear()) : (new Date().getFullYear() - start.getFullYear());
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
    const jobTitleForSummary = workExperiences[0]?.title || rand(archetype.jobTitles);
    const professionalSummary = archetype.summaryTemplate(`${firstName} ${lastName}`, totalYearsOfExperience, jobTitleForSummary, keySkill);

    const candidateProfile = await prisma.candidateProfile.create({
      data: {
        userId: user.id, firstName, lastName, phone, dob,
        gender: faker.helpers.arrayElement(["Male", "Female"]),
        nyscNumber: `NYSC/${faker.string.alphanumeric(6).toUpperCase()}`,
        nyscBatch: faker.helpers.arrayElement(["A", "B", "C"]),
        nyscStream: faker.helpers.arrayElement(["I", "II"]),
        callupHash: faker.string.alphanumeric(12),
        stateCode: faker.string.alphanumeric(6).toUpperCase(),
        primaryStateId: randomState.id,
        lgaId: randomLga?.id,
        disabilityInfo: faker.datatype.boolean() ? faker.lorem.sentence() : null,
        isVerified: faker.datatype.boolean(),
        verificationLevel: faker.helpers.arrayElement([
            VerificationLevel.UNVERIFIED,
            VerificationLevel.EMAIL_VERIFIED,
            VerificationLevel.ID_VERIFIED,
            VerificationLevel.NYSC_VERIFIED,
            VerificationLevel.CERTS_VERIFIED
        ]),
        isRemote: faker.datatype.boolean(),
        isOpenToReloc: faker.datatype.boolean(),
        salaryMin, salaryMax,
        availability: faker.date.future(),
        workAuth: "Nigerian Citizen",
        summary: professionalSummary,
        linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        portfolio: faker.internet.url(),
        graduationYear: randRange(2015, 2023),
        gpaBand: faker.helpers.arrayElement(["First Class", "Second Class Upper", "Second Class Lower", "Third Class"]),
        cvFileKey: `cv_${faker.string.alphanumeric(8)}.pdf`,
        nyscFileKey: `nysc_${faker.string.alphanumeric(8)}.pdf`,
        hasCompletedOnboarding: true,
      },
    });
    
    const candidateId = candidateProfile.id;
    for (const exp of workExperiences) { await prisma.workExperience.create({ data: { ...exp, candidateId } }); }

    const eduStartDate = faker.date.past({ years: randRange(5, 8) });
    const eduEndDate = new Date(eduStartDate.getFullYear() + 4, eduStartDate.getMonth(), eduStartDate.getDate());
    await prisma.education.create({ data: { candidateId, institution: rand(nigerianUniversities), degree: rand(degrees), field: educationField, grade: faker.helpers.arrayElement(["First Class", "Second Class Upper", "Second Class Lower", "Third Class"]), startDate: eduStartDate, endDate: eduEndDate } });

    const relevantSkills = allSkills.filter(skill => archetype.skills.includes(skill.name));
    const skillSubset = faker.helpers.arrayElements(relevantSkills, randRange(2, 4));
    for (const skill of skillSubset) { await prisma.candidateSkill.create({ data: { candidateId, skillId: skill.id, level: randRange(3, 5), years: randRange(1, totalYearsOfExperience > 1 ? totalYearsOfExperience : 2) } }); }
    for (let c = 0; c < randRange(0, 2); c++) { await prisma.candidateCertificate.create({ data: { candidateId, title: `${keySkill} Certification`, issuer: faker.company.name(), issuedAt: faker.date.past(), fileKey: faker.system.fileName(), fileHash: faker.string.alphanumeric(12), verified: faker.datatype.boolean() } }); }
    for (let c = 0; c < randRange(0, 2); c++) { await prisma.credential.create({ data: { candidateId, fileUrl: faker.internet.url(), type: faker.helpers.arrayElement(["Transcript", "Recommendation", "Portfolio"]), hash: faker.string.alphanumeric(12), verified: faker.datatype.boolean() } }); }
  }
  console.log(`✅ ${count} Candidates created.`);
}

async function createAgencies(count: number) {
  console.log(`\n🌱 Creating ${count} Agencies...`);

  const statesWithLgas = await prisma.locationState.findMany({ include: { lgas: true } });
  const allIndustries = await prisma.industry.findMany({ where: { isHeading: false } });
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  const industryCategoryMap: { [key: string]: string[] } = {
    'Finance & Professional Services': ['Accounting', 'Auditing', 'Banking', 'Financial Services', 'Insurance', 'Legal', 'Venture Capital', 'Investment'],
    'Business & Management': ['Consulting', 'Business Strategy', 'Management', 'Human Resources', 'Recruitment', 'Marketing', 'Public Relations', 'Advertising', 'Media', 'Communications', 'Research', 'Development'],
    'Technology & Digital': ['ICT', 'Software', 'Technology', 'Telecommunications', 'Cybersecurity', 'Data', 'Analytics', 'E-Commerce', 'Gaming', 'Entertainment Tech', 'FinTech'],
    'Education': ['Teaching', 'Training', 'E-Learning', 'EdTech', 'Capacity Building'],
    'Healthcare': ['Medical Services', 'Hospitals', 'Clinics', 'Pharmaceutical', 'Biotechnology', 'Public Health', 'Fitness', 'Wellness'],
    'Agriculture & Food': ['Agriculture', 'Agro-Allied', 'Fisheries', 'Aquaculture', 'Forestry', 'Food Processing', 'Retail', 'FMCG'],
    'Energy & Natural Resources': ['Oil & Gas', 'Energy', 'Power', 'Utilities', 'Renewable Energy', 'Mining', 'Extraction'],
    'Engineering & Manufacturing': ['Engineering', 'Technical Services', 'Construction', 'Real Estate', 'Architecture', 'Design', 'Manufacturing', 'Production', 'Industrial Automation'],
    'Transport & Logistics': ['Logistics', 'Supply Chain', 'Aviation', 'Aerospace', 'Maritime', 'Shipping', 'Rail Transport', 'Road Transport', 'Ride-hailing', 'Delivery Services'],
    'Government & Public Sector': ['Government', 'Public Service', 'NGO', 'Non-Profit', 'International Organizations', 'Security Services', 'Military', 'Defense'],
    'Creative & Lifestyle': ['Arts', 'Culture', 'Hospitality', 'Tourism', 'Events Management', 'Fashion', 'Beauty', 'Sports', 'Recreation', 'Entertainment', 'Music', 'Film'],
  };

  const agencyCategories = Object.keys(categorizedAgencyNames);

  for (let i = 0; i < count; i++) {
    const category = rand(agencyCategories);
    const name = rand(categorizedAgencyNames[category as keyof typeof categorizedAgencyNames]);
    const possibleIndustryNames = industryCategoryMap[category];
    const randomIndustryName = rand(possibleIndustryNames);
    const industry = allIndustries.find(ind => ind.name === randomIndustryName);
    if (!industry) { console.warn(`Could not find a matching industry for "${randomIndustryName}". Skipping.`); continue; }

    const emailSafeName = name.replace(/\s/g, '').replace(/[.,]/g, '');
    const email = faker.internet.email({ firstName: emailSafeName }).toLowerCase();
    const phone = `+23490${faker.string.numeric(8)}`;
    const randomState = rand(statesWithLgas);
    const randomLga = randomState.lgas.length > 0 ? rand(randomState.lgas) : null;

    const owner = await prisma.user.create({ data: { email, phone, passwordHash: hashedPassword, role: Role.AGENCY, emailVerifiedAt: new Date(), status: UserStatus.ACTIVE } });
    const newAgency = await prisma.agency.create({
      data: {
        ownerUserId: owner.id,
        name: `${name} ${rand(["Group", "Solutions", "Partners", "Ltd."])}`,
        rcNumber: `RC${faker.string.numeric(6)}`,
        industryId: industry.id,
        website: faker.internet.url(),
        domain: faker.internet.domainName(),
        sizeRange: faker.helpers.arrayElement(["1-10", "11-50", "51-200", "200+"]),
        domainVerified: faker.datatype.boolean(),
        cacVerified: faker.datatype.boolean(),
        logoKey: `logo_${faker.string.alphanumeric(6)}.png`,
        headquartersStateId: randomState.id,
        lgaId: randomLga?.id,
        hasCompletedOnboarding: true,
      },
    });

    for (let p=0; p < randRange(1, 3); p++) {
        await prisma.position.create({
            data: {
                agencyId: newAgency.id,
                title: faker.person.jobTitle(),
                description: faker.lorem.paragraphs(3),
                employmentType: rand(Object.values(EmploymentType)),
                isRemote: faker.datatype.boolean(),
                stateId: randomState.id,
                lgaId: randomLga?.id,
                minSalary: randRange(80000, 150000),
                maxSalary: randRange(160000, 400000),
                visibility: PositionVisibility.PUBLIC,
                status: PositionStatus.OPEN
            }
        });
    }
  }
  console.log(`✅ ${count} Agencies (and their positions) created.`);
}

async function createApplicationsForSpecificPosition(count: number, positionId: string) {
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

async function main() {
  console.log('💧 Starting database seeding...');
  
  const preservedUserIds = ['c1cfe44e-a176-474b-bf35-48398dca09c9', '5900ca1a-625c-4a14-8331-ee286900ad73', '459295d9-9960-4a22-a8a3-8ad12c585f96', '24561236-b941-4ff8-ad41-b9b71adcafdd', 'fcd910ed-f411-4524-bdb1-23de83a9e4d1', '097944c2-3582-4220-ade4-4a93ab404375', 'b03bd9b9-eaa1-4181-912d-8bda864e1f08'];

  console.log('\n🗑️ Clearing previously generated data...');
  const deletableUserCondition = { AND: [ { role: { in: [Role.CANDIDATE, Role.AGENCY] } }, { id: { notIn: preservedUserIds } } ] };
  const deletableUsers = await prisma.user.findMany({ where: deletableUserCondition, select: { id: true }});
  const deletableUserIds = deletableUsers.map(u => u.id);

  if (deletableUserIds.length > 0) {
    console.log(`Found ${deletableUserIds.length} generated users to delete.`);
    await prisma.message.deleteMany({ where: { OR: [ { fromId: { in: deletableUserIds } }, { toId: { in: deletableUserIds } } ] } });
    await prisma.notification.deleteMany({ where: { userId: { in: deletableUserIds } } });
    await prisma.activityLog.deleteMany({ where: { userId: { in: deletableUserIds } } });
    await prisma.invitation.deleteMany({ where: { inviterId: { in: deletableUserIds } } });
    await prisma.agencyMember.deleteMany({ where: { userId: { in: deletableUserIds } } });
    await prisma.verification.deleteMany({ where: { OR: [{ userId: { in: deletableUserIds } }, { reviewedBy: { in: deletableUserIds } }] } });
    await prisma.candidateCertificate.updateMany({ where: { verifierId: { in: deletableUserIds } }, data: { verifierId: null } });

    const deletableProfiles = await prisma.candidateProfile.findMany({ where: { userId: { in: deletableUserIds } }, select: { id: true } });
    const deletableProfileIds = deletableProfiles.map(p => p.id);
    if (deletableProfileIds.length > 0) {
      await prisma.application.deleteMany({ where: { candidateId: { in: deletableProfileIds } } });
      await prisma.workExperience.deleteMany({ where: { candidateId: { in: deletableProfileIds } } });
      await prisma.education.deleteMany({ where: { candidateId: { in: deletableProfileIds } } });
      await prisma.candidateSkill.deleteMany({ where: { candidateId: { in: deletableProfileIds } } });
      await prisma.candidateCertificate.deleteMany({ where: { candidateId: { in: deletableProfileIds } } });
      await prisma.credential.deleteMany({ where: { candidateId: { in: deletableProfileIds } } });
    }
    
    const deletableAgencies = await prisma.agency.findMany({ where: { ownerUserId: { in: deletableUserIds } }, select: { id: true } });
    const deletableAgencyIds = deletableAgencies.map(a => a.id);
    if (deletableAgencyIds.length > 0) {
        await prisma.position.deleteMany({ where: { agencyId: { in: deletableAgencyIds } }});
    }

    await prisma.candidateProfile.deleteMany({ where: { id: { in: deletableProfileIds } } });
    await prisma.agency.deleteMany({ where: { id: { in: deletableAgencyIds } } });
    await prisma.user.deleteMany({ where: { id: { in: deletableUserIds } } });
  } else {
    console.log("No generated users found to delete.");
  }
  await prisma.skill.deleteMany({});
  console.log('Cleared generated data while preserving specified users.');
  
  // -----------------------------
  // Seed States & LGAs (COMMENTED OUT)
  // -----------------------------
  /*
  console.log('\n🌍 Seeding states and LGAs...');
  // Delete LGAs first due to foreign key constraints
  await prisma.locationLGA.deleteMany({});
  await prisma.locationState.deleteMany({});
  console.log('Cleared existing location data.');

  for (const stateData of statesAndLgas) {
    const state = await prisma.locationState.create({
      data: { name: stateData.state },
    });
    console.log(`Created state: ${state.name}`);

    if (stateData.lgas && stateData.lgas.length > 0) {
      const lgasToCreate = stateData.lgas.map((lgaName) => ({
        name: lgaName,
        stateId: state.id,
      }));

      await prisma.locationLGA.createMany({
        data: lgasToCreate,
      });

      console.log(` -> Created ${lgasToCreate.length} LGAs for ${state.name}.`);
    }
  }
  */

  // -----------------------------
  // Seed Industries (COMMENTED OUT)
  // -----------------------------
  /*
  console.log('\n🏭 Seeding industries...');

  await prisma.industry.deleteMany({});
  console.log('Cleared existing industries.');

  await prisma.industry.createMany({
    data: industries.map((i) => ({
      name: i.name.trim(),
      isHeading: i.isHeading ?? false,
      order: i.order,
    })),
  });

  console.log(`Created ${industries.length} industries with headings + order.`);
  */

  // -----------------------------
  // Seed Settings & Feature Flags (COMMENTED OUT)
  // -----------------------------
  /*
  console.log('\n⚙️ Seeding platform settings...');
  await prisma.setting.upsert({
    where: { key: 'maintenanceMode' },
    update: {},
    create: {
      key: 'maintenanceMode',
      value: false,
      description: 'If true, the entire public-facing site will be disabled.',
    },
  });

  console.log('Seeding feature flags...');
  await prisma.featureFlag.upsert({
    where: { name: 'enableAiRecommendations' },
    update: {},
    create: {
      name: 'enableAiRecommendations',
      description: 'Enables the AI-powered candidate matching feature for Enterprise agencies.',
      isEnabled: false, // Default to off
    },
  });

  await prisma.setting.upsert({
      where: { key: 'freeJobPostLimit' },
      update: {},
      create: {
          key: 'freeJobPostLimit',
          value: 1, // Store as a number
          description: "The number of open jobs an agency on the 'Free' plan can have."
      }
  });
  
  await prisma.setting.upsert({
      where: { key: 'freeMemberLimit' },
      update: {},
      create: {
          key: 'freeMemberLimit',
          value: 1,
          description: "The number of team members an agency on the 'Free' plan can have."
      }
  });
  console.log('Static data seeding complete.');
  */
  
  // -----------------------------
  // Seed Dynamic Data (Candidates & Agencies)
  // -----------------------------
  console.log('\n🔥 Seeding dynamic data...');
  await createCandidates(100);
  await createAgencies(50);
  
  const targetPositionId = 'd45805c9-c04f-4f5a-8beb-5cc970888e66';
  await createApplicationsForSpecificPosition(70, targetPositionId);

  console.log('\n✅ Database seeding completed successfully.');
}

// Execute main and ensure Prisma disconnects
main()
  .catch((e) => {
    console.error('❌ An error occurred during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });