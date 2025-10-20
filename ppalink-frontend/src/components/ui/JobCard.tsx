import {
  CheckCircle,
  Briefcase,
  Globe,
  MapPin,
  GraduationCap,
  User,
  Crown,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDataStore } from "../../context/DataStore";
import type { Position } from "../../types/job";
import { Avatar } from "./Avatar";

const JobCard = ({ job }: { job: Position }) => {
  const agency = job.agency;
  const { states } = useDataStore();
  const locationState = job.stateId
    ? states.find((s) => s.id === job.stateId)?.name
    : null;

  const levelIconMap = {
    ENTRY: GraduationCap,
    INTERMEDIATE: User,
    SENIOR: Crown,
    PRINCIPAL: Award,
  };

  const formatEmploymentType = (type: string): string => {
    switch (type) {
      case "PARTTIME":
        return "Part-time";
      case "FULLTIME":
        return "Full-time";
      case "NYSC":
        return "NYSC";
      default:
        return type.charAt(0) + type.slice(1).toLowerCase();
    }
  };

  const formatLevel = (level: string): string => {
    return level.charAt(0) + level.slice(1).toLowerCase();
  };

  const LevelIcon = levelIconMap[job.level as keyof typeof levelIconMap];

  return (
    <Link
      to={`/jobs/${job.id}/details`}
      className="group block rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 transition-all hover:shadow-lg hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-950/60 hover:to-green-50 dark:hover:to-green-950/60"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-start flex-grow">
          <Avatar
            user={agency ? { role: "AGENCY", ownedAgencies: [agency] as any } : null}
            size="md"
          />
          <div className="ml-4">
            <p className="font-semibold text-lg text-primary-600 dark:text-primary-400 transition-colors">
              {job.title}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center text-sm text-gray-600 dark:text-zinc-300 mt-1 gap-2">
              <span className="flex-shrink-0">{agency?.name}</span>
              {agency?.cacVerified && (
                <span className="flex items-center text-xs font-medium text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-950/60 px-2 py-1 rounded-full whitespace-nowrap">
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  CAC Verified
                </span>
              )}
              {agency?.domainVerified && (
                <span className="flex items-center text-xs font-medium text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-2 py-1 rounded-full whitespace-nowrap">
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  Verified Domain
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-zinc-200 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
        <span className="flex items-center">
          <Briefcase className="h-4 w-4 mr-1.5 text-gray-400 dark:text-zinc-500" />
          {formatEmploymentType(job.employmentType)}
        </span>
        <span className="flex items-center">
          {job.isRemote ? (
            <>
              <Globe className="h-4 w-4 mr-1.5 text-gray-400 dark:text-zinc-500" />
              Remote
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-1.5 text-gray-400 dark:text-zinc-500" />
              {locationState || "On-site"}
            </>
          )}
        </span>
        <span className="flex items-center">
          <LevelIcon className="h-4 w-4 mr-1.5 text-gray-400 dark:text-zinc-500" />
          {formatLevel(job.level)}
        </span>
      </div>
    </Link>
  );
};

export { JobCard };
