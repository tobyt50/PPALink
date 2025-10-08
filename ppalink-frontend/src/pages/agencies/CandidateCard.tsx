import { Award, BadgeCheck, MapPin } from "lucide-react";
import React, { useMemo } from "react";
import { useDataStore } from "../../context/DataStore";
import type { CandidateProfile } from "../../types/candidate";

interface CandidateCardProps {
  candidate: CandidateProfile;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate }) => {
  const { states } = useDataStore();
  const locationState = states.find(
    (s) => s.id === candidate.primaryStateId
  )?.name;
  const SKILL_LIMIT = 4;

  // Generate initials for avatar
  const initials = `${candidate.firstName?.[0] || ""}${
    candidate.lastName?.[0] || ""
  }`;

  const displaySkills = useMemo(() => {
    if (!candidate) return [];
    const allSkills = candidate.skills || [];
    const passedAttempts =
      candidate.quizAttempts?.filter((a) => a.passed && a.skillId) || [];
    const verifiedSkillMap = new Map<number, { score: number }>();
    passedAttempts.forEach((attempt) => {
      if (attempt.skillId) {
        const currentScore = verifiedSkillMap.get(attempt.skillId)?.score || 0;
        if (attempt.score > currentScore) {
          verifiedSkillMap.set(attempt.skillId, { score: attempt.score });
        }
      }
    });
    const allSkillsMap = new Map<
      number,
      { id: number; name: string; isVerified: boolean; score?: number }
    >();
    allSkills.forEach((s) => {
      allSkillsMap.set(s.skill.id, { ...s.skill, isVerified: false });
    });
    passedAttempts.forEach((attempt) => {
      if (attempt.skillId && attempt.skill) {
        allSkillsMap.set(attempt.skillId, {
          ...attempt.skill,
          isVerified: true,
          score: verifiedSkillMap.get(attempt.skillId)?.score,
        });
      }
    });
    const combinedSkills = Array.from(allSkillsMap.values());
    combinedSkills.sort(
      (a, b) => (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0)
    );
    return combinedSkills;
  }, [candidate]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-5 transition-all hover:shadow-lg hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-950/60 hover:to-green-50 dark:hover:to-green-950/60 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 text-white dark:text-zinc-100 font-bold">
          {initials}
        </div>

        {/* Name & Summary */}
        <div className="ml-4 flex-grow">
          <p className="font-bold text-base bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            {candidate.firstName} {candidate.lastName}
          </p>
          <div className="mt-1 overflow-hidden">
            <p
              className="text-sm text-gray-600 dark:text-zinc-300 leading-5 break-words"
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                overflow: "hidden",
              }}
            >
              {candidate.summary || "No summary provided."}
            </p>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 min-h-[26px] text-xs">
        {displaySkills.length > 0 ? (
          <>
            {displaySkills.slice(0, SKILL_LIMIT).map((skill) => (
  <div key={skill.id} className="relative group">
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-medium cursor-default ${
        skill.isVerified
          ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
          : "bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300"
      }`}
    >
      {skill.isVerified && <Award className="h-3 w-3 mr-1" />}
      {skill.name}
    </span>

    {/* Tooltip (now below instead of right, with safe margins) */}
    <div className="absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 
      whitespace-nowrap rounded-md bg-gray-100 dark:bg-zinc-900 px-2 py-1.5 
      text-xs font-medium text-zinc-900 dark:text-white opacity-0 
      shadow-lg transition-opacity duration-300 group-hover:opacity-100 
      pointer-events-none max-w-[calc(100vw-2rem)]">
      {skill.isVerified
        ? `Verified Skill - Score: ${skill.score}%`
        : "Unverified skill"}
    </div>
  </div>
))}

            {displaySkills.length > SKILL_LIMIT && (
              <span className="rounded-full bg-gray-100 dark:bg-zinc-800 px-2 py-1 font-medium text-gray-600 dark:text-zinc-300">
                + {displaySkills.length - SKILL_LIMIT} more
              </span>
            )}
          </>
        ) : (
          <p className="text-gray-400 dark:text-zinc-500">No skills listed.</p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-zinc-800 pt-3 flex items-center justify-between text-sm text-gray-600 dark:text-zinc-300 mt-4">
        <div className="flex items-center">
          <BadgeCheck className="h-4 w-4 mr-1.5 text-green-500" />
          {candidate.verificationLevel.replace("_", " ")}
        </div>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1.5 text-gray-400 dark:text-zinc-500" />
          {candidate.isRemote ? "Remote" : locationState || "On-site"}
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;