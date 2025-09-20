import { Dialog, Transition } from '@headlessui/react';
import { Briefcase, ChevronDown, Loader2, PlusCircle } from 'lucide-react';
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

  const handleSubmit = async () => {
    if (selectedPositionId) {
      await onSubmit(selectedPositionId);
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
          {/* Updated backdrop for a more polished feel */}
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" />
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
              {/* Replicated card styling for the Dialog Panel */}
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
                {/* Modal Header */}
                <div className="p-5 border-b border-gray-100 flex items-center">
                   <Briefcase className="h-5 w-5 mr-3 text-primary-600" />
                   <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                    Add to Job Pipeline
                  </Dialog.Title>
                </div>
                
                {/* Modal Body */}
                <div className="p-6">
                  {isLoadingJobs ? (
                     <div className="flex justify-center items-center h-28">
                        <Loader2 className="h-7 w-7 animate-spin text-primary-500" />
                     </div>
                  ) : !openJobs || openJobs.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-sm text-gray-600">
                        You have no open job postings.
                        </p>
                        {/* Optionally, add a link to create a job */}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label htmlFor="position" className="text-sm font-medium text-gray-700">Select an open position</label>
                      <SimpleDropdown
                        trigger={
                          // Polished dropdown trigger
                          <DropdownTrigger className="w-full rounded-lg border-gray-300 bg-gray-50 text-gray-800 hover:bg-gray-100">
                            <span className="truncate">{selectedJobTitle}</span>
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          </DropdownTrigger>
                        }
                      >
                        {openJobs.map(job => (
                          // Polished dropdown item with hover effect
                          <SimpleDropdownItem 
                            key={job.id} 
                            onSelect={() => setSelectedPositionId(job.id)}
                            className="group rounded-xl transition-all hover:bg-gradient-to-r hover:from-primary-50 hover:to-green-50 text-gray-700 group-hover:text-primary-600"
                          >
                            {job.title}
                          </SimpleDropdownItem>
                        ))}
                      </SimpleDropdown>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-3 p-4 bg-gray-50 border-t border-gray-100">
                  <Button variant="outline" size="sm" className="rounded-lg" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!selectedPositionId || isLoadingJobs}
                    // Replicated primary button style
                    className="rounded-lg shadow-md bg-gradient-to-r from-primary-600 to-green-500 text-white hover:opacity-90 transition disabled:opacity-50"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
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