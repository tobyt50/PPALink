import { ArrowLeft, ArrowRight, XCircle, ChevronDown } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/forms/Input";
import { Label } from "../../../components/ui/Label";
import { DropdownTrigger } from "../../../components/ui/DropdownTrigger";
import { SimpleDropdown, SimpleDropdownItem } from "../../../components/ui/SimpleDropdown";
import useFetch from "../../../hooks/useFetch";
import { useDataStore } from "../../../context/DataStore";
import type { CandidateProfile } from "../../../types/candidate";
import { OnboardingProgressBar } from "./SummaryStep";
import candidateService from "../../../services/candidate.service";
import { motion } from "framer-motion";

type OnboardingContext = { profileType?: 'NYSC' | 'PROFESSIONAL' };

const SkillsStep = () => {
  const navigate = useNavigate();
  const { data: profile } = useFetch<CandidateProfile>("/candidates/me");
  const { profileType } = useOutletContext<OnboardingContext>();
  const { skills: allSkills } = useDataStore();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<{ skills: string[] }>({
    defaultValues: { skills: [] },
  });
  const skills = watch("skills") || [];

  const [skillSearch, setSkillSearch] = useState("");

  useEffect(() => {
    if (profile?.skills) {
      setValue(
        "skills",
        profile.skills.map((s) => s.skill.name)
      );
    }
  }, [profile, setValue]);

  const filteredSkills = useMemo(() => {
    return allSkills.filter(skill => 
      skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !skills.includes(skill.name)
    );
  }, [allSkills, skillSearch, skills]);

  const removeSkill = (index: number) => {
    setValue(
      "skills",
      skills.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: { skills: string[] }) => {
    try {
      await candidateService.setSkills(data.skills);
      toast.success("Skills saved successfully!");
      navigate("/onboarding/candidate/cv-upload");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save skills.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-8 w-full"
    >
      <OnboardingProgressBar step={4} totalSteps={5} />
      <div className="text-center mb-6">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
          Your Top Skills
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-300">
          Showcase your expertise. Add at least 5 key skills.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label>Skills</Label>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Select your key skills from the list. This helps recruiters find you.</p>
          <SimpleDropdown
            trigger={
              <DropdownTrigger>
                <span>Add Skills</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownTrigger>
            }
            isIndustryDropdown
          >
            <div className="p-2 border-b border-gray-100 dark:border-zinc-800">
              <Input
                type="text"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Search skills..."
                className="w-full text-sm"
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredSkills.map(skill => (
                <SimpleDropdownItem key={skill.id} onSelect={() => setValue("skills", [...skills, skill.name])}>
                  {skill.name}
                </SimpleDropdownItem>
              ))}
              {filteredSkills.length === 0 && <p className="p-2 text-xs text-gray-500">No matching skills found.</p>}
            </div>
          </SimpleDropdown>

          <div className="flex flex-wrap gap-2 pt-2 min-h-[5rem] bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-3 border dark:border-zinc-800">
            {skills.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 rounded-full bg-primary-100 dark:bg-primary-950/60 px-3 py-1 text-sm font-medium text-primary-700 dark:text-primary-400"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  <XCircle size={16} />
                </button>
              </motion.div>
            ))}
            {skills.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-zinc-500 p-4">
                Your added skills will appear here.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (profileType === 'PROFESSIONAL') {
                navigate('/onboarding/candidate/work-experience');
              } else {
                navigate('/onboarding/candidate/education');
              }
            }}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save & Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default SkillsStep;