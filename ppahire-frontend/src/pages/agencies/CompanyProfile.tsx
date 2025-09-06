import { Briefcase, Building2, Edit, Globe, Hash, Loader2, MapPin, Users } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useDataStore } from '../../context/DataStore';
import useFetch from '../../hooks/useFetch';
import type { Agency } from '../../types/agency';

const ProfileField = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | null }) => (
  <div>
    <dt className="flex items-center text-sm font-medium text-gray-500">
      <Icon className="h-5 w-5 flex-shrink-0 text-gray-400 mr-2" />
      <span>{label}</span>
    </dt>
    <dd className="mt-1 text-sm text-gray-900">
      {value || <span className="text-gray-400">Not provided</span>}
    </dd>
  </div>
);

const CompanyProfilePage = () => {
  const { data: agency, isLoading, error } = useFetch<Agency>('/agencies/me');
  // Get industries and states from the global store
  const { industries, states } = useDataStore();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-center text-red-800">
        <h3 className="text-lg font-semibold">Could Not Load Agency Profile</h3>
        <p className="mt-1 text-sm">{error || 'An unexpected error occurred.'}</p>
      </div>
    );
  }

  // Perform the lookup using data from the global store
  const industryName = industries.find(ind => ind.id === agency.industryId)?.name;
  const stateName = states.find(st => st.id === agency.headquartersStateId)?.name;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-600">{agency.name}</h1>
          <p className="mt-1 text-gray-500">View and manage your company's details.</p>
        </div>
        <Link to="/dashboard/agency/profile/edit">
          <Button size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800">Company Information</h2>
          <dl className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
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
  );
};

export default CompanyProfilePage;