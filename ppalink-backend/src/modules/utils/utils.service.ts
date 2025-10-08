import prisma from '../../config/db';

/**
 * Fetches all industries from the database.
 */
export async function getAllIndustries() {
  return prisma.industry.findMany({
    orderBy: { name: 'asc' },
  });
}

/**
 * Fetches all location states from the database.
 */
export async function getAllLocationStates() {
  return prisma.locationState.findMany({
    orderBy: { name: 'asc' },
  });
}

/**
 * Fetches all LGAs for a given state ID.
 * @param stateId The ID of the state.
 */
export async function getLgasByStateId(stateId: number) {
  return prisma.locationLGA.findMany({
    where: { stateId },
    orderBy: { name: 'asc' },
  });
}

/**
 * Fetches all distinct universities (institutions) from candidate education.
 */
export async function getAllUniversities() {
  const universities = await prisma.education.findMany({
    distinct: ['institution'],
    select: { institution: true },
    orderBy: { institution: 'asc' },
  });
  return universities.map(u => ({ name: u.institution }));
}

/**
 * Fetches all distinct courses of study (fields) from candidate education.
 */
export async function getAllCourses() {
  const courses = await prisma.education.findMany({
    where: {
      field: {
        not: null,
        notIn: [''],
      },
    },
    distinct: ['field'],
    select: { field: true },
    orderBy: { field: 'asc' },
  });
  return courses.map(c => c.field!);
}

/**
 * Fetches all distinct degrees from candidate education.
 */
export async function getAllDegrees() {
  const degrees = await prisma.education.findMany({
    distinct: ['degree'],
    select: { degree: true },
    orderBy: { degree: 'asc' },
  });
  return degrees.map(d => ({ name: d.degree }));
}

/**
 * Fetches all skills from the database.
 */
export async function getAllSkills() {
  return prisma.skill.findMany({
    orderBy: { name: 'asc' },
  });
}

/**
 * Fetches all verifiable skills (skills with associated quizzes) from the database.
 */
export async function getVerifiableSkills() {
  return prisma.skill.findMany({
    where: {
      quizzes: {
        some: {},
      },
    },
    orderBy: { name: 'asc' },
  });
}