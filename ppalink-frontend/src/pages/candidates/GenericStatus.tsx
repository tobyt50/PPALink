import {
  Briefcase,
  ChevronLeft,
  Globe,
  Loader2,
  MapPin,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useDataStore } from "../../context/DataStore";
import useFetch from "../../hooks/useFetch";
import type { Application } from "../../types/application";
import type { Position } from "../../types/job";
import ProfileField from "./ProfileField";

const SimilarJobCard = ({ job }: { job: Position }) => (
  <Link
    to={`/jobs/${job.id}/details`}
    className="block p-4 border dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
  >
    <p className="font-semibold text-primary-600 dark:text-primary-400">
      {job.title}
    </p>
    <p className="text-sm text-gray-500 dark:text-zinc-400">
      {job.agency?.name}
    </p>
  </Link>
);

const GenericStatusPage = ({ application }: { application: Application }) => {
  const [showSimilar, setShowSimilar] = useState(false);
  const { data: similarJobs, isLoading } = useFetch<Position[]>(
    showSimilar ? `/candidates/me/jobs/${application.positionId}/similar` : null
  );

  const { states } = useDataStore();
  const locationState = states.find(
    (s) => s.id === application.position.stateId
  )?.name;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="mb-6">
        <Link
          to="/dashboard/candidate/applications"
          className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1.5" />
          Back to My Applications
        </Link>
      </div>

      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
          <Link
            to={`/jobs/${application.position.id}/details`}
            className="group"
          >
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent transition-colors duration-300 hover:from-primary-700 hover:to-green-600 dark:hover:from-primary-400 dark:hover:to-green-300">
              {application.position.title}
            </h1>
          </Link>
          <p className="mt-1 text-gray-600 dark:text-zinc-300">
            at{" "}
            <span className="font-semibold">
              {application.position.agency?.name}
            </span>
          </p>
          <div className="mt-4">
            <p className="text-sm text-gray-700 dark:text-zinc-200">
              Your application status is currently:{" "}
              <span className="font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                {application.status}
              </span>
            </p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
          <ProfileField
            icon={Briefcase}
            label="Employment Type"
            value={application.position.employmentType}
          />
          <ProfileField icon={MapPin} label="Location">
            {application.position.isRemote ? (
              <span className="flex items-center">
                <Globe className="h-4 w-4 mr-1.5" /> Remote
              </span>
            ) : (
              locationState || "Not specified"
            )}
          </ProfileField>
          <div className="sm:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-2">
              Skills Required
            </h3>
            <div className="flex flex-wrap gap-2">
              {application.position.skills?.map(({ skill }) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-950/60 px-3 py-1 text-sm font-medium text-green-800 dark:text-green-200"
                >
                  <Tag className="h-4 w-4 mr-1.5" />
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-100 dark:border-zinc-800 flex justify-center">
          <Button
            onClick={() => setShowSimilar(true)}
            disabled={showSimilar}
            isLoading={isLoading}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Find Similar Jobs
          </Button>
        </div>
      </div>

      {showSimilar && (
        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
              Similar Openings
            </h2>
          </div>
          <div className="p-6">
            {isLoading && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
              </div>
            )}
            {!isLoading && similarJobs && similarJobs.length > 0 && (
              <div className="space-y-3">
                {similarJobs.map((job) => (
                  <SimilarJobCard key={job.id} job={job} />
                ))}
              </div>
            )}
            {!isLoading && (!similarJobs || similarJobs.length === 0) && (
              <p className="text-center text-sm text-gray-500 dark:text-zinc-400">
                No other similar jobs found at the moment.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericStatusPage;
