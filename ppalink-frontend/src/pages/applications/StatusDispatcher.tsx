import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import type { Application } from "../../types/application";
import InterviewStatusPage from "../candidates/InterviewStatus";
import OfferStatusPage from "../candidates/OfferStatus";
import GenericStatusPage from "../candidates/GenericStatus";

const StatusDispatcher = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const {
    data: application,
    isLoading,
    error,
    refetch,
  } = useFetch<Application>(
    applicationId ? `/applications/${applicationId}/candidate` : null
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }
  if (error || !application) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-500/30 p-8 text-center text-red-800 dark:text-red-400 shadow-md dark:shadow-none">
        Could not load application status.
      </div>
    );
  }

  switch (application.status) {
    case "INTERVIEW":
      return <InterviewStatusPage application={application} />;
    case "OFFER":
      return <OfferStatusPage application={application} refetch={refetch} />;
    case "APPLIED":
    case "REVIEWING":
    case "REJECTED":
    default:
      return <GenericStatusPage application={application} />;
  }
};

export default StatusDispatcher;