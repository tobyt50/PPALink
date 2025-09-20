import { ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { DropdownTrigger } from '../../components/ui/DropdownTrigger';
import { Input } from '../../components/forms/Input';
import { Label } from '../../components/ui/Label';
import { SimpleDropdown, SimpleDropdownItem } from '../../components/ui/SimpleDropdown';
import { useDataStore } from '../../context/DataStore';
import type { Agency } from '../../types/agency';
import { NYSC_BATCHES } from '../../utils/constants';

// Expanded filter values to include all advanced fields
export type CandidateFilterValues = {
  stateId: number | null;
  nyscBatch: string | null;
  skills: string | null;
  isRemote: boolean;
  isOpenToReloc: boolean;
  gpaBand: string | null;
  graduationYear: number | null;
  university: string | null;
  courseOfStudy: string | null;
  degree: string | null;
};

interface FilterSidebarProps {
  onFilterChange: (filters: CandidateFilterValues) => void;
  agency: Agency | null; // Pass the agency to check their subscription
}

const gpaBands = ['First Class', 'Second Class Upper', 'Second Class Lower', 'Third Class'];

const gpaBandMap: Record<string, string> = {
  '1st': 'First Class',
  'first': 'First Class',
  '2:1': 'Second Class Upper',
  '2i': 'Second Class Upper',
  'second': 'Second Class Upper',
  '2nd': 'Second Class Upper',
  '2:2': 'Second Class Lower',
  '2ii': 'Second Class Lower',
  'third': 'Third Class',
  '3rd': 'Third Class',
};

const FilterSidebar = ({ onFilterChange, agency }: FilterSidebarProps) => {
  const { states, universities, courses, degrees } = useDataStore();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { register, handleSubmit, reset, control, watch } = useForm<CandidateFilterValues>({
    defaultValues: {
      stateId: null, nyscBatch: null, skills: null,
      isRemote: false, isOpenToReloc: false, gpaBand: null,
      graduationYear: null, university: null, courseOfStudy: null, degree: null,
    },
  });

  // Determine if the user has access to advanced features
  const currentPlanName = agency?.subscriptions?.[0]?.plan?.name || 'Free';
  const isPaid = currentPlanName !== 'Free';
  const hasAdvancedAccess = currentPlanName === 'Pro' || currentPlanName === 'Enterprise';

  const watchedStateId = watch('stateId');
  const watchedNyscBatch = watch('nyscBatch');
  const watchedGpaBand = watch('gpaBand');
  const watchedUniversity = watch('university');
  const watchedCourse = watch('courseOfStudy');
  const watchedDegree = watch('degree');

  const selectedStateName = states.find(s => s.id === watchedStateId)?.name || 'All States';
  const selectedBatchName = watchedNyscBatch || 'All Batches';
  const selectedGpaBand = watchedGpaBand || 'Any GPA';
  const selectedUniversity = watchedUniversity || 'All Universities';
  const selectedCourse = watchedCourse || 'All Courses';
  const selectedDegree = watchedDegree || 'All Degrees';

  const handleReset = () => {
    reset();
    handleSubmit(onFilterChange)();
  };

  return (
    <div className="space-y-5">
        <form onSubmit={handleSubmit(onFilterChange)} className="space-y-6">
          {/* --- Basic Filters (Always visible) --- */}
          <div className="flex flex-col space-y-1.5">
            <Label>Location State</Label>
            <Controller
              name="stateId"
              control={control}
              render={({ field: { onChange } }) => (
                <SimpleDropdown
                  trigger={
                    <DropdownTrigger>
                      <span className="truncate">{selectedStateName}</span>
                      <ChevronDown className="h-4 w-4" />
                    </DropdownTrigger>
                  }
                >
                  <SimpleDropdownItem onSelect={() => onChange(null)}>All States</SimpleDropdownItem>
                  {states.map((state) => (
                    <SimpleDropdownItem key={state.id} onSelect={() => onChange(state.id)}>
                      {state.name}
                    </SimpleDropdownItem>
                  ))}
                </SimpleDropdown>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Input
              id="skills"
              type="text"
              placeholder="e.g., JavaScript, Python"
              {...register('skills', { setValueAs: (v) => v || null })}
            />
          </div>

          {/* --- University, Course, Degree --- */}
          {isPaid ? (
            <>
              {/* Paid: Show in Basic Section */}
              <div className="flex flex-col space-y-1.5">
                <Label>University</Label>
                <Controller
                  name="university"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <SimpleDropdown
                      trigger={
                        <DropdownTrigger>
                          <span className="truncate">{selectedUniversity}</span>
                          <ChevronDown className="h-4 w-4" />
                        </DropdownTrigger>
                      }
                    >
                      <SimpleDropdownItem onSelect={() => onChange(null)}>All Universities</SimpleDropdownItem>
                      {universities.map((uni) => (
                        <SimpleDropdownItem key={uni.id} onSelect={() => onChange(uni.name)}>
                          {uni.name}
                        </SimpleDropdownItem>
                      ))}
                    </SimpleDropdown>
                  )}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label>Course of Study</Label>
                <Controller
                  name="courseOfStudy"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <SimpleDropdown
                      trigger={
                        <DropdownTrigger>
                          <span className="truncate">{selectedCourse}</span>
                          <ChevronDown className="h-4 w-4" />
                        </DropdownTrigger>
                      }
                    >
                      <SimpleDropdownItem onSelect={() => onChange(null)}>All Courses</SimpleDropdownItem>
                      {courses.map((course) => (
                        <SimpleDropdownItem key={course.id} onSelect={() => onChange(course.name)}>
                          {course.name}
                        </SimpleDropdownItem>
                      ))}
                    </SimpleDropdown>
                  )}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label>Degree</Label>
                <Controller
                  name="degree"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <SimpleDropdown
                      trigger={
                        <DropdownTrigger>
                          <span className="truncate">{selectedDegree}</span>
                          <ChevronDown className="h-4 w-4" />
                        </DropdownTrigger>
                      }
                    >
                      <SimpleDropdownItem onSelect={() => onChange(null)}>All Degrees</SimpleDropdownItem>
                      {degrees.map((deg) => (
                        <SimpleDropdownItem key={deg.id} onSelect={() => onChange(deg.name)}>
                          {deg.name}
                        </SimpleDropdownItem>
                      ))}
                    </SimpleDropdown>
                  )}
                />
              </div>
            </>
          ) : null}

          {/* --- Show Advanced Filters Toggle --- */}
          <div className="border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
              {showAdvanced ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* --- Advanced Filters Section --- */}
          {showAdvanced && (
            <div className="space-y-5 pt-4 animate-in fade-in">
              {!hasAdvancedAccess && (
                <div className="p-3 rounded-lg bg-yellow-100/60 text-yellow-900 text-xs text-center">
                  <Lock className="inline h-3.5 w-3.5 mr-1.5" />
                  <Link to="/dashboard/agency/billing" className="font-semibold underline hover:text-yellow-950">
                    Upgrade to Pro
                  </Link>{' '}
                  to unlock advanced filters.
                </div>
              )}

              {/* Free: Put University, Course, Degree in Advanced (locked) */}
              {!isPaid && (
                <>
                  <div
                    className={`flex flex-col space-y-1.5 ${!hasAdvancedAccess ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <Label>University</Label>
                    <Controller
                      name="university"
                      control={control}
                      render={({ field: { onChange } }) => (
                        <SimpleDropdown
                          trigger={
                            <DropdownTrigger>
                              <span className="truncate">{selectedUniversity}</span>
                              <ChevronDown className="h-4 w-4" />
                            </DropdownTrigger>
                          }
                        >
                          <SimpleDropdownItem onSelect={() => onChange(null)}>All Universities</SimpleDropdownItem>
                          {universities.map((uni) => (
                            <SimpleDropdownItem key={uni.id} onSelect={() => onChange(uni.name)}>
                              {uni.name}
                            </SimpleDropdownItem>
                          ))}
                        </SimpleDropdown>
                      )}
                    />
                  </div>

                  <div
                    className={`flex flex-col space-y-1.5 ${!hasAdvancedAccess ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <Label>Course of Study</Label>
                    <Controller
                      name="courseOfStudy"
                      control={control}
                      render={({ field: { onChange } }) => (
                        <SimpleDropdown
                          trigger={
                            <DropdownTrigger>
                              <span className="truncate">{selectedCourse}</span>
                              <ChevronDown className="h-4 w-4" />
                            </DropdownTrigger>
                          }
                        >
                          <SimpleDropdownItem onSelect={() => onChange(null)}>All Courses</SimpleDropdownItem>
                          {courses.map((course) => (
                            <SimpleDropdownItem key={course.id} onSelect={() => onChange(course.name)}>
                              {course.name}
                            </SimpleDropdownItem>
                          ))}
                        </SimpleDropdown>
                      )}
                    />
                  </div>

                  <div
                    className={`flex flex-col space-y-1.5 ${!hasAdvancedAccess ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <Label>Degree</Label>
                    <Controller
                      name="degree"
                      control={control}
                      render={({ field: { onChange } }) => (
                        <SimpleDropdown
                          trigger={
                            <DropdownTrigger>
                              <span className="truncate">{selectedDegree}</span>
                              <ChevronDown className="h-4 w-4" />
                            </DropdownTrigger>
                          }
                        >
                          <SimpleDropdownItem onSelect={() => onChange(null)}>All Degrees</SimpleDropdownItem>
                          {degrees.map((deg) => (
                            <SimpleDropdownItem key={deg.id} onSelect={() => onChange(deg.name)}>
                              {deg.name}
                            </SimpleDropdownItem>
                          ))}
                        </SimpleDropdown>
                      )}
                    />
                  </div>
                </>
              )}

              {/* --- NYSC Batch --- */}
              <div
                className={`flex flex-col space-y-1.5 ${!hasAdvancedAccess ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Label>NYSC Batch</Label>
                <Controller
                  name="nyscBatch"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <SimpleDropdown
                      trigger={
                        <DropdownTrigger>
                          <span className="truncate">{selectedBatchName}</span>
                          <ChevronDown className="h-4 w-4" />
                        </DropdownTrigger>
                      }
                    >
                      <SimpleDropdownItem onSelect={() => onChange(null)}>All Batches</SimpleDropdownItem>
                      {NYSC_BATCHES.map((batch) => (
                        <SimpleDropdownItem key={batch} onSelect={() => onChange(batch)}>
                          {batch}
                        </SimpleDropdownItem>
                      ))}
                    </SimpleDropdown>
                  )}
                />
              </div>

              {/* --- GPA Band --- */}
              <div
                className={`flex flex-col space-y-1.5 ${!hasAdvancedAccess ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Label>GPA Band</Label>
                <Controller
                  name="gpaBand"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <SimpleDropdown
                      trigger={
                        <DropdownTrigger>
                          <span className="truncate">{selectedGpaBand}</span>
                          <ChevronDown className="h-4 w-4" />
                        </DropdownTrigger>
                      }
                    >
                      <SimpleDropdownItem onSelect={() => onChange(null)}>Any GPA</SimpleDropdownItem>
                      {gpaBands.map((band) => (
                        <SimpleDropdownItem
                          key={band}
                          onSelect={() => {
                            const normalized = gpaBandMap[band.toLowerCase()] || band;
                            onChange(normalized);
                          }}
                        >
                          {band}
                        </SimpleDropdownItem>
                      ))}
                    </SimpleDropdown>
                  )}
                />
              </div>

              {/* --- Graduation Year --- */}
              <div
                className={`space-y-1.5 ${!hasAdvancedAccess ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  placeholder="e.g., 2024"
                  {...register('graduationYear', { setValueAs: (v) => (v ? parseInt(v, 10) : null) })}
                />
              </div>

              {/* --- Remote & Relocation --- */}
              <fieldset
                className={`space-y-3 pt-2 ${!hasAdvancedAccess ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="relative flex items-start">
                  <div className="flex h-6 items-center">
                      <input
                        id="isRemote"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                        {...register('isRemote')}
                      />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                    <Label htmlFor="isRemote" className="font-normal text-gray-700">
                      Open to Remote
                    </Label>
                  </div>
                </div>
                  <div className="relative flex items-start">
                  <div className="flex h-6 items-center">
                      <input
                        id="isOpenToReloc"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                        {...register('isOpenToReloc')}
                      />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                    <Label htmlFor="isOpenToReloc" className="font-normal text-gray-700">
                      Open to Relocation
                    </Label>
                  </div>
                </div>
              </fieldset>
            </div>
          )}

          <div className="flex flex-col space-y-3 pt-4">
              <Button
                size="lg"
                type="submit"
                className="w-full rounded-xl shadow-md bg-gradient-to-r from-primary-600 to-green-500 text-white hover:opacity-90 transition"
              >
                Apply Filters
            </Button>
            <Button 
                type="button" 
                variant="outline" 
                size="lg"
                className="w-full rounded-lg"
                onClick={handleReset}
            >
              Clear Filters
            </Button>
          </div>
        </form>
    </div>
  );
};

export default FilterSidebar;