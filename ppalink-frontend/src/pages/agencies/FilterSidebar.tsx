import { ChevronDown } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { DropdownTrigger } from '../../components/ui/DropdownTrigger';
import { Label } from '../../components/ui/Label';
import { SimpleDropdown, SimpleDropdownItem } from '../../components/ui/SimpleDropdown';
import { useDataStore } from '../../context/DataStore';
import { NYSC_BATCHES } from '../../utils/constants';

export type CandidateFilterValues = {
  stateId: number | null;
  nyscBatch: string | null;
  skills: string | null;
  isRemote: boolean;
  isOpenToReloc: boolean;
};

interface FilterSidebarProps {
  onFilterChange: (filters: CandidateFilterValues) => void;
}

const FilterSidebar = ({ onFilterChange }: FilterSidebarProps) => {
  const { states } = useDataStore();

  const { register, handleSubmit, reset, control, watch } = useForm<CandidateFilterValues>({
    defaultValues: {
      stateId: null,
      nyscBatch: null,
      skills: null,
      isRemote: false,
      isOpenToReloc: false,
    },
  });

  const watchedStateId = watch('stateId');
  const watchedNyscBatch = watch('nyscBatch');

  const selectedStateName = states.find(s => s.id === watchedStateId)?.name || 'All States';
  const selectedBatchName = watchedNyscBatch || 'All Batches';

  const handleReset = () => {
    reset();
    handleSubmit(onFilterChange)();
  };

  return (
    <form onSubmit={handleSubmit(onFilterChange)} className="space-y-6">
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

      <div className="flex flex-col space-y-1.5">
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

      <div className="space-y-2">
        <Label htmlFor="skills">Skills (comma separated)</Label>
        <input
          id="skills"
          type="text"
          placeholder="e.g., JavaScript, Python"
          className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
          {...register('skills', { setValueAs: (v) => v || null })}
        />
      </div>

      <fieldset className="space-y-3 pt-2">
        <div className="flex items-center">
          <input id="isRemote" type="checkbox" className="h-4 w-4 rounded border-gray-300" {...register('isRemote')} />
          <Label htmlFor="isRemote" className="ml-3 text-sm font-normal">Open to Remote</Label>
        </div>
        <div className="flex items-center">
          <input id="isOpenToReloc" type="checkbox" className="h-4 w-4 rounded border-gray-300" {...register('isOpenToReloc')} />
          <Label htmlFor="isOpenToReloc" className="ml-3 text-sm font-normal">Open to Relocation</Label>
        </div>
      </fieldset>

      <div className="flex flex-col space-y-2 pt-2">
        <Button type="submit">Apply Filters</Button>
        <Button type="button" variant="outline" onClick={handleReset}>Clear Filters</Button>
      </div>
    </form>
  );
};

export default FilterSidebar;