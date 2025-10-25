// Refactored GeographicSourcingChart.tsx with smaller height
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { AgencyEnterpriseAnalytics } from '../../../types/analytics';

interface ChartProps {
  data: AgencyEnterpriseAnalytics['geographicSourcing'];
}

// Paler but distinct colors (400 range palette for consistency)
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

export const GeographicSourcingChart = ({ data }: ChartProps) => {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={70}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {chartData.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          cursor={{ fill: '#f9fafb' }}
          contentStyle={{
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
          }}
          labelStyle={{ fontWeight: 'bold' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};