import {
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Globe,
  GraduationCap,
  Heart,
  Loader2,
  MapPin,
  Tag,
  Wallet,
  User,
  Crown,
  Award,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useDataStore } from "../../context/DataStore";
import useFetch from "../../hooks/useFetch";
import applicationService from "../../services/application.service";
import type { Position } from "../../types/job";
import { useAuthStore } from "../../context/AuthContext";
import candidateService from "../../services/candidate.service";
import jobService from "../../services/job.service";

const DetailItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div>
    <dt className="flex items-center text-sm font-medium text-gray-500 dark:text-zinc-400">
      <Icon className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-zinc-500 mr-2" />
      <span>{label}</span>
    </dt>
    <dd className="mt-1.5 text-sm font-medium text-gray-900 dark:text-zinc-50 ml-7">
      {value}
    </dd>
  </div>
);

const SmartDescription = ({ text }: { text: string }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="text-gray-800 dark:text-zinc-100">
              {part.slice(2, -2)}
            </strong>
          );
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

const PublicJobDetailsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, isAuthenticated } = useAuthStore();
  const {
    data: job,
    isLoading,
    error,
  } = useFetch<Position>(jobId ? `/public/jobs/${jobId}` : null);

  const { states } = useDataStore();
  const [isApplying, setIsApplying] = useState(false);

  const levelIconMap = {
    ENTRY: GraduationCap,
    INTERMEDIATE: User,
    SENIOR: Crown,
    PRINCIPAL: Award,
  };

  const formatEmploymentType = (type: string): string => {
    switch (type) {
      case 'PARTTIME':
        return 'Part-time';
      case 'FULLTIME':
        return 'Full-time';
      case 'NYSC':
        return 'NYSC';
      default:
        return type.charAt(0) + type.slice(1).toLowerCase();
    }
  };

  const formatLevel = (level: string): string => {
    return level.charAt(0) + level.slice(1).toLowerCase();
  };

  useEffect(() => {
    if (jobId) {
      jobService.recordJobView(jobId);
    }
    // The empty dependency array ensures this effect runs only once on mount.
  }, [jobId]);

  const handleApply = async () => {
    if (!jobId) return;
    if (!isAuthenticated) {
      toast.error("Please log in or create an account to apply.");
      navigate("/login", { state: { from: location } });
      return;
    }
    setIsApplying(true);
    try {
      await applicationService.applyForJob(jobId);
      toast.success("Your application has been submitted successfully!");
      navigate("/dashboard/candidate/applications");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to submit your application."
      );
    } finally {
      setIsApplying(false);
    }
  };

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in to follow agencies.");
      navigate("/login", { state: { from: location } });
      return;
    }
    if (!job?.agencyId) return;
    const isFollowing = user.followedAgencyIds?.includes(job.agencyId);
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

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }
  if (error || !job) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">
        Error loading job details. This job may no longer be available.
      </div>
    );
  }

  const isFollowing = user?.followedAgencyIds?.includes(job?.agencyId || "");
  const locationState = job.isRemote
    ? "Remote"
    : job.stateId
      ? states.find((s) => s.id === job.stateId)?.name
      : "On-site";
  const salaryDisplay =
    job.minSalary && job.maxSalary
      ? `₦${job.minSalary.toLocaleString()} - ₦${job.maxSalary.toLocaleString()}`
      : job.minSalary
      ? `From ₦${job.minSalary.toLocaleString()}`
      : "Not specified";
  const LevelIcon = job?.level ? levelIconMap[job.level as keyof typeof levelIconMap] : undefined;
  const levelDisplay = job?.level ? formatLevel(job.level) : "N/A";

  return (
    <div
      className={`mx-auto max-w-5xl space-y-5 ${
        !isAuthenticated ? "py-6 px-4 sm:px-6 lg:px-8" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <Link
          to={isAuthenticated ? "/dashboard/candidate/jobs/browse" : "/"}
          className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1.5" />
          {isAuthenticated ? "Back to All Jobs" : "Back to Home"}
        </Link>
      </div>

      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
                {job.title}
              </h1>
              <div className="mt-2 flex items-center flex-wrap gap-x-3 gap-y-2 text-gray-600 dark:text-zinc-300">
                <Link
                  to={`/agencies/${job.agencyId}/profile`}
                  className="flex items-center text-sm hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <Building className="h-4 w-4 mr-1.5 text-gray-400 dark:text-zinc-500" />
                  {job.agency?.name}
                </Link>
                {job.agency?.cacVerified && (
                  <span className="flex items-center text-xs font-medium text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-950/60 px-2.5 py-1 rounded-full">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    CAC Verified
                  </span>
                )}
                {job.agency?.domainVerified && !job.agency.cacVerified && (
                  <span className="flex items-center text-xs font-medium text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-2.5 py-1 rounded-full">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    Verified Domain
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFollow}
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${
                      isFollowing ? "text-red-500 fill-current" : ""
                    }`}
                  />
                  {isFollowing ? "Following" : "Follow Agency"}
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto">
              <Button
                size="lg"
                onClick={handleApply}
                isLoading={isApplying}
                disabled={isApplying}
                className="w-full rounded-xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 text-white dark:text-zinc-100 hover:opacity-90 transition"
              >
                Apply Now
              </Button>
            </div>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <DetailItem
              icon={job.isRemote ? Globe : MapPin}
              label="Location"
              value={locationState || "N/A"}
            />
            <DetailItem
              icon={Briefcase}
              label="Type"
              value={formatEmploymentType(job.employmentType)}
            />
            <DetailItem icon={Wallet} label="Salary" value={salaryDisplay} />
            {job.level && LevelIcon && (
              <DetailItem
                icon={LevelIcon}
                label="Experience Level"
                value={levelDisplay}
              />
            )}
            <DetailItem
              icon={Calendar}
              label="Date Posted"
              value={new Date(job.createdAt).toLocaleDateString()}
            />
          </div>
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                Full Job Description
              </h2>
              <div className="prose prose-sm max-w-none mt-2 text-gray-600 dark:text-zinc-300">
                <SmartDescription text={job.description} />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                Skills Required
              </h2>
              <div className="flex flex-wrap gap-2 mt-3">
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