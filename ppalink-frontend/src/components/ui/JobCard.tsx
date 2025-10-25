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
import type { Position } from "../../types/job";
import { Avatar } from "./Avatar";
import { useLocationNames } from "../../hooks/useLocationNames";

const JobCard = ({ job }: { job: Position }) => {
  const agency = job.agency;
  const { fullLocationString } = useLocationNames(job.countryId, job.regionId);

  const levelIconMap = {
    ENTRY: GraduationCap,
    INTERMEDIATE: User,
    SENIOR: Crown,
    PRINCIPAL: Award,
  };

  const formatEmploymentType = (type: string) =>
    type === "PARTTIME"
      ? "Part-time"
      : type === "FULLTIME"
      ? "Full-time"
      : type;

  const formatLevel = (level: string) =>
    level.charAt(0) + level.slice(1).toLowerCase();

  const LevelIcon = levelIconMap[job.level as keyof typeof levelIconMap];

  return (
    <Link
      to={`/jobs/${job.id}/details`}
      className="group block rounded-xl bg-white dark:bg-zinc-900 p-4 shadow-sm ring-1 ring-gray-100 dark:ring-white/10 transition-all hover:shadow-md hover:ring-primary-200 dark:hover:ring-primary-700/50 hover:bg-gradient-to-r hover:from-primary-50/50 dark:hover:from-primary-950/40 hover:to-green-50/50 dark:hover:to-green-950/40"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar
          user={agency ? { role: "AGENCY", ownedAgencies: [agency] as any } : null}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base text-primary-600 dark:text-primary-400 truncate">
            {job.title}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs text-gray-600 dark:text-zinc-400">
            <span className="truncate">{agency?.name}</span>
            {agency?.cacVerified && (
              <span className="flex items-center text-green-700 dark:text-green-300 bg-green-100/70 dark:bg-green-950/60 px-1.5 py-0.5 rounded-full font-medium">
                <CheckCircle className="h-3 w-3 mr-1" /> CAC
              </span>
            )}
            {agency?.domainVerified && (
              <span className="flex items-center text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-full font-medium">
                <CheckCircle className="h-3 w-3 mr-1" /> Domain
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-700 dark:text-zinc-300 mt-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
        <span className="flex items-center">
          <Briefcase className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-zinc-500" />
          {formatEmploymentType(job.employmentType)}
        </span>
        <span className="flex items-center">
          {job.isRemote ? (
            <>
              <Globe className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-zinc-500" /> Remote
            </>
          ) : (
            <>
              <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-zinc-500" />{" "}
              {fullLocationString || "On-site"}
            </>
          )}
        </span>
        <span className="flex items-center">
          <LevelIcon className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-zinc-500" />
          {formatLevel(job.level)}
        </span>
      </div>
    </Link>
  );
};

export { JobCard };
