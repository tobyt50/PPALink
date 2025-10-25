import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import {
  Award,
  Briefcase,
  GraduationCap,
  Loader2,
  User,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import DocumentLink from "../../components/ui/DocumentLink";
import useFetch from "../../hooks/useFetch";
import type { CandidateProfile } from "../../types/candidate";
import { Avatar } from "../../components/ui/Avatar";

interface CandidatePreviewPanelProps {
  candidateId: string | null;
  applicationId: string | null;
  onClose: () => void;
}

const VerifiedSkillsPreview = ({ profile }: { profile: CandidateProfile }) => {
  const verifiedSkills = useMemo(() => {
    const passedAttempts =
      profile.quizAttempts?.filter((a) => a.passed && a.skillId) || [];
    const skillMap = new Map<number, { name: string; score: number }>();
    passedAttempts.forEach((attempt) => {
      const skill = profile.skills?.find(
        (s) => s.skill.id === attempt.skillId
      )?.skill;
      if (skill) {
        if (
          !skillMap.has(skill.id) ||
          (skillMap.get(skill.id)?.score ?? 0) < attempt.score
        ) {
          skillMap.set(skill.id, { name: skill.name, score: attempt.score });
        }
      }
    });
    return Array.from(skillMap.values());
  }, [profile.quizAttempts, profile.skills]);

  if (verifiedSkills.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-800 dark:text-zinc-200 mb-2">
        Verified Skills
      </h3>
      <div className="flex flex-wrap gap-2">
        {verifiedSkills.map((skill) => (
          <div
            key={skill.name}
            className="flex items-center rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 px-3 py-1 text-sm font-semibold"
          >
            <Award className="h-4 w-4 mr-1.5" />
            {skill.name} (Score: {skill.score}%)
          </div>
        ))}
      </div>
    </div>
  );
};

export const CandidatePreviewPanel = ({
  candidateId,
  applicationId,
  onClose,
}: CandidatePreviewPanelProps) => {
  const {
    data: profile,
    isLoading,
    error,
  } = useFetch<CandidateProfile>(
    candidateId ? `/candidates/${candidateId}/profile` : null
  );

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {candidateId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed top-14 bottom-0 left-0 right-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-full max-w-lg bg-white dark:bg-zinc-900 z-50 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center flex-shrink-0">
              <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-zinc-100">
                <User className="mr-2 h-5 w-5" />
                Candidate Preview
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X className="text-gray-700 dark:text-zinc-300" />
              </button>
            </div>
            <div className="flex-grow p-6 space-y-6 overflow-y-auto text-gray-900 dark:text-zinc-100">
              {isLoading && (
                <div className="flex justify-center pt-20">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-zinc-400" />
                </div>
              )}
              {error && (
                <div className="text-center text-red-600 dark:text-red-400">
                  Failed to load profile.
                </div>
              )}
              {profile && (
                <div className="space-y-8">
                  <div className="flex items-center">
                    <Avatar candidate={profile} size="xl" />
                    <div className="ml-4">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                        {profile.firstName} {profile.lastName}
                      </h1>
                      <p className="text-sm text-gray-600 dark:text-zinc-400">
                        {profile.user?.email}
                      </p>
                    </div>
                  </div>

                  {/* --- THIS IS THE FIX: Added the VerifiedSkillsPreview component --- */}
                  <VerifiedSkillsPreview profile={profile} />

                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-zinc-200 mb-2">
                      Professional Summary
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap">
                      {profile.summary || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-zinc-200 mb-2">
                      Documents
                    </h3>
                    <div className="space-y-2">
                      {profile.cvFileKey && (
                        <DocumentLink
                          fileKey={profile.cvFileKey}
                          fileName="View CV"
                        />
                      )}
                      {profile.nyscFileKey && (
                        <DocumentLink
                          fileKey={profile.nyscFileKey}
                          fileName="View NYSC Document"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-zinc-200 mb-2 flex items-center">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Work Experience
                    </h3>
                    <div className="space-y-4">
                      {profile.workExperiences?.map((exp) => (
                        <div key={exp.id} className="text-sm">
                          <p className="font-semibold text-gray-900 dark:text-zinc-100">
                            {exp.title} at {exp.company}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-zinc-400">
                            {new Date(exp.startDate).getFullYear()} -{" "}
                            {exp.isCurrent
                              ? "Present"
                              : exp.endDate &&
                                new Date(exp.endDate).getFullYear()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-zinc-200 mb-2 flex items-center">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Education
                    </h3>
                    <div className="space-y-4">
                      {profile.education?.map((edu) => (
                        <div key={edu.id} className="text-sm">
                          <p className="font-semibold text-gray-900 dark:text-zinc-100">
                            {edu.degree} in {edu.field}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-zinc-400">
                            {edu.institution}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 flex justify-end space-x-2 flex-shrink-0">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {applicationId && (
                <Link to={`/dashboard/agency/applications/${applicationId}`}>
                  <Button>View Full Application</Button>
                </Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};