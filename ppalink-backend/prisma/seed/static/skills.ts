import { PrismaClient } from '@prisma/client';
import { generateSlug } from '../utils/helpers';

const skillsToSeed = [
  // Technical & Engineering
  'Software Development', 'Frontend Development', 'Backend Development', 'Mobile App Development',
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Django', 'Java', 'Spring Boot',
  'UI/UX Design', 'Data Analysis', 'Data Science', 'Machine Learning', 'Cybersecurity',
  'Network Engineering', 'Cloud Computing (AWS/Azure/GCP)', 'AWS', 'Google Cloud', 'Microsoft Azure',
  'DevOps', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Git',
  'Database Management (SQL/NoSQL)', 'SQL', 'PostgreSQL', 'MongoDB',
  'Quality Assurance', 'Technical Writing', 'Hardware Engineering',

  // Business & Finance
  'Accounting', 'Financial Analysis', 'Auditing', 'Investment Management', 'Risk Management',
  'Business Analysis', 'Project Management', 'Agile', 'Scrum', 'Product Management',
  'Business Strategy', 'Human Resources', 'Recruitment', 'Sales', 'Business Development',
  'Supply Chain Management', 'Logistics', 'Operations Management',

  // Marketing & Creative
  'Digital Marketing', 'Search Engine Optimization (SEO)', 'Content Marketing', 'Social Media Management',
  'Email Marketing', 'Graphic Design', 'Brand Management', 'Public Relations',
  'Corporate Communications', 'Video Production', 'Creative Writing', 'Market Research',

  // General Professional & Soft Skills
  'Customer Service', 'Data Entry', 'Administrative Support', 'Legal Compliance', 'Contract Negotiation',
  'Leadership', 'Team Management', 'Public Speaking', 'Problem Solving', 'Critical Thinking'
];

export async function seedSkills(prisma: PrismaClient) {
    console.log('🌱 Seeding essential skills...');

    const uniqueSkills = [...new Set(skillsToSeed)];

    const skillsData = uniqueSkills.map(name => ({
        name,
        slug: generateSlug(name),
    }));

    // Use `createMany` with `skipDuplicates` for efficiency.
    // The cleanup script already handles deletion.
    await prisma.skill.createMany({
        data: skillsData,
        skipDuplicates: true,
    });

    console.log(`  - ✅ ${uniqueSkills.length} essential skills seeded.`);
}