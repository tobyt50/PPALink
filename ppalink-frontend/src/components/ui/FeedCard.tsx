import { ArrowUpRight, Zap } from "lucide-react";
import { useMemo } from "react";
import type { FeedItem } from "../../types/feed";
import { Button } from "./Button";
import { useAuthStore } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Avatar } from "./Avatar";

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
      return { name: "PPALink Support", link: "#", isClickable: false, userObject: null };
    if (item.agency) {
      return {
        name: item.agency.name,
        link: `/agencies/${item.agency.id}/profile`,
        isClickable: true,
        userObject: { role: "AGENCY", ownedAgencies: [item.agency] } as any,
      };
    }
    if (item.user?.candidateProfile) {
      const name = `${item.user.candidateProfile.firstName} ${item.user.candidateProfile.lastName}`;
      const isClickable = loggedInUser?.role === "AGENCY";
      return {
        name,
        link: isClickable
          ? `/dashboard/agency/candidates/${item.user.candidateProfile.id}/profile`
          : "#",
        isClickable,
        userObject: item.user,
      };
    }
    return { name: "PPALink Support", link: "#", isClickable: false, userObject: null };
  }, [item, loggedInUser]);

  if (!item) return null;

  const style = categoryStyles[item.category] || categoryStyles.CAREER_INSIGHT;

  const isBoosted = useMemo(
    () =>
      item.boosts?.some(
        (b) => b.status === "ACTIVE" && new Date(b.endDate) > new Date()
      ),
    [item.boosts]
  );

  const AuthorComponent = author.isClickable ? Link : "div";

  return (
    <div className="group rounded-xl bg-white dark:bg-zinc-900 p-4 shadow-sm ring-1 ring-gray-100 dark:ring-white/10 transition-all hover:shadow-md hover:ring-primary-200 dark:hover:ring-primary-700/40 hover:bg-gradient-to-r hover:from-primary-50/40 dark:hover:from-primary-950/40 hover:to-green-50/40 dark:hover:to-green-950/40">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar user={author.userObject} size="md" />
          <div>
            <AuthorComponent
              to={author.link}
              className={`block font-semibold text-sm text-gray-900 dark:text-zinc-100 ${
                author.isClickable ? "hover:underline" : ""
              }`}
            >
              {author.name}
            </AuthorComponent>
            <span className={`text-xs font-medium flex items-center ${style.color}`}>
              {style.icon} <span className="ml-1">{style.label}</span>
            </span>
          </div>
        </div>

        {isBoosted && (
          <div className="flex items-center text-[11px] font-semibold text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/40 px-2 py-0.5 rounded-full">
            <Zap className="h-3 w-3 mr-1" />
            Promoted
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-3">
        <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-50 leading-snug">
          {item.title}
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-zinc-300 line-clamp-3">
          {item.content}
        </p>
      </div>

      {/* CTA */}
      {item.link && (
        <div className="mt-3">
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="text-xs">
              {item.ctaText || "Learn More"}
              <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </a>
        </div>
      )}
    </div>
  );
};
