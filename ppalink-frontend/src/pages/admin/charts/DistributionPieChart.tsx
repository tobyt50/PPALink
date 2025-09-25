import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { NameCountPair } from '../../../types/analytics';

interface ChartProps {
  data: NameCountPair[];
}

// Define colors for the pie chart slices
const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'];

export const DistributionPieChart = ({ data }: ChartProps) => {
  const chartData = data.map(item => ({ name: item.name, value: item.count }));

  if (!chartData || chartData.length === 0) {
      return <div className="text-center text-gray-500 h-[300px] flex items-center justify-center">No data to display.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value" // Ensure this points to the numeric value
          nameKey="name"
        >
          {chartData.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0' }}
          formatter={(value) => [`${value} Candidates`, '']}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};