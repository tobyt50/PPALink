import type { QuizAttempt } from './quiz';

export interface WorkExperience {
  id: string;
  candidateId: string;
  company: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  verification?: WorkVerification | null;
}
export interface WorkVerification {
  id: string;
  workExperienceId: string;
  verifyingAgencyId: string;
  verifierName: string | null;
  verifierTitle: string | null;
  verifiedAt: string;
}

export interface Education {
  id: string;
  candidateId: string;
  institution: string;
  degree: string;
  field: string | null;
  grade: string | null;
  startDate: string;
  endDate: string;
}


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
  cvFileKey: string | null;
  nyscFileKey: string | null;
  hasCompletedOnboarding: boolean;
  profileType: CandidateProfileType;
  applications?: Partial<Application>[];
  skills?: CandidateSkill[];

  user?: {
    id: string;
    email: string;
    avatarKey?: string | null;
  };

  workExperiences?: WorkExperience[];
  education?: Education[];
  quizAttempts?: QuizAttempt[];
}