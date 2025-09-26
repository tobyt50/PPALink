import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  BarChart3,
  Briefcase,
  ChevronDown,
  Download,
  Filter,
  PieChart,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SimpleDropdown, SimpleDropdownItem } from '../../components/ui/SimpleDropdown';
import { DropdownTrigger } from '../../components/ui/DropdownTrigger';
import { useDataStore } from '../../context/DataStore';
import reportingService from '../../services/reporting.service';
import type {
  ReportFilters,
  UserGrowthDataPoint,
  FunnelDataPoint,
  CandidateInsightsData,
  AgencyInsightsData,
  JobMarketInsightsData,
} from '../../types/analytics';
import { UserGrowthChart } from './charts/UserGrowthChart';
import { ApplicationFunnelChart } from './charts/ApplicationFunnelChart';
import { UserGrowthTable } from './tables/UserGrowthTable';
import { FunnelDataTable } from './tables/FunnelDataTable';
import { CandidateInsightsReport } from './reports/CandidateInsightsReport';
import { AgencyInsightsReport } from './reports/AgencyInsightsReport';
import { JobMarketInsightsReport } from './reports/JobInsightsReport';
import {
  exportUserGrowthToCSV,
  exportFunnelToCSV,
  exportCandidateInsightsToCSV,
  exportAgencyInsightsToCSV,
  exportJobMarketInsightsToCSV
} from '../../utils/csv';

