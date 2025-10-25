import {
  Award,
  BadgeCheck,
  Briefcase,
  Cake,
  CheckCircle,
  Edit,
  FileText,
  GraduationCap,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Phone,
  Tag,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import DocumentLink from "../../components/ui/DocumentLink";
import { useAuthStore } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import { useLocationNames } from "../../hooks/useLocationNames";
import type { CandidateProfile } from "../../types/candidate";
import ProfileField from "./ProfileField";
import EducationSection from "./sections/EducationSection";
import WorkExperienceSection from "./sections/WorkExperienceSection";

const CandidateProfilePage = () => {
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useFetch<CandidateProfile>("/candidates/me");
  const user = useAuthStore((state) => state.user);

  const { fullLocationString, isLoading: isLoadingLocation } = useLocationNames(
    profile?.countryId,
    profile?.regionId,
    profile?.cityId
  );

  const displaySkills = useMemo(() => {
    if (!profile) return [];
    const allSkills = profile.skills || [];
    const passedAttempts =
      profile.quizAttempts?.filter((a) => a.passed && a.skillId) || [];
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
  }, [profile]);

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">
        <h3 className="text-lg font-semibold">Could Not Load Profile</h3>
        <p className="mt-2 text-sm">
          {error?.toString() ||
            "An unexpected error occurred. Please try again later."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-300">
            View and manage your professional details.
          </p>
        </div>
        <Link to="/dashboard/candidate/profile/edit">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                Personal Information
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center md:flex-row md:items-start gap-6 mb-6">
                <div className="flex-shrink-0">
                  <Avatar candidate={profile} size="xl" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-50">{`${profile.firstName} ${profile.lastName}`}</h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-300 mt-1">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                <ProfileField
                  icon={Phone}
                  label="Phone Number"
                  value={profile.phone}
                />
                <ProfileField
                  icon={Cake}
                  label="Date of Birth"
                  value={
                    profile.dob
                      ? new Date(profile.dob).toLocaleDateString()
                      : null
                  }
                />
                <ProfileField
                  icon={MapPin}
                  label="Primary Location"
                  value={isLoadingLocation ? "Loading..." : fullLocationString}
                />
                <ProfileField
                  icon={LinkIcon}
                  label="LinkedIn Profile"
                  value={profile.linkedin}
                />
                <ProfileField
                  icon={LinkIcon}
                  label="Portfolio URL"
                  value={profile.portfolio}
                />
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                Professional Summary
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-zinc-300 whitespace-pre-wrap">
                {profile.summary || "You have not added a summary yet."}
              </p>
            </div>
          </div>
          <WorkExperienceSection
            experiences={profile.workExperiences || []}
            isOwner={true}
            refetchProfile={refetch}
          />
          <EducationSection
            educationHistory={profile.education || []}
            isOwner={true}
            refetchProfile={refetch}
          />
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                Verification Status
              </h2>
            </div>
            <div className="p-6">
              <ProfileField icon={BadgeCheck} label="Current Level">
                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-950/60 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:text-blue-300">
                  {profile.verificationLevel.replace("_", " ")}
                </span>
              </ProfileField>
              <div className="mt-4">
                <Link to="/dashboard/candidate/verifications/submit">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-lg border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50"
                  >
                    Submit Documents
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                Skills
              </h2>
            </div>
            <div className="p-6 flex flex-wrap gap-2">
              {displaySkills.length > 0 ? (
                displaySkills.map((skill) => (
                  <div key={skill.id} className="relative inline-block">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium cursor-default peer ${
                        skill.isVerified
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                          : "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-200"
                      }`}
                    >
                      {skill.isVerified ? (
                        <Award className="h-4 w-4 mr-1.5" />
                      ) : (
                        <Tag className="h-4 w-4 mr-1.5" />
                      )}
                      {skill.name}
                    </span>
                    <div className="absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-100 dark:bg-zinc-900 px-2 py-1.5 text-xs font-medium text-zinc-900 dark:text-white opacity-0 shadow-lg transition-opacity duration-200 peer-hover:opacity-100 pointer-events-none">
                      {skill.isVerified
                        ? `Verified Skill - Score: ${skill.score}%`
                        : "Unverified skill"}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                  No skills added yet. Click "Edit Profile" to add your skills.
                </p>
              )}
            </div>
            {displaySkills.length > 0 &&
              displaySkills.some((s) => !s.isVerified) && (
                <div className="p-4 text-center border-t border-gray-100 dark:border-zinc-800">
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mb-3">
                    You have some unverified skills. Take a skill assessment to
                    standout.
                  </p>
                  <Link
                    to="/dashboard/candidate/assessments"
                    className="inline-block"
                  >
                    <Button variant="outline" size="sm">
                      Take Quiz
                    </Button>
                  </Link>
                </div>
              )}
          </div>
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                NYSC & Education
              </h2>
            </div>
            <div className="p-6 space-y-5">
              <ProfileField
                icon={GraduationCap}
                label="NYSC Details"
                value={`${profile.nyscBatch || ""} ${
                  profile.nyscStream || ""
                }`.trim()}
              />
              <ProfileField
                icon={GraduationCap}
                label="Graduation Year"
                value={profile.graduationYear}
              />
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                Job Preferences
              </h2>
            </div>
            <div className="p-6 space-y-5">
              <ProfileField
                icon={Briefcase}
                label="Minimum Salary"
                value={
                  profile.salaryMin
                    ? `₦${profile.salaryMin.toLocaleString()}`
                    : null
                }
              />
              <ProfileField icon={MapPin} label="Work Location">
                <div className="flex flex-col space-y-2 mt-1">
                  <span
                    className={`inline-flex items-center text-sm font-medium ${
                      profile.isRemote
                        ? "text-green-700 dark:text-green-300"
                        : "text-gray-500 dark:text-zinc-400"
                    }`}
                  >
                    {profile.isRemote ? (
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4 text-gray-400 dark:text-zinc-500" />
                    )}{" "}
                    Remote
                  </span>
                  <span
                    className={`inline-flex items-center text-sm font-medium ${
                      profile.isOpenToReloc
                        ? "text-green-700 dark:text-green-300"
                        : "text-gray-500 dark:text-zinc-400"
                    }`}
                  >
                    {profile.isOpenToReloc ? (
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4 text-gray-400 dark:text-zinc-500" />
                    )}{" "}
                    Relocation
                  </span>
                </div>
              </ProfileField>
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                Documents
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {profile.cvFileKey ? (
                <DocumentLink
                  fileKey={profile.cvFileKey}
                  fileName="View Curriculum Vitae (CV)"
                />
              ) : (
                <p className="text-sm text-gray-400 dark:text-zinc-500 flex items-center">
                  <FileText className="h-4 w-4 mr-2" /> CV not yet uploaded.
                </p>
              )}
              {profile.nyscFileKey ? (
                <DocumentLink
                  fileKey={profile.nyscFileKey}
                  fileName="View NYSC Call-up Letter"
                />
              ) : (
                <p className="text-sm text-gray-400 dark:text-zinc-500 flex items-center">
                  <FileText className="h-4 w-4 mr-2" /> NYSC document not
                  uploaded.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfilePage;
