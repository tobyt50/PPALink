import { Briefcase, Building2, Edit, Globe, Hash, Loader2, MapPin, Users } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useDataStore } from '../../context/DataStore';
import useFetch from '../../hooks/useFetch';
import type { Agency } from '../../types/agency';
import VerificationSection from './sections/VerificationSection';
import { Avatar } from '../../components/ui/Avatar';

// Refined ProfileField for better alignment and readability
const ProfileField = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | null }) => (
  <div className="flex flex-col">
    <dt className="flex items-center text-sm font-medium text-gray-500 dark:text-zinc-400">
      <Icon className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-zinc-500 mr-2" />
      <span>{label}</span>
    </dt>
    <dd className="mt-1.5 text-sm font-medium text-gray-900 dark:text-zinc-50 ml-7">
      {value || <span className="text-gray-400 dark:text-zinc-500 italic">Not provided</span>}
    </dd>
  </div>
);

const CompanyProfilePage = () => {
  const { data: agency, isLoading, error, refetch } = useFetch<Agency>('/agencies/me');
  const { industries, states } = useDataStore();

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">
        <h3 className="text-lg font-semibold">Could Not Load Agency Profile</h3>
        <p className="mt-2 text-sm">{error?.toString() || 'An unexpected error occurred.'}</p>
      </div>
    );
  }

  const industryName = industries.find(ind => ind.id === agency.industryId)?.name;
  const stateName = states.find(st => st.id === agency.headquartersStateId)?.name;

  return (
    <div className="space-y-5">
      {/* Header - Replicated from AgencyDashboard */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
            <Avatar 
                user={{ role: 'AGENCY', ownedAgencies: [agency] }}
                size="lg"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
                {agency.name}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-zinc-300">
                View and manage your company's details.
              </p>
            </div>
        </div>
        <Link to="/dashboard/agency/profile/edit">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Main Content Area with replicated card styling */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Company Info */}
        <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Company Information</h2>
                </div>
                <div className="p-6">
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                        <ProfileField icon={Building2} label="Legal Name" value={agency.name} />
                        <ProfileField icon={Hash} label="RC Number" value={agency.rcNumber} />
                        <ProfileField icon={Briefcase} label="Industry" value={industryName} />
                        <ProfileField icon={Globe} label="Website" value={agency.website} />
                        <ProfileField icon={Users} label="Company Size" value={agency.sizeRange} />
                        <ProfileField icon={MapPin} label="Headquarters" value={stateName} />
                    </dl>
                </div>
            </div>
        </div>
        
        {/* Right Column: Verification */}
        <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Verification Status</h2>
                </div>
                <div className="p-6">
                    <VerificationSection agency={agency} refetch={refetch} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfilePage;

