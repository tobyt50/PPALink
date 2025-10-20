import { ArrowUpRight, Zap } from "lucide-react";
import { useMemo } from "react";
import type { FeedItem } from "../../types/feed";
import { Button } from "./Button";
import { useAuthStore } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Avatar } from "./Avatar"; // 1. Import the Avatar component

const categoryStyles = {
  LEARN_GROW: {
    icon: "🎓",
    label: "Learn & Grow",
    color: "text-blue-500 dark:text-blue-400",
  },
  FROM_EMPLOYERS: {
    icon: "💼",
    label: "From Employers",
    color: "text-indigo-500 dark:text-indigo-400",
  },
  CAREER_INSIGHT: {
    icon: "🧠",
    label: "Career Insight",
    color: "text-purple-500 dark:text-purple-400",
  },
  RECOMMENDATION: {
    icon: "⭐",
    label: "Recommended",
    color: "text-yellow-500 dark:text-yellow-400",
  },
  SUCCESS_STORY: {
    icon: "🌟",
    label: "Success Story",
    color: "text-pink-500 dark:text-pink-400",
  },
  SPONSORED_POST: {
    icon: "💲",
    label: "Sponsored",
    color: "text-green-500 dark:text-green-400",
  },
};

export const FeedCard = ({ item }: { item: FeedItem | undefined }) => {
  const loggedInUser = useAuthStore((state) => state.user);

  const author = useMemo(() => {
    if (!item)
      return {
        name: "PPALink Support",
        link: "#",
        isClickable: false,
        userObject: null,
      };
    if (item.agency) {
      const agencyUser = {
        role: "AGENCY",
        ownedAgencies: [item.agency],
      } as any;
      return {
        name: item.agency.name,
        link: `/agencies/${item.agency.id}/profile`,
        isClickable: true,
        userObject: agencyUser,
      };
    }
    if (item.user && item.user.candidateProfile) {
      const name = `${item.user.candidateProfile.firstName} ${item.user.candidateProfile.lastName}`;
      const isClickable = loggedInUser?.role === "AGENCY";
      return {
        name,
        link:
          isClickable && item.user.candidateProfile.id
            ? `/dashboard/agency/candidates/${item.user.candidateProfile.id}/profile`
            : "#",
        isClickable,
        userObject: item.user,
      };
    }
    return {
      name: "PPALink Support",
      link: "#",
      isClickable: false,
      userObject: null,
    };
  }, [item, loggedInUser]);

  if (!item) {
    return null;
  }

  const style = categoryStyles[item.category] || categoryStyles.CAREER_INSIGHT;
  const isBoosted = useMemo(() => {
    return (
      item.boosts &&
      item.boosts.some(
        (b) => b.status === "ACTIVE" && new Date(b.endDate) > new Date()
      )
    );
  }, [item.boosts]);
  const AuthorComponent = author.isClickable ? Link : "div";

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Avatar user={author.userObject} size="md" />
            <div className="ml-3">
              <AuthorComponent
                to={author.link}
                className={
                  author.isClickable
                    ? "font-semibold text-gray-800 dark:text-zinc-100 hover:underline"
                    : "font-semibold text-gray-800 dark:text-zinc-100"
                }
              >
                {author.name}
              </AuthorComponent>
              <p
                className={`text-xs font-semibold flex items-center ${style.color}`}
              >
                {style.label}
              </p>
            </div>
          </div>
          {isBoosted && (
            <div className="flex items-center text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded-full">
              <Zap className="h-3 w-3 mr-1" />
              Promoted
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-50 mt-4">
          {item.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-zinc-300 mt-1">
          {item.content}
        </p>

        {item.link && (
          <div className="mt-4">
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                {item.ctaText || "Learn More"}{" "}
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
