import { Gift, Check, X, ChevronLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import type { Application } from "../../types/application";
import { format } from "date-fns";
import { Button } from "../../components/ui/Button";
import applicationService from "../../services/application.service";
import { ConfirmationModal } from "../../components/ui/Modal";
import { useSmartCurrency } from "../../hooks/useSmartCurrency";

const OfferStatusPage = ({
  application,
  refetch,
}: {
  application: Application;
  refetch: () => void;
}) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: "ACCEPTED" | "DECLINED" | null;
  }>({ isOpen: false, action: null });

  const offer = application.offers?.[0];

  const formattedSalary = useSmartCurrency(offer?.salary, application.position.currency);

  const handleResponse = async () => {
    if (!offer || !modalState.action) return;

    const responsePromise = applicationService.respondToOffer(
      offer.id,
      modalState.action
    );

    await toast.promise(responsePromise, {
      loading: "Submitting your response...",
      success: `Offer successfully ${modalState.action.toLowerCase()}!`,
      error: "Failed to submit response.",
    });

    setModalState({ isOpen: false, action: null });
    refetch();
  };

  if (!offer) {
    return (
      <div className="mx-auto max-w-2xl text-center rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-8">
        <div className="flex justify-center mb-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-100">
          Waiting for Offer Details
        </h2>
        <p className="text-gray-600 dark:text-zinc-300 mt-2">
          The agency is preparing your offer. The details will appear here once
          they are finalized.
        </p>
        <Link
          to="/dashboard/candidate/applications"
          className="mt-6 inline-block"
        >
          <Button variant="outline">Back to My Applications</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, action: null })}
        onConfirm={handleResponse}
        title={
          modalState.action === "ACCEPTED" ? "Accept Offer?" : "Decline Offer?"
        }
        description={
          modalState.action === "ACCEPTED"
            ? "You are about to accept this job offer. This is a significant commitment. Are you sure you wish to proceed?"
            : "Are you sure you want to decline this offer? This action cannot be undone."
        }
        confirmButtonText={
          modalState.action === "ACCEPTED"
            ? "Yes, Accept Offer"
            : "Yes, Decline"
        }
        isDestructive={modalState.action === "DECLINED"}
      />
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link
            to="/dashboard/candidate/applications"
            className="flex items-center text-sm font-semibold text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to My Applications
          </Link>
        </div>
        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden text-center">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
            <Gift className="mx-auto h-12 w-12 text-primary-500" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-zinc-50">
              You've Received an Offer!
            </h1>
            <p className="mt-1 text-gray-600 dark:text-zinc-300">
              Congratulations!{" "}
              <span className="font-semibold">
                {application.position.agency?.name || "The agency"}
              </span>{" "}
              has extended an offer for the position of{" "}
              <strong className="text-gray-800 dark:text-zinc-100">
                {application.position.title}
              </strong>
              .
            </p>
          </div>
          <div className="p-6 space-y-4">
            {offer.salary && (
              <p className="text-gray-800 dark:text-zinc-100">
                <strong>Salary:</strong> {formattedSalary} per
                annum
              </p>
            )}
            {offer.startDate && (
              <p className="text-gray-800 dark:text-zinc-100">
                <strong>Proposed Start Date:</strong>{" "}
                {format(new Date(offer.startDate), "MMMM d, yyyy")}
              </p>
            )}
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-white/5">
            {offer.status === "PENDING" && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-zinc-50">
                  Respond to this Offer:
                </h3>
                <div className="flex justify-center space-x-6">
                  <Button
                    variant="destructive"
                    onClick={() =>
                      setModalState({ isOpen: true, action: "DECLINED" })
                    }
                  >
                    <X className="mr-2 h-4 w-4" /> Decline
                  </Button>
                  <Button
                    onClick={() =>
                      setModalState({ isOpen: true, action: "ACCEPTED" })
                    }
                  >
                    <Check className="mr-2 h-4 w-4" /> Accept Offer
                  </Button>
                </div>
              </div>
            )}
            {offer.status === "ACCEPTED" && (
              <p className="font-bold text-green-600 dark:text-green-400">
                You have ACCEPTED this offer. Congratulations on your new role!
              </p>
            )}
            {offer.status === "DECLINED" && (
              <p className="font-bold text-red-600 dark:text-red-400">
                You have DECLINED this offer.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OfferStatusPage;