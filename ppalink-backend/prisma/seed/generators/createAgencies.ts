import { PrismaClient, Role, UserStatus, EmploymentType, PositionVisibility, PositionStatus, JobLevel } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { rand, randRange } from '../utils/helpers';
import { categorizedAgencyNames } from '../data/people-and-places';

export async function createAgencies(prisma: PrismaClient, count: number) {
  console.log(`  - Generating ${count} agencies...`);

  const nigeria = await prisma.country.findUnique({ where: { iso2: 'NG' } });
   if (!nigeria) {
    console.warn("  - ⚠️ Nigeria not found in countries. Skipping agency location assignment.");
    return;
  }
  const statesInNigeria = await prisma.region.findMany({ where: { countryId: nigeria.id }, include: { cities: true } });
  
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
    'Creative & Lifestyle': ['Creative', 'Hospitality', 'Tourism', 'Events Management', 'Fashion', 'Beauty', 'Sports', 'Recreation', 'Entertainment', 'Music', 'Film'],
  };

  const agencyCategories = Object.keys(categorizedAgencyNames);

  for (let i = 0; i < count; i++) {
    const category = rand(agencyCategories);
    const name = rand(categorizedAgencyNames[category as keyof typeof categorizedAgencyNames]);
    const possibleIndustryNames = industryCategoryMap[category];
    const randomIndustryName = rand(possibleIndustryNames);
    const industry = allIndustries.find(ind => ind.name === randomIndustryName);
    if (!industry) { console.warn(`  - Could not find matching industry for "${randomIndustryName}". Skipping.`); continue; }

    const emailSafeName = name.replace(/\s/g, '').replace(/[.,]/g, '');
    const email = faker.internet.email({ firstName: emailSafeName }).toLowerCase();
    const phone = `+23490${faker.string.numeric(8)}`;
    const randomState = rand(statesInNigeria);
    const randomCity = randomState.cities.length > 0 ? rand(randomState.cities) : null;

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
        countryId: nigeria.id,
        regionId: randomState.id,
        cityId: randomCity?.id,
        
        hasCompletedOnboarding: true,
      },
    });
  }
  console.log(`  - ✅ ${count} agencies created.`);
}