const ReportFilterBar = ({
  onApply,
  isLoading,
  activeReport
}: {
  onApply: (filters: ReportFilters) => void;
  isLoading: boolean;
  activeReport: string;
}) => {
  const { states, industries, courses } = useDataStore();
  const { register, handleSubmit, control, watch } = useForm<ReportFilters>({
    defaultValues: {
      startDate: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      groupBy: 'day',
      stateId: undefined,
      industryId: undefined,
      fieldOfStudy: undefined,
    },
  });

  const watchedGroupBy = watch('groupBy');
  const watchedStateId = watch('stateId');
  const watchedIndustryId = watch('industryId');
  const watchedFieldOfStudy = watch('fieldOfStudy');

  const selectedGroupByText = { day: 'Day', week: 'Week', month: 'Month' }[watchedGroupBy || 'day'];
  const selectedStateName = states.find((s) => s.id === watchedStateId)?.name || 'All States';
  const selectedIndustryName = industries.find((i) => i.id === watchedIndustryId)?.name || 'All Industries';
  const selectedFieldName = watchedFieldOfStudy || 'All Fields of Study';

  const processSubmit = (data: any) => {
    const payload = {
      ...data,
      stateId: data.stateId ? Number(data.stateId) : undefined,
      industryId: data.industryId ? Number(data.industryId) : undefined,
      fieldOfStudy: data.fieldOfStudy || undefined,
    };
    onApply(payload);
  };

  const inputStyle = `
    flex h-10 w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm
    transition-colors duration-150 placeholder:text-gray-400 dark:placeholder:text-zinc-600
    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600
    disabled:cursor-not-allowed disabled:opacity-50
  `;

  return (
    <form
      onSubmit={handleSubmit(processSubmit)}
      className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 w-full">
        {/* make filters single column on mobile, 2-col on small, 5-col on md */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 flex-grow min-w-0">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-zinc-300 block mb-1.5">Start Date</label>
            <input type="date" className={inputStyle} {...register('startDate')} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-zinc-300 block mb-1.5">End Date</label>
            <input type="date" className={inputStyle} {...register('endDate')} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-zinc-300 block mb-1.5">Group By</label>
            <Controller
              name="groupBy"
              control={control}
              render={({ field: { onChange } }) => (
                <SimpleDropdown
                  trigger={
                    <DropdownTrigger>
                      <span className="truncate">{selectedGroupByText}</span>
                      <ChevronDown className="h-4 w-4" />
                    </DropdownTrigger>
                  }
                >
                  <SimpleDropdownItem onSelect={() => onChange('day')}>Day</SimpleDropdownItem>
                  <SimpleDropdownItem onSelect={() => onChange('week')}>Week</SimpleDropdownItem>
                  <SimpleDropdownItem onSelect={() => onChange('month')}>Month</SimpleDropdownItem>
                </SimpleDropdown>
              )}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-zinc-300 block mb-1.5">State</label>
            <Controller
              name="stateId"
              control={control}
              render={({ field: { onChange } }) => (
                <SimpleDropdown
                  trigger={
                    <DropdownTrigger>
                      <span className="truncate">{selectedStateName}</span>
                      <ChevronDown className="h-4 w-4" />
                    </DropdownTrigger>
                  }
                >
                  <SimpleDropdownItem onSelect={() => onChange(undefined)}>
                    All States
                  </SimpleDropdownItem>
                  {states.map((s) => (
                    <SimpleDropdownItem key={s.id} onSelect={() => onChange(s.id)}>
                      {s.name}
                    </SimpleDropdownItem>
                  ))}
                </SimpleDropdown>
              )}
            />
          </div>
          {activeReport === 'candidateInsights' ? (
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-zinc-300 block mb-1.5">Field of Study</label>
              <Controller
                name="fieldOfStudy"
                control={control}
                render={({ field: { onChange } }) => (
                  <SimpleDropdown
                    trigger={
                      <DropdownTrigger>
                        <span className="truncate">{selectedFieldName}</span>
                        <ChevronDown className="h-4 w-4" />
                      </DropdownTrigger>
                    }
                  >
                    <SimpleDropdownItem onSelect={() => onChange(undefined)}>
                      All Fields of Study
                    </SimpleDropdownItem>
                    {courses.map((course) => (
                      <SimpleDropdownItem key={course} onSelect={() => onChange(course)}>
                        {course}
                      </SimpleDropdownItem>
                    ))}
                  </SimpleDropdown>
                )}
              />
            </div>
          ) : (
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-zinc-300 block mb-1.5">Industry</label>
              <Controller
                name="industryId"
                control={control}
                render={({ field: { onChange } }) => (
                  <SimpleDropdown
                    isIndustryDropdown
                    industries={industries}
                    onSelectIndustry={(id) => onChange(id)}
                    trigger={
                      <DropdownTrigger>
                        <span className="truncate">{selectedIndustryName}</span>
                        <ChevronDown className="h-4 w-4" />
                      </DropdownTrigger>
                    }
                  />
                )}
              />
            </div>
          )}
        </div>
        <Button type="submit" isLoading={isLoading} size="lg" className="w-full sm:w-auto">
          Generate Report
        </Button>
      </div>
    </form>
  );
};

const ReportingPage = () => {
  type ReportType =
    | 'userGrowth'
    | 'applicationFunnel'
    | 'candidateInsights'
    | 'agencyInsights'
    | 'jobMarketInsights';

  const [activeReport, setActiveReport] = useState<ReportType>('userGrowth');
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthDataPoint[] | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelDataPoint[] | null>(null);
  const [candidateInsightsData, setCandidateInsightsData] = useState<CandidateInsightsData | null>(
    null
  );
  const [agencyInsightsData, setAgencyInsightsData] = useState<AgencyInsightsData | null>(null);
  const [jobMarketInsightsData, setJobMarketInsightsData] =
    useState<JobMarketInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<ReportFilters | null>(null);

  const handleGenerateReport = async (filters: ReportFilters) => {
    setIsLoading(true);
    const payload = {
      ...filters,
      startDate: new Date(filters.startDate).toISOString(),
      endDate: new Date(filters.endDate).toISOString(),
    };
    setCurrentFilters(filters);

    setUserGrowthData(null);
    setFunnelData(null);
    setCandidateInsightsData(null);
    setAgencyInsightsData(null);
    setJobMarketInsightsData(null);

    try {
      let data;
      switch (activeReport) {
        case 'userGrowth':
          data = await reportingService.getUserGrowthReport(payload);
          setUserGrowthData(data);
          break;
        case 'applicationFunnel':
          data = await reportingService.getApplicationFunnelReport(payload);
          setFunnelData(data);
          break;
        case 'candidateInsights':
          data = await reportingService.getCandidateInsightsReport(payload);
          setCandidateInsightsData(data);
          break;
        case 'agencyInsights':
          data = await reportingService.getAgencyInsightsReport(payload);
          setAgencyInsightsData(data);
          break;
        case 'jobMarketInsights':
          data = await reportingService.getJobMarketInsightsReport(payload);
          setJobMarketInsightsData(data);
          break;
      }

      const isEmptyArray = Array.isArray(data) && data.length === 0;
      const isEmptyObject =
        typeof data === 'object' &&
        data &&
        Object.values(data).every((arr) => Array.isArray(arr) && arr.length === 0);

      if (
        !data ||
        isEmptyArray ||
        isEmptyObject ||
        (funnelData && funnelData.every((d) => d.count === 0))
      ) {
        toast.success('Report generated, but no data found for the selected filters.');
      }
    } catch {
      toast.error('Failed to generate report.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasData =
    (userGrowthData && userGrowthData.length > 0) ||
    (funnelData && funnelData.some((d) => d.count > 0)) ||
    (candidateInsightsData &&
      Object.values(candidateInsightsData).some((arr) => arr.length > 0)) ||
    (agencyInsightsData && agencyInsightsData.totalAgencies > 0) ||
    (jobMarketInsightsData &&
      Object.values(jobMarketInsightsData).some((val) =>
        Array.isArray(val) ? val.length > 0 : val && Object.keys(val).length > 0
      ));

  const tabStyle =
    'flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors';
  const activeTabStyle = 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400';
  const inactiveTabStyle =
    'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-700 hover:border-gray-300';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
          Reporting & Analytics
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-300">Generate and export detailed reports on platform activity.</p>
      </div>

      {/* mobile-friendly tab bar with horizontal scroll */}
      <div className="border-b border-gray-200 dark:border-zinc-800">
        <nav
          className="-mb-px flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 space-x-6 sm:space-x-8"
          aria-label="Tabs"
        >
          <button
            onClick={() => setActiveReport('userGrowth')}
            className={`${tabStyle} ${
              activeReport === 'userGrowth' ? activeTabStyle : inactiveTabStyle
            }`}
          >
            <Users className="mr-2 h-5 w-5" />
            User Growth
          </button>
          <button
            onClick={() => setActiveReport('applicationFunnel')}
            className={`${tabStyle} ${
              activeReport === 'applicationFunnel' ? activeTabStyle : inactiveTabStyle
            }`}
          >
            <Filter className="mr-2 h-5 w-5" />
            Application Funnel
          </button>
          <button
            onClick={() => setActiveReport('candidateInsights')}
            className={`${tabStyle} ${
              activeReport === 'candidateInsights' ? activeTabStyle : inactiveTabStyle
            }`}
          >
            <PieChart className="mr-2 h-5 w-5" />
            Candidate Insights
          </button>
          <button
            onClick={() => setActiveReport('agencyInsights')}
            className={`${tabStyle} ${
              activeReport === 'agencyInsights' ? activeTabStyle : inactiveTabStyle
            }`}
          >
            <Briefcase className="mr-2 h-5 w-5" />
            Agency Insights
          </button>
          <button
            onClick={() => setActiveReport('jobMarketInsights')}
            className={`${tabStyle} ${
              activeReport === 'jobMarketInsights' ? activeTabStyle : inactiveTabStyle
            }`}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Job Market
          </button>
        </nav>
      </div>

      <ReportFilterBar onApply={handleGenerateReport} isLoading={isLoading} activeReport={activeReport} />

      <div className="pt-3">
        {isLoading ? (
          <div className="text-center p-12 rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100">
            <p className="text-gray-600 dark:text-zinc-300">Generating your report...</p>
          </div>
        ) : !hasData && currentFilters ? (
          <div className="text-center p-12 rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 dark:text-zinc-500" />
            <h2 className="mt-2 font-semibold text-gray-800 dark:text-zinc-100">No Data Found</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Your report for the selected filters is empty. Try a different date range.
            </p>
          </div>
        ) : !currentFilters ? (
          <div className="text-center p-12 rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 dark:text-zinc-500" />
            <h2 className="mt-2 font-semibold text-gray-800 dark:text-zinc-100">Generate a Report</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Select your report type and filters, then click &quot;Generate Report&quot;.
            </p>
          </div>
        ) : null}

        {userGrowthData && activeReport === 'userGrowth' && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">User Growth</h2>
              <Button
                onClick={() => exportUserGrowthToCSV(userGrowthData, currentFilters)}
                variant="outline"
                size="sm"
                disabled={!userGrowthData || userGrowthData.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="p-6 space-y-8">
              <UserGrowthChart data={userGrowthData} />
              <div className="mt-6 border-t border-gray-100 dark:border-zinc-800 pt-6">
                <UserGrowthTable data={userGrowthData} />
              </div>
            </div>
          </div>
        )}

        {funnelData && activeReport === 'applicationFunnel' && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Application Funnel</h2>
              <Button
                onClick={() => exportFunnelToCSV(funnelData, currentFilters)}
                variant="outline"
                size="sm"
                disabled={!funnelData || !funnelData.some((d) => d.count > 0)}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <ApplicationFunnelChart data={funnelData} />
              <FunnelDataTable data={funnelData} />
            </div>
          </div>
        )}

        {candidateInsightsData && activeReport === 'candidateInsights' && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Candidate Insights</h2>
              <Button
                onClick={() =>
                  exportCandidateInsightsToCSV(candidateInsightsData, currentFilters)
                }
                variant="outline"
                size="sm"
                disabled={
                  !candidateInsightsData ||
                  Object.values(candidateInsightsData).every((arr) => arr.length === 0)
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="p-6">
              <CandidateInsightsReport data={candidateInsightsData} />
            </div>
          </div>
        )}

        {agencyInsightsData && activeReport === 'agencyInsights' && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Agency Insights</h2>
              <Button
                onClick={() => exportAgencyInsightsToCSV(agencyInsightsData, currentFilters)}
                variant="outline"
                size="sm"
                disabled={!agencyInsightsData || agencyInsightsData.totalAgencies === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="p-6">
              <AgencyInsightsReport data={agencyInsightsData} />
            </div>
          </div>
        )}

        {jobMarketInsightsData && activeReport === 'jobMarketInsights' && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Job Market Insights</h2>
              <Button
                onClick={() =>
                  exportJobMarketInsightsToCSV(jobMarketInsightsData, currentFilters)
                }
                variant="outline"
                size="sm"
                disabled={!jobMarketInsightsData}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="p-6">
              <JobMarketInsightsReport data={jobMarketInsightsData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportingPage;


