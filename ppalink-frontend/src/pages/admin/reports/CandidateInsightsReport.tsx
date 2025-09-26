import type { CandidateInsightsData } from '../../../types/analytics';
import { DistributionPieChart } from '../charts/DistributionPieChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';

interface ReportProps {
  data: CandidateInsightsData;
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

export const CandidateInsightsReport = ({ data }: ReportProps) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ReportCard title="Geographic Distribution (Top 10 States)">
              <HorizontalBarChart data={data.geographicDistribution} />
          </ReportCard>
          <ReportCard title="Skill Distribution (Top 10 Skills)">
              <HorizontalBarChart data={data.skillDistribution} />
          </ReportCard>
      </div>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ReportCard title="NYSC Batch Distribution">
              <DistributionPieChart data={data.nyscBatchDistribution} />
          </ReportCard>
          <ReportCard title="GPA Distribution">
              <DistributionPieChart data={data.gpaDistribution} />
          </ReportCard>
      </div>
    </div>
  );
};

