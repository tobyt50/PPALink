// This file is the single source of truth for truly static application-level constants.
// Data that can be changed by an admin (like Industries or States) should be fetched from the API.

import { BarChart2, Briefcase, CheckSquare, Heart, Home, Package, Search, User, UserPlus, Users } from 'lucide-react';
import type { NavItem } from '../components/layout/Sidebar';

export const NYSC_BATCHES = ['Batch A', 'Batch B', 'Batch C'];
export const NYSC_STREAMS = ['Stream 1', 'Stream 2'];

export const CANDIDATE_NAV_ITEMS: NavItem[] = [
  { to: '/dashboard/candidate', icon: Home, text: 'Dashboard', end: true },
  { to: '/dashboard/candidate/profile', icon: User, text: 'My Profile' },
  { to: '/dashboard/candidate/jobs/browse', icon: Search, text: 'Browse Jobs' },
  { to: '/dashboard/candidate/applications', icon: Package, text: 'My Applications' },
];

export const AGENCY_NAV_ITEMS: NavItem[] = [
  { to: '/dashboard/agency', icon: Home, text: 'Dashboard', end: true },
  { to: '/dashboard/agency/jobs', icon: Briefcase, text: 'My Jobs' },
  { to: '/dashboard/agency/candidates/browse', icon: Search, text: 'Find Candidates' },
  { to: '/dashboard/agency/candidates/shortlisted', icon: Heart, text: 'Shortlist' },
  { to: '/dashboard/agency/analytics', icon: BarChart2, text: 'Analytics' },
  { to: '/dashboard/agency/team', icon: UserPlus, text: 'Manage Team' },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { to: '/admin/dashboard', icon: Home, text: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, text: 'Manage Users' },
  { to: '/admin/verifications', icon: CheckSquare, text: 'Verification Queue' },
];