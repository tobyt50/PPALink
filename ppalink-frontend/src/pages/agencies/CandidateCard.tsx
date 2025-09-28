import { BadgeCheck, MapPin } from "lucide-react";
import React from "react";
import { useDataStore } from "../../context/DataStore";
import type { CandidateProfile } from "../../types/candidate";

interface CandidateCardProps {
  candidate: CandidateProfile;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate }) => {
  const { states } = useDataStore();
  const locationState = states.find((s) => s.id === candidate.primaryStateId)?.name;
  const SKILL_LIMIT = 4;

  // Generate initials for avatar
  const initials = `${candidate.firstName?.[0] || ""}${candidate.lastName?.[0] || ""}`;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-5 transition-all hover:shadow-lg hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-950/60 hover:to-green-50 dark:hover:to-green-950/60 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start">
        {/* Avatar */}
        <div
  className="h-12 w-12 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 text-white dark:text-zinc-100 font-bold"
>
  {initials}
</div>


        {/* Name & Summary */}
        <div className="ml-4 flex-grow">
          <p className="font-bold text-base bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            {candidate.firstName} {candidate.lastName}
          </p>
          <div className="mt-1 overflow-hidden">
  <p
    className="text-sm text-gray-600 dark:text-zinc-300 leading-5 break-all"
    style={{
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 2,
      overflow: 'hidden',
    }}
  >
    {candidate.summary || "No summary provided."}
  </p>
</div>



        </div>
      </div>

      {/* Skills */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 min-h-[26px] text-xs">
        {candidate.skills && candidate.skills.length > 0 ? (
          <>
            {candidate.skills.slice(0, SKILL_LIMIT).map((skillInfo) => (
              <span
                key={skillInfo.skill.id}
                className="rounded-full bg-gray-100 dark:bg-zinc-800 px-2 py-1 font-medium text-gray-700 dark:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                {skillInfo.skill.name}
              </span>
            ))}
            {candidate.skills.length > SKILL_LIMIT && (
              <span className="rounded-full bg-gray-100 dark:bg-zinc-800 px-2 py-1 font-medium text-gray-600 dark:text-zinc-300">
                + {candidate.skills.length - SKILL_LIMIT} more
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


