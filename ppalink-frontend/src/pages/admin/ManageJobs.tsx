import { Edit, Eye, EyeOff, Loader2, Search, ChevronDown, MoreHorizontal } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ConfirmationModal } from '../../components/ui/Modal';
import { useDebounce } from '../../hooks/useDebounce';
import adminService from '../../services/admin.service';
import useFetch from '../../hooks/useFetch';
import type { Position } from '../../types/job';
import { useDataStore } from '../../context/DataStore';
import { SimpleDropdown, SimpleDropdownItem } from '../../components/ui/SimpleDropdown';
import { DropdownTrigger } from '../../components/ui/DropdownTrigger';
import { Input } from '../../components/forms/Input';

const JobStatusBadge = ({ status }: { status: Position['status'] }) => {
    const statusStyles: Record<Position['status'], string> = {
      OPEN: 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-200',
      CLOSED: 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-100',
      DRAFT: 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300',
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}>
        {status}
      </span>
    );
};

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
      loading: `${modalState.action === 'unpublish' ? 'Unpublishing' : 'Republishing'} job...`,
      success: () => { refetch(); closeModal(); return `Job has been successfully ${modalState.action === 'unpublish' ? 'unpublished' : 'republished'}.`; },
      error: (err) => {
        closeModal();
        return err.response?.data?.message || `Failed to ${modalState.action} job.`;
      }
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
        title={`${modalState.action === 'republish' ? 'Republish' : 'Unpublish'} Job`}
        description={`Are you sure you want to ${modalState.action} the job posting "${modalState.job?.title}"?`}
        confirmButtonText={modalState.action === 'republish' ? 'Republish' : 'Unpublish'}
        isDestructive={modalState.action === 'unpublish'}
      />
      <div className="space-y-5">
        <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-400 to-green-500 dark:to-green-400 bg-clip-text text-transparent">Job Post Management</h1>
            <p className="mt-2 text-gray-600 dark:text-zinc-300">Oversee and moderate all job postings on the platform.</p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                    <Input
                        icon={Search}
                        type="search"
                        placeholder="Search by title or agency..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SimpleDropdown isIndustryDropdown industries={industries} onSelectIndustry={(id) => setIndustryFilter(id ? String(id) : 'ALL')} trigger={<DropdownTrigger>{selectedIndustryName}<ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" /></DropdownTrigger>} />
                    <SimpleDropdown trigger={<DropdownTrigger>{statusOptions[statusFilter]}<ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" /></DropdownTrigger>}>
                        {Object.entries(statusOptions).map(([key, value]) => (
                            <SimpleDropdownItem key={key} onSelect={() => setStatusFilter(key)}>{value}</SimpleDropdownItem>
                        ))}
                    </SimpleDropdown>
                    <SimpleDropdown trigger={<DropdownTrigger>{visibilityOptions[visibilityFilter]}<ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" /></DropdownTrigger>}>
                         {Object.entries(visibilityOptions).map(([key, value]) => (
                            <SimpleDropdownItem key={key} onSelect={() => setVisibilityFilter(key)}>{value}</SimpleDropdownItem>
                        ))}
                    </SimpleDropdown>
                </div>
            </div>
        </div>

        {isLoading && <div className="flex h-80 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" /></div>}
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">Could not load jobs.</div>}

        {!isLoading && !error && jobs && (
            <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50 dark:bg-gray-920">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">Job Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">Agency</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">Visibility</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">Date Posted</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white dark:bg-zinc-900">
                            {jobs.length === 0 ? (
                                <tr><td colSpan={6} className="text-center p-8 text-gray-500 dark:text-zinc-400">No jobs found matching your criteria.</td></tr>
                            ) : (
                                jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold"><Link to={`/admin/jobs/${job.id}`} className="text-primary-600 dark:text-primary-400 hover:underline">{job.title}</Link></td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">{job.agency?.name}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm"><JobStatusBadge status={job.status} /></td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">{job.visibility}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">{new Date(job.createdAt).toLocaleDateString()}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                            <SimpleDropdown
                                                trigger={
                                                    <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 dark:text-zinc-400 transition-colors hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-800 dark:hover:text-zinc-200">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </button>
                                                }
                                            >
                                                <SimpleDropdownItem onSelect={() => navigate(`/admin/jobs/${job.id}/edit`)} className="group text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800">
                                                    <Edit className="mr-2 h-4 w-4" /> <span>Edit Job</span>
                                                </SimpleDropdownItem>
                                                {job.visibility === 'PRIVATE' ? (
                                                     <SimpleDropdownItem onSelect={() => openModal(job, 'republish')} className="group text-green-700 dark:text-green-300 hover:bg-green-50 hover:text-green-800">
                                                        <Eye className="mr-2 h-4 w-4" /> <span>Republish Job</span>
                                                    </SimpleDropdownItem>
                                                ) : (
                                                    <SimpleDropdownItem onSelect={() => openModal(job, 'unpublish')} className="group text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 dark:hover:text-yellow-100">
                                                        <EyeOff className="mr-2 h-4 w-4" /> <span>Unpublish Job</span>
                                                    </SimpleDropdownItem>
                                                )}
                                            </SimpleDropdown>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    </>
  );
};

export default ManageJobsPage;

