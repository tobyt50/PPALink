import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';
import { useDataStore } from '../../context/DataStore';
import { NYSC_BATCHES } from '../../utils/constants';

// 1. Define the shape of our filter data
export type CandidateFilterValues = {
  stateId: number | null;
  nyscBatch: string | null;
  skills: string | null;
  isRemote: boolean;
  isOpenToReloc: boolean;
};

// 2. Define the component's props, including an onSubmit handler
interface FilterSidebarProps {
  onFilterChange: (filters: CandidateFilterValues) => void;
}

const FilterSidebar = ({ onFilterChange }: FilterSidebarProps) => {
  const { states } = useDataStore();

  // 3. Initialize react-hook-form
  const { register, handleSubmit, reset } = useForm<CandidateFilterValues>({
    defaultValues: {
      isRemote: false,
      isOpenToReloc: false,
    },
  });

  const handleReset = () => {
    reset(); // Reset the form to default values
    handleSubmit(onFilterChange)(); // Immediately apply the reset filters
  };

  return (
    // 4. Connect the form's onSubmit to our handler
    <form onSubmit={handleSubmit(onFilterChange)} className="space-y-6">
      {/* Location Filter */}
      <div className="space-y-2">
        <Label htmlFor="stateId">Location State</Label>
        <select
          id="stateId"
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
          {...register('stateId', { setValueAs: (v) => (v ? parseInt(v, 10) : null) })}
        >
          <option value="">All States</option>
          {states.map((state) => (
            <option key={state.id} value={state.id}>{state.name}</option>
          ))}
        </select>
      </div>

      {/* NYSC Batch Filter */}
      <div className="space-y-2">
        <Label htmlFor="nyscBatch">NYSC Batch</Label>
        <select
          id="nyscBatch"
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
          {...register('nyscBatch', { setValueAs: (v) => v || null })}
        >
          <option value="">All Batches</option>
          {NYSC_BATCHES.map((batch) => (
            <option key={batch} value={batch}>{batch}</option>
          ))}
        </select>
      </div>

      {/* Skills Filter */}
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

      {/* Boolean Filters */}
      <fieldset className="space-y-3 pt-2">
        <div className="flex items-center">
          <input
            id="isRemote"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300"
            {...register('isRemote')}
          />
          <Label htmlFor="isRemote" className="ml-3 text-sm font-normal">
            Open to Remote
          </Label>
        </div>
        <div className="flex items-center">
          <input
            id="isOpenToReloc"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300"
            {...register('isOpenToReloc')}
          />
          <Label htmlFor="isOpenToReloc" className="ml-3 text-sm font-normal">
            Open to Relocation
          </Label>
        </div>
      </fieldset>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2 pt-2">
        <Button type="submit">Apply Filters</Button>
        <Button type="button" variant="outline" onClick={handleReset}>Clear Filters</Button>
      </div>
    </form>
  );
};

export default FilterSidebar;