import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Fragment } from 'react';
import { Button } from './Button';

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmButtonText?: string;
  isDestructive?: boolean;
};

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmButtonText = 'Confirm',
  isDestructive = true,
}: ConfirmationModalProps) => {
  const Icon = isDestructive ? AlertTriangle : CheckCircle;
  const iconColor = isDestructive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
  const iconBgColor = isDestructive ? 'bg-red-100 dark:bg-red-950/60' : 'bg-green-100 dark:bg-green-950/60';

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Polished Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0" 
        >
          <div className="fixed inset-0 bg-gray-900 dark:bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-zinc-600">
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
              {/* Polished Dialog Panel */}
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 text-left align-middle shadow-2xl dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-black ring-opacity-5 transition-all">
                {/* Modal Header */}
                <div className="p-5 flex items-center gap-4">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${iconBgColor}`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
                  </div>
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-zinc-50">
                    {title}
                  </Dialog.Title>
                </div>
                
                {/* Modal Body */}
                <div className="px-6 pb-6">
                    <p className="text-sm text-gray-600 dark:text-zinc-300">{description}</p>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-3 p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-zinc-800">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={onConfirm}
                    // Polished Destructive/Primary Button Styles
                    className={`rounded-lg shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10 transition-opacity ${
                      isDestructive
                        ? 'bg-red-600 dark:bg-red-500 text-white dark:text-zinc-100 hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50'
                        : 'bg-gradient-to-r from-primary-600 dark:from-primary-400 to-green-500 dark:to-green-400 text-white dark:text-zinc-100 hover:opacity-90 disabled:opacity-50'
                    }`}
                  >
                    {confirmButtonText}
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

