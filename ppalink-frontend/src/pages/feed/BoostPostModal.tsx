import { Dialog, Transition, RadioGroup } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import boostService from "../../services/boost.service";
import type { FeedItem, BoostTier } from "../../types/feed";
import { Zap, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import useFetch from "../../hooks/useFetch";

interface BoostPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedItem: FeedItem | null;
}

export const BoostPostModal = ({
  isOpen,
  onClose,
  feedItem,
}: BoostPostModalProps) => {
  const { data: tiers, isLoading: isLoadingTiers } = useFetch<BoostTier[]>(
    "/boosts/boost-tiers"
  );
  const [selectedTierName, setSelectedTierName] = useState<
    "STANDARD" | "PREMIUM"
  >("STANDARD");
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (tiers && tiers.length > 0 && !selectedTierName) {
      setSelectedTierName(tiers[0].name as "STANDARD" | "PREMIUM");
    }
  }, [tiers, selectedTierName]);

  const handleBoost = async () => {
    if (!feedItem) return;
    setIsRedirecting(true);
    try {
      const { url } = await boostService.createBoostCheckoutSession(
        feedItem.id,
        selectedTierName
      );
      window.location.href = url;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to start boost process."
      );
      setIsRedirecting(false);
    }
  };

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
                  <Zap className="mr-3 h-5 w-5 text-yellow-500" />
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900 dark:text-zinc-50"
                  >
                    Boost Your Post
                  </Dialog.Title>
                </div>
                <div className="p-6">
                  <p className="text-sm mt-2 text-gray-600 dark:text-zinc-300">
                    Increase the visibility of your post to reach more
                    candidates.
                  </p>
                  {isLoadingTiers ? (
                    <div className="flex justify-center items-center h-48">
                      <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
                    </div>
                  ) : (
                    <RadioGroup
                      value={selectedTierName}
                      onChange={setSelectedTierName}
                      className="mt-4 space-y-3"
                    >
                      {tiers?.map((tier) => (
                        <RadioGroup.Option
                          key={tier.name}
                          value={tier.name}
                          className={({ checked }) =>
                            `${
                              checked
                                ? "bg-primary-50 dark:bg-primary-950/60 border-primary-500 ring-0.5 ring-primary-500"
                                : "border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                            } relative flex cursor-pointer rounded-xl border p-4 focus:outline-none transition-all`
                          }
                        >
                          {({ checked }) => (
                            <div className="flex w-full items-center justify-between">
                              <div className="flex items-center">
                                <div className="text-sm">
                                  <RadioGroup.Label
                                    as="p"
                                    className={`font-semibold ${
                                      checked
                                        ? "text-primary-700 dark:text-primary-300"
                                        : "text-gray-900 dark:text-zinc-50"
                                    }`}
                                  >
                                    {tier.name}
                                  </RadioGroup.Label>
                                  <RadioGroup.Description
                                    as="span"
                                    className={`inline text-xs ${
                                      checked
                                        ? "text-primary-600 dark:text-primary-400"
                                        : "text-gray-500 dark:text-zinc-400"
                                    }`}
                                  >
                                    {tier.description}
                                  </RadioGroup.Description>
                                </div>
                              </div>
                              {checked && (
                                <div className="shrink-0 text-primary-600 dark:text-primary-400">
                                  <CheckCircle className="h-5 w-5" />
                                </div>
                              )}
                              <p
                                className={`text-xl font-bold ${
                                  checked
                                    ? "text-primary-600 dark:text-primary-400"
                                    : "text-gray-800 dark:text-zinc-100"
                                }`}
                              >
                                ₦{tier.price.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </RadioGroup.Option>
                      ))}
                    </RadioGroup>
                  )}
                </div>
                <div className="mt-6 flex justify-end space-x-3 p-5 border-t border-gray-100 dark:border-zinc-800">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBoost}
                    isLoading={isRedirecting}
                    disabled={isLoadingTiers || !tiers}
                  >
                    Proceed to Payment <ArrowRight className="ml-2 h-4 w-4" />
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
