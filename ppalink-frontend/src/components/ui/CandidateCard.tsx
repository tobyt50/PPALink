import { Award, BadgeCheck, MapPin } from "lucide-react";
import React, { useMemo } from "react";
import { Avatar } from "../../components/ui/Avatar";
import { useLocationNames } from "../../hooks/useLocationNames";
import type { CandidateProfile } from "../../types/candidate";

interface CandidateCardProps {
  candidate: CandidateProfile;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate }) => {
  const { fullLocationString, isLoading: isLoadingLocation } = useLocationNames(
    candidate.countryId,
    candidate.regionId,
    candidate.cityId
  );

  const SKILL_LIMIT = 4;

  const displaySkills = useMemo(() => {
    if (!candidate) return [];
    const allSkills = candidate.skills || [];
    const passedAttempts =
      candidate.quizAttempts?.filter((a) => a.passed && a.skillId) || [];

    const verifiedSkillMap = new Map<number, { score: number }>();
    passedAttempts.forEach((a) => {
      if (a.skillId && (!verifiedSkillMap.has(a.skillId) || a.score > verifiedSkillMap.get(a.skillId)!.score)) {
        verifiedSkillMap.set(a.skillId, { score: a.score });
      }
    });

    const allSkillsMap = new Map<number, { id: number; name: string; isVerified: boolean; score?: number }>();
    allSkills.forEach((s) => {
      allSkillsMap.set(s.skill.id, { ...s.skill, isVerified: false });
    });

    passedAttempts.forEach((a) => {
      if (a.skillId && a.skill) {
        allSkillsMap.set(a.skillId, {
          ...a.skill,
          isVerified: true,
          score: verifiedSkillMap.get(a.skillId)?.score,
        });
      }
    });

    return Array.from(allSkillsMap.values()).sort(
      (a, b) => (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0)
    );
  }, [candidate]);

  return (
    <div className="group flex flex-col h-full rounded-xl bg-white dark:bg-zinc-900 p-4 shadow-sm ring-1 ring-gray-100 dark:ring-white/10 transition-all hover:shadow-md hover:ring-primary-200 dark:hover:ring-primary-700/40 hover:bg-gradient-to-r hover:from-primary-50/40 dark:hover:from-primary-950/40 hover:to-green-50/40 dark:hover:to-green-950/40">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar candidate={candidate} size="lg" />
        <div className="min-w-0">
          <p className="font-semibold text-base text-primary-600 dark:text-primary-400 truncate">
            {candidate.firstName} {candidate.lastName}
          </p>
          <p
            className="text-xs text-gray-600 dark:text-zinc-400 leading-snug mt-0.5 line-clamp-2"
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

      {/* Skills */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 min-h-[22px] text-xs">
        {displaySkills.length > 0 ? (
          <>
            {displaySkills.slice(0, SKILL_LIMIT).map((skill) => (
              <div key={skill.id} className="relative group/skill">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
                    skill.isVerified
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                      : "bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                  }`}
                >
                  {skill.isVerified && <Award className="h-3 w-3 mr-1" />}
                  {skill.name}
                </span>
                <div className="absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-100 dark:bg-zinc-900 px-2 py-1.5 text-[10px] font-medium text-zinc-900 dark:text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover/skill:opacity-100 pointer-events-none">
                  {skill.isVerified
                    ? `Verified (${skill.score}%)`
                    : "Unverified skill"}
                </div>
              </div>
            ))}
            {displaySkills.length > SKILL_LIMIT && (
              <span className="rounded-full bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 font-medium text-gray-600 dark:text-zinc-300">
                +{displaySkills.length - SKILL_LIMIT}
              </span>
            )}
          </>
        ) : (
          <p className="text-gray-400 dark:text-zinc-500">No skills listed.</p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 border-t border-gray-100 dark:border-zinc-800 pt-2 flex items-center justify-between text-xs text-gray-600 dark:text-zinc-300">
        <span className="flex items-center">
          <BadgeCheck className="h-3.5 w-3.5 mr-1 text-green-500" />
          {candidate.verificationLevel.replace("_", " ")}
        </span>
        <span className="flex items-center">
          <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-zinc-500" />
          {isLoadingLocation
            ? "..."
            : candidate.isRemote
            ? "Remote"
            : fullLocationString || "On-site"}
        </span>
      </div>
    </div>
  );
};

export default CandidateCard;
