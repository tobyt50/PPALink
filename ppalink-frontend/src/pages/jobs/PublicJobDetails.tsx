import {
  Award,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Crown,
  Globe,
  GraduationCap,
  Heart,
  Loader2,
  MapPin,
  Tag,
  User,
  Wallet,
} from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import { useLocationNames } from "../../hooks/useLocationNames";
import { useSmartCurrency } from "../../hooks/useSmartCurrency";
import candidateService from "../../services/candidate.service";
import jobService from "../../services/job.service";
import type { Position } from "../../types/job";
import applicationService from "../../services/application.service";

const SmartDescription = ({ text }: { text: string }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return (
          <React.Fragment key={index}>
            {part.split("\n").map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < part.split("\n").length - 1 && <br />}
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      })}
    </>
  );
};

const DetailField = ({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
}) => (
  <div className="flex items-start">
    <Icon className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-zinc-500 mt-1" />
    <div className="ml-3">
      <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">
        {label}
      </p>
      <div className="mt-1 text-base text-gray-800 dark:text-zinc-100">
        {children || value || "N/A"}
      </div>
    </div>
  </div>
);

const PublicJobDetailsPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const { user, login } = useAuthStore();
  const {
    data: job,
    isLoading,
    error,
  } = useFetch<Position>(jobId ? `/public/jobs/${jobId}` : null);

  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
      if (jobId) {
          jobService.recordJobView(jobId);
      }
  }, [jobId]);

  const { fullLocationString, isLoading: isLoadingLocation } = useLocationNames(
    job?.countryId,
    job?.regionId,
    job?.cityId
  );
  
  const formattedSalary = useSmartCurrency(job?.minSalary, job?.currency);
  const formattedMaxSalary = useSmartCurrency(job?.maxSalary, job?.currency);

  const levelIconMap = {
    ENTRY: GraduationCap,
    INTERMEDIATE: User,
    SENIOR: Crown,
    PRINCIPAL: Award,
  };

  const isFollowing = useMemo(
    () => user?.followedAgencyIds?.includes(job?.agencyId || ""),
    [user, job]
  );

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in to follow agencies.");
      navigate("/login");
      return;
    }
    if (!job?.agencyId) return;
    const actionPromise = isFollowing
      ? candidateService.unfollowAgency(job.agencyId)
      : candidateService.followAgency(job.agencyId);
    await toast.promise(actionPromise, {
      loading: isFollowing ? "Unfollowing..." : "Following...",
      success: () => {
        const currentFollowed = user.followedAgencyIds || [];
        const newFollowed = isFollowing
          ? currentFollowed.filter((id) => id !== job.agencyId)
          : [...currentFollowed, job.agencyId!];
        login(
          { ...user, followedAgencyIds: newFollowed },
          useAuthStore.getState().token!
        );
        return isFollowing
          ? "Agency unfollowed."
          : "Agency followed successfully!";
      },
      error: "An error occurred.",
    });
  };

  const handleApply = async () => {
    if (!user) {
      toast.error("Please create an account or log in to apply.");
      navigate("/login");
      return;
    }
    if (!jobId) return;
    setIsApplying(true);
    try {
      await applicationService.applyForJob(jobId);
      toast.success("Application submitted successfully!");
      navigate("/dashboard/candidate/applications");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to submit application."
      );
    } finally {
      setIsApplying(false);
    }
  };

  const formatEmploymentType = (type: string): string => {
    switch (type) {
      case "PARTTIME": return "Part-time";
      case "FULLTIME": return "Full-time";
      case "NYSC": return "NYSC";
      default: return type.charAt(0) + type.slice(1).toLowerCase();
    }
  };

  const formatLevel = (level: string): string => {
    return level.charAt(0) + level.slice(1).toLowerCase();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center text-red-500 p-8">
        Error loading job details.
      </div>
    );
  }

  const LevelIcon = job.level
    ? levelIconMap[job.level as keyof typeof levelIconMap]
    : undefined;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          to={user ? "/dashboard/candidate/jobs/browse" : "/"}
          className="flex items-center text-sm font-semibold text-gray-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to All Jobs
        </Link>
      </div>

      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500 dark:text-zinc-400 mt-2">
                {!job.isRemote && fullLocationString && (
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    {isLoadingLocation ? "Loading..." : fullLocationString}
                  </span>
                )}
                {job.isRemote && (
                  <span className="flex items-center">
                    <Globe className="h-4 w-4 mr-1.5" />
                    Remote
                  </span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <Button size="lg" onClick={handleApply} isLoading={isApplying}>
                Apply Now
              </Button>
            </div>
          </div>
          <div className="mt-3 pt-3 -mb-3 -mx-6 px-6 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
            <Link
              to={`/agencies/${job.agencyId}/profile`}
              className="flex items-center group"
            >
              <Avatar
                user={{
                  role: "AGENCY",
                  ownedAgencies: [job.agency as any],
                }}
                size="md"
              />
              <div className="ml-3">
                <p className="font-semibold text-gray-800 dark:text-zinc-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {job.agency?.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {job.agency?.domainVerified && (
                    <span className="flex items-center text-xs font-medium text-blue-700 dark:text-blue-300">
                      <CheckCircle className="h-3.5 w-3.5 mr-1" /> Verified
                    </span>
                  )}
                </div>
              </div>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={handleToggleFollow}
            >
              <Heart
                className={`h-4 w-4 mr-2 ${
                  isFollowing ? "text-red-500 fill-current" : ""
                }`}
              />
              {isFollowing ? "Following" : "Follow"}
            </Button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <DetailField
              icon={Briefcase}
              label="Employment Type"
              value={formatEmploymentType(job.employmentType)}
            />
            {job.level && LevelIcon && (
              <DetailField
                icon={LevelIcon}
                label="Level"
                value={formatLevel(job.level)}
              />
            )}
            <DetailField
              icon={Wallet}
              label="Salary Range"
              value={
                job.minSalary && job.currency
                  ? `${formattedSalary}${job.maxSalary ? ` - ${formattedMaxSalary}` : ''}`
                  : "Not specified"
              }
            />
            <DetailField
              icon={Calendar}
              label="Date Posted"
              value={new Date(job.createdAt).toLocaleDateString()}
            />
          </div>
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                Job Description
              </h2>
              <div className="prose prose-sm max-w-none mt-2 text-gray-600 dark:text-zinc-300">
                <SmartDescription text={job.description} />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                Skills Required
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.isArray(job.skills) && job.skills.length > 0 ? (
                  job.skills.map((positionSkill) => (
                    <div
                      key={positionSkill.skill.id}
                      className="flex items-center gap-x-2 rounded-full bg-primary-50 dark:bg-primary-950/60 p-1 pr-3 text-sm font-medium text-primary-700 dark:text-primary-300 transition"
                    >
                      <Tag className="h-4 w-4 ml-1" />
                      <span>{positionSkill.skill.name}</span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-100">
                        {formatLevel(positionSkill.requiredLevel)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    No specific skills listed.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicJobDetailsPage;