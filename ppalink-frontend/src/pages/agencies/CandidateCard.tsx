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
    <div className="bg-white rounded-2xl shadow-md ring-1 ring-gray-100 p-5 transition-all hover:shadow-lg hover:bg-gradient-to-r hover:from-primary-50 hover:to-green-50 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-600 to-green-500 flex items-center justify-center text-white font-bold">
          {initials}
        </div>

        {/* Name & Summary */}
        <div className="ml-4 flex-grow">
          <p className="font-bold text-base bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">
            {candidate.firstName} {candidate.lastName}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
            {candidate.summary || "No summary provided."}
          </p>
        </div>
      </div>

      {/* Skills */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 min-h-[26px] text-xs">
        {candidate.skills && candidate.skills.length > 0 ? (
          <>
            {candidate.skills.slice(0, SKILL_LIMIT).map((skillInfo) => (
              <span
                key={skillInfo.skill.id}
                className="rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {skillInfo.skill.name}
              </span>
            ))}
            {candidate.skills.length > SKILL_LIMIT && (
              <span className="rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-600">
                + {candidate.skills.length - SKILL_LIMIT} more
              </span>
            )}
          </>
        ) : (
          <p className="text-gray-400">No skills listed.</p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-sm text-gray-600 mt-4">
        <div className="flex items-center">
          <BadgeCheck className="h-4 w-4 mr-1.5 text-green-500" />
          {candidate.verificationLevel.replace("_", " ")}
        </div>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
          {candidate.isRemote ? "Remote" : locationState || "On-site"}
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;
