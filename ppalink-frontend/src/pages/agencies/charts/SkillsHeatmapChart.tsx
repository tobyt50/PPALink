import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { AgencyEnterpriseAnalytics } from '../../../types/analytics';

interface ChartProps {
  data: AgencyEnterpriseAnalytics['skillsHeatmap'];
}

export const SkillsHeatmapChart = ({ data }: ChartProps) => {
  const chartData = Object.entries(data || {})
    .map(([name, value]) => ({ name, count: value }))
    .sort((a, b) => b.count - a.count); // Sort to show most common first

  // Paler but still distinct shades (300–400 range)
  const COLORS = [
    "#4ade80", // green-400
    "#60a5fa", // blue-400
    "#facc15", // yellow-400
    "#f87171", // red-400
    "#a78bfa", // purple-400
    "#2dd4bf", // teal-400
    "#fb923c", // orange-400
    "#94a3b8", // slate-400
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={100}
          tick={{ fill: '#374151' }} // gray-700 for text
        />
        <Tooltip
          cursor={{ fill: '#f9fafb' }}
          contentStyle={{
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
          }}
        />
        <Bar dataKey="count" name="Applicants" radius={[0, 4, 4, 0]} barSize={20}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
