import type { JobMarketInsightsData } from '../../../types/analytics';
import { StatCard } from '../../../components/ui/StatCard';
import { DistributionPieChart } from '../charts/DistributionPieChart';
import { TrendLineChart } from '../../agencies/charts/TrendLineChart';
import { Briefcase, Globe, Wallet } from 'lucide-react';

interface ReportProps {
  data: JobMarketInsightsData;
}

const ReportCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">{title}</h3>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);


export const JobMarketInsightsReport = ({ data }: ReportProps) => {
  const { salaryAnalytics } = data;

  return (
    <div className="space-y-8">
      {/* Key Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Wallet} 
          label="Avg. Minimum Salary" 
          value={`₦${Math.round(salaryAnalytics.avgMin || 0).toLocaleString()}`} 
          color="green"
        />
        <StatCard 
          icon={Wallet} 
          label="Avg. Maximum Salary" 
          value={`₦${Math.round(salaryAnalytics.avgMax || 0).toLocaleString()}`} 
          color="green"
        />
        <StatCard 
          icon={Briefcase} 
          label="Highest Salary Offered" 
          value={`₦${(salaryAnalytics.overallMax || 0).toLocaleString()}`} 
          color="green"
        />
        <StatCard 
          icon={Globe} 
          label="Lowest Salary Offered" 
          value={`₦${(salaryAnalytics.overallMin || 0).toLocaleString()}`} 
          color="green"
        />
      </div>

      {/* Charts Section */}
      <ReportCard title="Job Posting Volume">
        <TrendLineChart data={data.postingVolume} />
      </ReportCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ReportCard title="Distribution by Employment Type">
              <DistributionPieChart data={data.byEmploymentType} />
          </ReportCard>
          <ReportCard title="Remote vs. On-site Distribution">
              <DistributionPieChart data={data.remoteDistribution} />
          </ReportCard>
      </div>
    </div>
  );
};

