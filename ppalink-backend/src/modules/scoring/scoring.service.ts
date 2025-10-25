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
    return 0;
  }

  let totalScore = 0;

  // --- Score Skills (50%) ---
  if (position.skills.length > 0) {
    let skillScore = 0;
    const maxSkillScore = 50;
    const pointsPerSkill = maxSkillScore / position.skills.length;
    
    const verifiedSkills = new Map<number, QuizLevel>();
    candidate.quizAttempts.forEach(attempt => {
        if (attempt.skillId && attempt.quiz.level) {
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
        skillScore += pointsPerSkill * 0.5;
        
        const candidateLevel = verifiedSkills.get(requiredSkill.skillId);
        if (candidateLevel && levelToScore(candidateLevel) >= levelToScore(requiredSkill.requiredLevel)) {
          skillScore += pointsPerSkill * 0.5;
        }
      }
    }
    totalScore += skillScore;
  }

  // --- Score Experience (20%) ---
  let experienceScore = 0;
  const keywords = position.title.toLowerCase().split(' ').filter(k => k.length > 2);
  for (const exp of candidate.workExperiences) {
      if (keywords.some(kw => exp.title.toLowerCase().includes(kw))) {
          experienceScore = 20;
          break;
      }
  }
  totalScore += experienceScore;
  
  // --- Score Education (20%) ---
  let educationScore = 0;
  for (const edu of candidate.education) {
      if (edu.field && keywords.some(kw => edu.degree.toLowerCase().includes(kw) || edu.field!.toLowerCase().includes(kw))) {
          educationScore = 20;
          break;
      }
  }
  totalScore += educationScore;
  
  let otherScore = 0;
  // 1. Direct country match is a strong signal
  if (position.countryId && candidate.countryId === position.countryId) {
      otherScore += 5;
      // 2. Bonus points for region/city match within the same country
      if (position.regionId && candidate.regionId === position.regionId) {
          otherScore += 2.5;
          if (position.cityId && candidate.cityId === position.cityId) {
              otherScore += 2.5; // Maxes out location score at 10
          }
      }
  } 
  // 3. If no direct match, check if the candidate is open to relocation.
  else if (candidate.isOpenToReloc) {
      otherScore += 4; // High score for flexibility
  }
  
  // 4. Remote work preference is a separate check
  if (position.isRemote && candidate.isRemote) {
      otherScore += 5; // Add a bonus if both prefer remote
  }

  // Cap the "other" score at 10 points
  totalScore += Math.min(10, otherScore);

  return Math.round(Math.min(100, totalScore)); // Ensure final score doesn't exceed 100
}