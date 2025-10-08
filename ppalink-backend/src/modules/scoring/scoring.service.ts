import prisma from '../../config/db';
import { QuizLevel } from '@prisma/client';

// Helper to assign numerical values to skill levels for comparison
const levelToScore = (level: QuizLevel): number => {
    switch (level) {
        case 'BEGINNER': return 1;
        case 'INTERMEDIATE': return 2;
        case 'ADVANCED': return 3;
        default: return 0;
    }
};


/**
 * Calculates a comprehensive "Match Score" (0-100) for a candidate against a job position.
 * @param candidateId The ID of the candidate's profile.
 * @param positionId The ID of the job position.
 */
export async function calculateMatchScore(candidateId: string, positionId: string): Promise<number> {
  // 1. Fetch all required data in a single, efficient transaction
  const [candidate, position] = await prisma.$transaction([
    prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      include: {
        education: true,
        workExperiences: true,
        skills: { include: { skill: true } },
        quizAttempts: { 
            where: { passed: true },
            include: { quiz: { select: { level: true } } }
        },
      },
    }),
    prisma.position.findUnique({
      where: { id: positionId },
      include: { skills: { include: { skill: true } } },
    }),
  ]);

  if (!candidate || !position) {
    // Should not happen in a real flow, but a necessary safeguard
    return 0;
  }

  let totalScore = 0;

  // --- 2. Score Skills (50%) ---
  if (position.skills.length > 0) {
    let skillScore = 0;
    const maxSkillScore = 50;
    const pointsPerSkill = maxSkillScore / position.skills.length;
    
    // Create a map of the candidate's verified skills and their levels
    const verifiedSkills = new Map<number, QuizLevel>();
    candidate.quizAttempts.forEach(attempt => {
        if (attempt.skillId) {
            const currentLevel = verifiedSkills.get(attempt.skillId);
            const attemptLevel = attempt.quiz.level;
            if (!currentLevel || levelToScore(attemptLevel) > levelToScore(currentLevel)) {
                verifiedSkills.set(attempt.skillId, attemptLevel);
            }
        }
    });

    for (const requiredSkill of position.skills) {
      const candidateHasSkill = candidate.skills.some(cs => cs.skillId === requiredSkill.skillId);
      if (candidateHasSkill) {
        skillScore += pointsPerSkill * 0.5; // Base points for having the skill
        
        // Bonus points for verified level
        const candidateLevel = verifiedSkills.get(requiredSkill.skillId);
        if (candidateLevel && levelToScore(candidateLevel) >= levelToScore(requiredSkill.requiredLevel)) {
          skillScore += pointsPerSkill * 0.5; // Full points if level is met or exceeded
        }
      }
    }
    totalScore += skillScore;
  }

  // --- 3. Score Experience (20%) ---
  // A simple keyword match against job titles
  let experienceScore = 0;
  const keywords = position.title.toLowerCase().split(' ');
  for (const exp of candidate.workExperiences) {
      if (keywords.some(kw => exp.title.toLowerCase().includes(kw))) {
          experienceScore = 20; // Give full points if any experience title matches
          break;
      }
  }
  totalScore += experienceScore;
  
  // --- 4. Score Education (20%) ---
  // A simple keyword match against degree and field of study
  let educationScore = 0;
  for (const edu of candidate.education) {
      if (keywords.some(kw => edu.degree.toLowerCase().includes(kw) || edu.field?.toLowerCase().includes(kw))) {
          educationScore = 20; // Full points if any education record matches
          break;
      }
  }
  totalScore += educationScore;

  // --- 5. Score Other Requirements (10%) ---
  let otherScore = 0;
  if (position.stateId && candidate.primaryStateId === position.stateId) {
      otherScore += 5;
  } else if (candidate.isOpenToReloc) {
      otherScore += 2.5; // Half points for being open to relocation
  }
  if (position.isRemote && candidate.isRemote) {
      otherScore += 5;
  }
  totalScore += otherScore;

  return Math.round(totalScore);
}