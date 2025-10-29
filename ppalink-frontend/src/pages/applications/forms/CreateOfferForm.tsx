import { Dialog, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { Input } from "../../../components/forms/Input";
import { Button } from "../../../components/ui/Button";
import { Label } from "../../../components/ui/Label";
import { Gift, Send } from "lucide-react";
import { CurrencyInput } from "../../../components/forms/CurrencyInput";

const offerSchema = z.object({
  salary: z.number().positive("Salary must be a positive number.").optional(),
  currency: z.string().optional().nullable(),
  startDate: z.string().optional(),
}).refine(
    (data) => {
        if (data.salary && !data.currency) { return false; }
        return true;
    },
    { message: "Currency is required.", path: ["currency"] }
);

export type OfferFormValues = z.infer<typeof offerSchema>;

interface CreateOfferFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OfferFormValues) => Promise<void>;
}

export const CreateOfferFormModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateOfferFormProps) => {
  const methods = useForm<OfferFormValues>({ resolver: zodResolver(offerSchema) });
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

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
          <div className="fixed inset-0 bg-gray-900/25 dark:bg-black/70 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 text-left align-middle shadow-2xl dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-black ring-opacity-5 transition-all">
                <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center">
                  <Gift className="h-5 w-5 mr-3 text-primary-600 dark:text-primary-400" />
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900 dark:text-zinc-50"
                  >
                    Extend Job Offer
                  </Dialog.Title>
                </div>
                <FormProvider {...methods}>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-6 space-y-4"
                  >
                    <p className="text-sm text-gray-600 dark:text-zinc-300">
                      Enter the details of the job offer. The candidate will be
                      notified and can accept or decline.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <CurrencyInput
                            label="Annual Salary"
                            amountFieldName="salary"
                            currencyFieldName="currency"
                        />
                         {errors.currency && (
                            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                {errors.currency.message}
                            </p>
                         )}
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <Label htmlFor="startDate">Proposed Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          {...methods.register("startDate")}
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3 pt-5 border-t border-gray-100 dark:border-zinc-800">
                      <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button type="submit" isLoading={isSubmitting}>
                        <Send className="mr-2 h-4 w-4" />
                        Send Offer
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};