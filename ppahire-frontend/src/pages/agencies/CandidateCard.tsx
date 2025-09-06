import { BadgeCheck, MapPin } from 'lucide-react';
import React from 'react';
import type { CandidateProfile } from '../../types/candidate';

interface CandidateCardProps {
  candidate: CandidateProfile;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate }) => {
  return (
    <div className="border border-gray-200 bg-white rounded-lg p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start">
        {/* Placeholder for an avatar */}
        <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="ml-4">
          <p className="font-semibold text-primary-700">
            {candidate.firstName} {candidate.lastName}
          </p>
          <p className="text-sm text-gray-500 line-clamp-2">
            {/* Display a snippet of their summary */}
            {candidate.summary || 'No summary provided.'}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {/* Display skills */}
        {candidate.skills && candidate.skills.slice(0, 3).map((skillInfo) => (
          <span key={skillInfo.skill.id} className="rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-600">
            {skillInfo.skill.name}
          </span>
        ))}
      </div>
      <div className="mt-4 border-t pt-3 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center">
          <BadgeCheck className="h-4 w-4 mr-1.5 text-blue-500" />
          {candidate.verificationLevel.replace('_', ' ')}
        </div>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1.5" />
          {candidate.isRemote ? 'Remote' : 'On-site'}
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;