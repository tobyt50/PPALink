// This file is the single source of truth for truly static application-level constants.
// Data that can be changed by an admin (like Industries or States) should be fetched from the API.

import {
  BarChart3,
  Briefcase,
  Calendar,
  CheckSquare,
  CreditCard,
  FileQuestion,
  Heart,
  Home,
  Package,
  Rss,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import type { NavItem } from "../components/layout/Sidebar";
import type { FeedCategory } from "../types/feed";

export const NYSC_BATCHES = ["Batch A", "Batch B", "Batch C"];
export const NYSC_STREAMS = ["Stream 1", "Stream 2"];

export const CANDIDATE_NAV_ITEMS: NavItem[] = [
  { to: "/dashboard/candidate", icon: Home, text: "Home", end: true },
  {
    to: "/feed",
    icon: Rss,
    text: "Feed",
  },
  { to: "/dashboard/candidate/jobs/browse", icon: Search, text: "Jobs" },
  {
    to: "/dashboard/candidate/applications",
    icon: Package,
    text: "Applications",
  },
  {
    to: "/dashboard/candidate/assessments",
    icon: FileQuestion,
    text: "Quiz",
  },
];

export const ESSENTIAL_CANDIDATE_NAV_ITEMS: NavItem[] = [...CANDIDATE_NAV_ITEMS];

export const AGENCY_NAV_ITEMS: NavItem[] = [
  { to: "/dashboard/agency", icon: Home, text: "Home", end: true },
  { to: "/dashboard/agency/jobs", icon: Briefcase, text: "My Jobs" },
  {
    to: "/dashboard/agency/candidates/browse",
    icon: Search,
    text: "Recruit",
  },
  {
    to: "/dashboard/agency/candidates/shortlisted",
    icon: Heart,
    text: "Shortlist",
  },
  { to: '/feed', icon: Rss, text: 'Feed' },
  { to: "/dashboard/agency/interviews", icon: Calendar, text: "Interviews" },
  { to: "/dashboard/agency/team", icon: UserPlus, text: "Manage Team" },
];

export const ESSENTIAL_AGENCY_NAV_ITEMS: NavItem[] = [
  { to: "/dashboard/agency", icon: Home, text: "Home", end: true },
  { to: "/dashboard/agency/jobs", icon: Briefcase, text: "My Jobs" },
  {
    to: "/dashboard/agency/candidates/browse",
    icon: Search,
    text: "Recruit",
  },
  {
    to: "/dashboard/agency/candidates/shortlisted",
    icon: Heart,
    text: "Shortlist",
  },
  { to: '/feed', icon: Rss, text: 'Feed' },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { to: "/admin/dashboard", icon: Home, text: "Home", end: true },
  { to: "/admin/users", icon: Users, text: "Users" },
  { to: "/admin/jobs", icon: Briefcase, text: "Job Posts" },
  { to: "/admin/plans", icon: CreditCard, text: "Subscriptions" },
  { to: "/admin/quizzes", icon: FileQuestion, text: "Assessments" },
  { to: "/feed/manage", icon: Rss, text: "Manage Feed" },
  { to: "/admin/verifications", icon: CheckSquare, text: "Verifications" },
  { to: "/admin/reports", icon: BarChart3, text: "Reports" },
];

export const ESSENTIAL_ADMIN_NAV_ITEMS: NavItem[] = [
  { to: "/admin/dashboard", icon: Home, text: "Home", end: true },
  { to: "/admin/users", icon: Users, text: "Users" },
  { to: "/admin/jobs", icon: Briefcase, text: "Job Posts" },
  { to: "/admin/verifications", icon: CheckSquare, text: "Verifications" },
  { to: "/admin/reports", icon: BarChart3, text: "Reports" },
];

export const SUPER_ADMIN_NAV_ITEMS: NavItem[] = [...ADMIN_NAV_ITEMS];
export const ESSENTIAL_SUPER_ADMIN_NAV_ITEMS: NavItem[] = [...ESSENTIAL_ADMIN_NAV_ITEMS];

export const FEED_CATEGORIES: (
  | "LEARN_GROW"
  | "FROM_EMPLOYERS"
  | "CAREER_INSIGHT"
  | "RECOMMENDATION"
  | "SUCCESS_STORY"
  | "SPONSORED_POST"
)[] = [
  "LEARN_GROW",
  "FROM_EMPLOYERS",
  "CAREER_INSIGHT",
  "RECOMMENDATION",
  "SUCCESS_STORY",
  "SPONSORED_POST",
];
export const FEED_TYPES: (
  | "ARTICLE"
  | "JOB_POST"
  | "EVENT"
  | "WEBINAR"
  | "INSIGHT"
  | "SUCCESS_STORY"
)[] = ["ARTICLE", "JOB_POST", "EVENT", "WEBINAR", "INSIGHT", "SUCCESS_STORY"];
export const FEED_AUDIENCES: ("ALL" | "CANDIDATE" | "AGENCY")[] = [
  "ALL",
  "CANDIDATE",
  "AGENCY",
];

export const ALL_FEED_CATEGORIES: FeedCategory[] = [
  "LEARN_GROW",
  "FROM_EMPLOYERS",
  "CAREER_INSIGHT",
  "RECOMMENDATION",
  "SUCCESS_STORY",
];
export const CANDIDATE_FEED_CATEGORIES: FeedCategory[] = [
  "CAREER_INSIGHT",
  "SUCCESS_STORY",
];
export const AGENCY_FEED_CATEGORIES: FeedCategory[] = [
  "LEARN_GROW",
  "FROM_EMPLOYERS",
  "CAREER_INSIGHT",
];