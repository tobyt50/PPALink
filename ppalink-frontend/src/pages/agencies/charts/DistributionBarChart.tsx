// Refactored DistributionBarChart.tsx with smaller height
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { AgencyProAnalytics } from '../../../types/analytics';

interface ChartProps {
  data: AgencyProAnalytics['applicationStatusDistribution'];
}

export const DistributionBarChart = ({ data }: ChartProps) => {
  // Convert the Record<string, number> into an array of objects for Recharts
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name,
    count: value,
  }));

  // Paler but distinct shades (400 range)
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
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) =>
            value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
          }
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: '#f9fafb' }}
          contentStyle={{
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
          }}
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Bar dataKey="count" name="Applicants" radius={[4, 4, 0, 0]}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};