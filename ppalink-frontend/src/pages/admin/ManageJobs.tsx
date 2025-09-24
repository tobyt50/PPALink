import { Edit, Eye, EyeOff, Loader2, Search, ChevronDown } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ConfirmationModal } from '../../components/ui/Modal';
import { useDebounce } from '../../hooks/useDebounce';
import adminService from '../../services/admin.service';
import useFetch from '../../hooks/useFetch';
import type { Position } from '../../types/job';
import { useDataStore } from '../../context/DataStore';
import { SimpleDropdown, SimpleDropdownItem } from '../../components/ui/SimpleDropdown';
import { DropdownTrigger } from '../../components/ui/DropdownTrigger';

const ManageJobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { industries } = useDataStore();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [visibilityFilter, setVisibilityFilter] = useState(searchParams.get('visibility') || 'ALL');
  const [industryFilter, setIndustryFilter] = useState(searchParams.get('industryId') || 'ALL');
  
  const debouncedQuery = useDebounce(query, 500);

  const fetchUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (visibilityFilter !== 'ALL') params.set('visibility', visibilityFilter);
    if (industryFilter !== 'ALL') params.set('industryId', industryFilter);
    return `/admin/jobs?${params.toString()}`;
  }, [debouncedQuery, statusFilter, visibilityFilter, industryFilter]);
  
  const { data: jobs, isLoading, error, refetch } = useFetch<Position[]>(fetchUrl);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (visibilityFilter !== 'ALL') params.set('visibility', visibilityFilter);
    if (industryFilter !== 'ALL') params.set('industryId', industryFilter);
    setSearchParams(params, { replace: true });
  }, [query, statusFilter, visibilityFilter, industryFilter, setSearchParams]);

  const [modalState, setModalState] = useState<{ isOpen: boolean; job: Position | null; action: 'unpublish' | 'republish' | null }>({ isOpen: false, job: null, action: null });
  
  const openModal = (job: Position, action: 'unpublish' | 'republish') => setModalState({ isOpen: true, job, action });
  const closeModal = () => setModalState({ isOpen: false, job: null, action: null });
  
  const handleVisibilityToggle = async () => {
    if (!modalState.job || !modalState.action) return;
    const actionPromise = modalState.action === 'unpublish' ? adminService.adminUnpublishJob(modalState.job.id) : adminService.adminRepublishJob(modalState.job.id);
    await toast.promise(actionPromise, {
      loading: `${modalState.action === 'unpublish' ? 'Unpublishing' : 'Republishing'}...`,
      success: () => { refetch(); closeModal(); return `Job has been ${modalState.action}ed.`; },
      error: `Failed to ${modalState.action} job.`
    });
  };

  const statusOptions: { [key: string]: string } = { ALL: 'All Statuses', OPEN: 'Open', CLOSED: 'Closed', DRAFT: 'Draft' };
  const visibilityOptions: { [key: string]: string } = { ALL: 'All Visibilities', PUBLIC: 'Public', PRIVATE: 'Private' };
  const selectedIndustryName = industries.find(i => String(i.id) === industryFilter)?.name || 'All Industries';


  return (
    <>
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleVisibilityToggle}
        title={`${modalState.action === 'republish' ? 'Republish' : 'Unpublish'} Job: "${modalState.job?.title}"`}
        description={`Are you sure you want to ${modalState.action} this job?`}
        confirmButtonText={modalState.action === 'republish' ? 'Republish' : 'Unpublish'}
        isDestructive={modalState.action === 'unpublish'}
      />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-primary-600">Job Post Management</h1>
            <p className="mt-1 text-gray-500">Oversee and moderate all job postings on the platform.</p>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Search className="h-5 w-5 text-gray-400" /></div>
                        <input type="search" placeholder="Search by title or agency..." value={query} onChange={e => setQuery(e.target.value)} className="block w-full rounded-md border-gray-300 pl-10"/>
                    </div>
                </div>
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SimpleDropdown trigger={<DropdownTrigger>{statusOptions[statusFilter]}<ChevronDown className="h-4 w-4 text-gray-500" /></DropdownTrigger>}>
                        {Object.entries(statusOptions).map(([key, value]) => (
                            <SimpleDropdownItem key={key} onSelect={() => setStatusFilter(key)}>{value}</SimpleDropdownItem>
                        ))}
                    </SimpleDropdown>
                    <SimpleDropdown trigger={<DropdownTrigger>{visibilityOptions[visibilityFilter]}<ChevronDown className="h-4 w-4 text-gray-500" /></DropdownTrigger>}>
                         {Object.entries(visibilityOptions).map(([key, value]) => (
                            <SimpleDropdownItem key={key} onSelect={() => setVisibilityFilter(key)}>{value}</SimpleDropdownItem>
                        ))}
                    </SimpleDropdown>
                    <SimpleDropdown trigger={<DropdownTrigger>{selectedIndustryName}<ChevronDown className="h-4 w-4 text-gray-500" /></DropdownTrigger>}>
                        <SimpleDropdownItem onSelect={() => setIndustryFilter('ALL')}>All Industries</SimpleDropdownItem>
                        {industries.map(ind => (
                            <SimpleDropdownItem key={ind.id} onSelect={() => setIndustryFilter(String(ind.id))}>{ind.name}</SimpleDropdownItem>
                        ))}
                    </SimpleDropdown>
                </div>
            </div>
        </div>

        {isLoading && <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}
        {error && <div className="text-center text-red-500 p-8">Could not load jobs.</div>}

        {!isLoading && !error && jobs && (
            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Job Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Agency</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Visibility</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date Posted</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {jobs.length === 0 ? (
                            <tr><td colSpan={6} className="text-center p-8 text-gray-500">No jobs found matching your criteria.</td></tr>
                        ) : (
                            jobs.map((job) => (
                                <tr key={job.id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium"><Link to={`/admin/jobs/${job.id}`} className="text-gray-900 hover:text-primary-600">{job.title}</Link></td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{job.agency?.name}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${job.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{job.status}</span></td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{job.visibility}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                                        {job.visibility === 'PRIVATE' ? (
                                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openModal(job, 'republish'); }}><Eye className="h-4 w-4 mr-1" /> Republish</Button>
                                        ) : (
                                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openModal(job, 'unpublish'); }}><EyeOff className="h-4 w-4 mr-1" /> Unpublish</Button>
                                        )}
                                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/admin/jobs/${job.id}/edit`); }}><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </>
  );
};

export default ManageJobsPage;