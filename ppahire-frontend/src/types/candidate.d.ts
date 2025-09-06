// This type should mirror the CandidateProfile model in your Prisma schema.

// 1. Add types for the nested skill relation
interface Skill {
  id: number;
  name: string;
  slug: string;
}

interface CandidateSkill {
  skill: Skill;
}


export interface CandidateProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  dob: string | null;
  gender: string | null;
  nyscNumber: string | null;
  nyscBatch: string | null;
  nyscStream: string | null;
  stateCode: string | null;
  primaryStateId: number | null;
  lgaId: number | null;
  isVerified: boolean;
  verificationLevel: string;
  isRemote: boolean;
  isOpenToReloc: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  availability: string | null;
  summary: string | null;
  linkedin: string | null;
  portfolio: string | null;
  graduationYear: number | null;
  gpaBand: string | null;
  
  // 2. Add the skills property to the main type
  skills?: CandidateSkill[]; // Optional because it's not always fetched
}