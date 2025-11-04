import { ChevronDown, SlidersHorizontal, Search, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
// Removed useEffect
import { Button } from "../../components/ui/Button";
import { AnimatePresence, motion } from "framer-motion";
import { Label } from "../../components/ui/Label";
import { Input } from "../../components/forms/Input";
import { SimpleDropdown, SimpleDropdownItem } from "../../components/ui/SimpleDropdown";
import { DropdownTrigger } from "../../components/ui/DropdownTrigger";

export interface PipelineFilterValues {
  q: string;
  skills: string;
  appliedAfter: string; // Format: YYYY-MM-DD
  appliedBefore: string; // Format: YYYY-MM-DD
  institution: string;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: PipelineFilterValues) => void;
  onClear: () => void;
  isLoading: boolean;
  institutions: string[];
}

export const PipelineFilterPanel = ({
  isOpen,
  onClose,
  onApply,
  onClear,
  isLoading,
  institutions,
}: FilterPanelProps) => {
  const { register, handleSubmit, reset, control, watch } = useForm<PipelineFilterValues>({
    defaultValues: {
      q: "",
      skills: "",
      appliedAfter: "",
      appliedBefore: "",
      institution: "",
    },
  });

  const watchedInstitution = watch('institution');
  const selectedInstitutionName = watchedInstitution || 'All Institutions';

  const handleClear = () => {
    reset({
      q: "",
      skills: "",
      appliedAfter: "",
      appliedBefore: "",
      institution: "",
    });
    onClear();
  };

  const onSubmit = (data: PipelineFilterValues) => {
    onApply(data);
    onClose();
  };

  // Removed useEffect for history/keydown/popstate

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed top-0 md:top-14 bottom-0 left-0 right-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed top-0 md:top-14 right-0 h-[calc(100vh-3.5rem)] w-full max-w-md bg-white dark:bg-zinc-900 z-50 flex flex-col"
          >
            <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
              <h2 className="text-lg font-semibold flex items-center">
                <SlidersHorizontal className="mr-2 h-5 w-5" />
                Filter & Search Pipeline
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X />
              </button>
            </div>

            <form
              id="pipeline-filter-form"
              onSubmit={handleSubmit(onSubmit)}
              className="flex-grow p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700"
            >
              <div className="relative mt-1">
  <div className="absolute inset-y-0 left-0 flex items-center pl-3 z-10">
    <Search className="h-4 w-4 text-gray-500 dark:text-gray-300" />
  </div>
  <Input
    type="search"
    placeholder="Name, skill, summary..."
    className="pl-9"
    {...register("q")}
  />
</div>

              <div>
                <Label>Skills (comma separated)</Label>
                <Input
                  type="text"
                  placeholder="e.g., Python, React"
                  className="mt-1"
                  {...register("skills")}
                />
              </div>

              <div>
                <Label>Filter by Institution</Label>
                <Controller
                    name="institution"
                    control={control}
                    render={({ field: { onChange } }) => (
                        <SimpleDropdown
                            trigger={
                                <DropdownTrigger>
                                    <span className="truncate">{selectedInstitutionName}</span>
                                    <ChevronDown className="h-4 w-4" />
                                </DropdownTrigger>
                            }
                        >
                            <SimpleDropdownItem onSelect={() => onChange('')}>
                                All Institutions
                            </SimpleDropdownItem>
                            {institutions.map((inst) => (
                                <SimpleDropdownItem key={inst} onSelect={() => onChange(inst)}>
                                    {inst}
                                </SimpleDropdownItem>
                            ))}
                        </SimpleDropdown>
                    )}
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Date Applied
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appliedAfter">From</Label>
                    <Input
                      id="appliedAfter"
                      type="date"
                      {...register("appliedAfter")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="appliedBefore">To</Label>
                    <Input
                      id="appliedBefore"
                      type="date"
                      {...register("appliedBefore")}
                    />
                  </div>
                </div>
              </div>
            </form>

            <div className="p-4 border-t bg-gray-50 dark:bg-zinc-950 flex justify-end space-x-2 flex-shrink-0">
              <Button variant="outline" onClick={handleClear}>
                Clear Filters
              </Button>
              <Button
                type="submit"
                form="pipeline-filter-form"
                isLoading={isLoading}
              >
                Apply
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};