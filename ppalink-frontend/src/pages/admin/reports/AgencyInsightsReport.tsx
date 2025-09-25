import type { AgencyInsightsData } from '../../../types/analytics';
import { StatCard } from '../../../components/ui/StatCard';
import { DistributionPieChart } from '../charts/DistributionPieChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { Briefcase, Users, FilePlus } from 'lucide-react';

interface ReportProps {
  data: AgencyInsightsData;
}

const ReportCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);


export const AgencyInsightsReport = ({ data }: ReportProps) => {
  return (
    <div className="space-y-8">
      {/* Key Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Briefcase} 
          label="Total Agencies in Filter" 
          value={data.totalAgencies} 
          color="green"
        />
        <StatCard 
          icon={FilePlus} 
          label="Total Jobs by this Group" 
          value={data.engagement.totalJobsByGroup} 
          color="green"
        />
        <StatCard 
          icon={Briefcase} 
          label="Avg. Jobs per Agency" 
          value={data.engagement.avgJobsPosted.toFixed(1)} 
          color="green"
        />
        <StatCard 
          icon={Users} 
          label="Avg. Shortlists per Agency" 
          value={data.engagement.avgShortlisted.toFixed(1)} 
          color="green"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ReportCard title="Subscription Plan Distribution">
              <DistributionPieChart data={data.planDistribution} />
          </ReportCard>
          <ReportCard title="Industry Distribution (Top 10)">
              <HorizontalBarChart data={data.industryDistribution} />
          </ReportCard>
      </div>
    </div>
  );
};