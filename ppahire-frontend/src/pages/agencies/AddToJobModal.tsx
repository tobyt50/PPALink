import { Dialog, Transition } from '@headlessui/react';
import { Briefcase, ChevronDown, Loader2 } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { DropdownTrigger } from '../../components/ui/DropdownTrigger';
import { SimpleDropdown, SimpleDropdownItem } from '../../components/ui/SimpleDropdown';
import useFetch from '../../hooks/useFetch';
import type { Agency } from '../../types/agency';
import type { Position } from '../../types/job';

interface AddToJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (positionId: string) => Promise<void>;
}

export const AddToJobModal = ({ isOpen, onClose, onSubmit }: AddToJobModalProps) => {
  const [selectedPositionId, setSelectedPositionId] = useState<string>('');
  
  const { data: agency } = useFetch<Agency>('/agencies/me');
  const agencyId = agency?.id;

  const { data: jobs, isLoading: isLoadingJobs } = useFetch<Position[]>(
    agencyId ? `/agencies/${agencyId}/jobs` : null
  );

  const handleSubmit = () => {
    if (selectedPositionId) {
      onSubmit(selectedPositionId);
    }
  };
  
  const openJobs = jobs?.filter(job => job.status === 'OPEN');
  
  const selectedJobTitle = useMemo(() => {
    return openJobs?.find(job => job.id === selectedPositionId)?.title || 'Choose a job...';
  }, [selectedPositionId, openJobs]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/25 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-primary-600" />
                  Add Candidate to Job Pipeline
                </Dialog.Title>
                
                <div className="mt-4">
                  {isLoadingJobs ? (
                     <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                     </div>
                  ) : !openJobs || openJobs.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      You have no open job postings. Please create one first.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <label htmlFor="position" className="text-sm font-medium text-gray-700">Select an open position:</label>
                      <SimpleDropdown
                        trigger={
                          <DropdownTrigger>
                            <span className="truncate">{selectedJobTitle}</span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </DropdownTrigger>
                        }
                      >
                        {openJobs.map(job => (
                          <SimpleDropdownItem key={job.id} onSelect={() => setSelectedPositionId(job.id)}>
                            {job.title}
                          </SimpleDropdownItem>
                        ))}
                      </SimpleDropdown>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedPositionId || isLoadingJobs}
                    className="justify-center"
                  >
                    Add to Pipeline
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};