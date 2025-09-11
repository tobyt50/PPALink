import prisma from '../../config/db';

// --- Work Experience Service Functions ---

interface WorkExperienceInput {
  company: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
}

export async function addWorkExperience(candidateProfileId: string, data: WorkExperienceInput) {
  const processedData = {
    ...data,
    startDate: new Date(data.startDate),
    // If endDate exists, convert it, otherwise it's null.
    endDate: data.endDate ? new Date(data.endDate) : null,
  };
  return prisma.workExperience.create({
    data: {
      candidateId: candidateProfileId,
      ...processedData,
    },
  });
}

export async function updateWorkExperience(experienceId: string, data: Partial<WorkExperienceInput>) {
  const processedData: Partial<WorkExperienceInput> = { ...data };

  // If startDate is a string, convert it to a Date object.
  if (typeof processedData.startDate === 'string') {
    processedData.startDate = new Date(processedData.startDate);
  }
  // If endDate is a string, convert it to a Date object.
  if (typeof processedData.endDate === 'string') {
    processedData.endDate = new Date(processedData.endDate);
  }
  return prisma.workExperience.update({
    where: { id: experienceId },
    data: processedData,
  });
}

export async function deleteWorkExperience(experienceId: string) {
  return prisma.workExperience.delete({
    where: { id: experienceId },
  });
}

// --- Education Service Functions ---

interface EducationInput {
  institution: string;
  degree: string;
  field?: string;
  grade?: string;
  startDate: Date;
  endDate: Date;
}

export async function addEducation(candidateProfileId: string, data: EducationInput) {
  return prisma.education.create({
    data: {
      candidateId: candidateProfileId,
      ...data,
    },
  });
}

export async function updateEducation(educationId: string, data: Partial<EducationInput>) {
  return prisma.education.update({
    where: { id: educationId },
    data,
  });
}

export async function deleteEducation(educationId: string) {
  return prisma.education.delete({
    where: { id: educationId },
  });
}