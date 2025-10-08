import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  ChevronLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Application, InterviewMode } from "../../types/application";
import { format, addHours } from "date-fns";
import { Button } from "../../components/ui/Button";
import * as ics from "ics";

const ModeIcon = ({ mode }: { mode: InterviewMode }) => {
  if (mode === "REMOTE")
    return <Video className="h-5 w-5 mr-3 text-primary-600 dark:text-primary-400 flex-shrink-0" />;
  if (mode === "INPERSON")
    return <MapPin className="h-5 w-5 mr-3 text-primary-600 dark:text-primary-400 flex-shrink-0" />;
  if (mode === "PHONE")
    return <Phone className="h-5 w-5 mr-3 text-primary-600 dark:text-primary-400 flex-shrink-0" />;
  return null;
};

const InterviewStatusPage = ({ application }: { application: Application }) => {
  const interview = application.interviews?.[0];

  const formattedDate = interview
    ? `${format(
        new Date(interview.scheduledAt),
        "eeee, MMMM d, yyyy"
      )} at ${format(new Date(interview.scheduledAt), "h:mm a")}`
    : "";

  const handleAddToCalendar = () => {
    if (!interview || !application) return;

    const event = {
      title: `Interview for ${application.position.title}`,
      description:
        interview.details ||
        `Interview with ${
          application.position.agency?.name || "the hiring team"
        }.`,
      location: interview.location || "Details to be provided",
      start: new Date(interview.scheduledAt).getTime(),
      end: addHours(new Date(interview.scheduledAt), 1).getTime(),
    };

    const { error, value } = ics.createEvent(event);

    if (error) {
      console.error(error);
      alert("Failed to create calendar event.");
      return;
    }

    if (value) {
      const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "interview.ics");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
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

      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
        <div className="p-6 text-center border-b border-gray-100 dark:border-zinc-800">
          <Calendar className="mx-auto h-12 w-12 text-primary-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-zinc-50">
            Interview Scheduled!
          </h1>
          <p className="mt-1 text-gray-600 dark:text-zinc-300">
            You have an upcoming interview for the position of{" "}
            <strong className="text-gray-800 dark:text-zinc-100">
              {application.position.title}
            </strong>
            .
          </p>
        </div>

        {!interview ? (
          <div className="p-6 text-center text-gray-500 dark:text-zinc-400">
            Waiting for details...
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="flex items-start">
              <Clock className="h-5 w-5 mr-3 text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-800 dark:text-zinc-100">
                  Date & Time
                </p>
                <p className="text-gray-700 dark:text-zinc-300">
                  {formattedDate}
                </p>
              </div>
            </div>
            <div className="flex items-start">
  <ModeIcon mode={interview.mode} />
  <div>
    <p className="font-semibold text-gray-800 dark:text-zinc-100">
      {interview.mode.charAt(0) +
        interview.mode.slice(1).toLowerCase()}{" "}
      Interview
    </p>
    {interview.location ? (
      interview.mode === "REMOTE" && interview.location.startsWith("http") ? (
        <a
          href={interview.location}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline break-words"
        >
          {interview.location}
        </a>
      ) : (
        <p className="text-gray-700 dark:text-zinc-300 break-words">
          {interview.location}
        </p>
      )
    ) : (
      <p className="text-gray-700 dark:text-zinc-300">
        Details to be provided.
      </p>
    )}
  </div>
</div>

            {interview.details && (
              <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                <p className="font-semibold text-sm text-gray-800 dark:text-zinc-100">
                  Additional Details from the Recruiter:
                </p>
                <p className="text-gray-700 dark:text-zinc-300 mt-2 text-sm whitespace-pre-wrap">
                  {interview.details}
                </p>
              </div>
            )}
            <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 text-center">
              <Button onClick={handleAddToCalendar}>
                <Calendar className="mr-2 h-4 w-4" />
                Add to Calendar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewStatusPage;