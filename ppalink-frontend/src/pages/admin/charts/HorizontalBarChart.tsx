import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { NameCountPair } from '../../../types/analytics';

interface ChartProps {
  data: NameCountPair[];
}

export const HorizontalBarChart = ({ data }: ChartProps) => {
  const chartData = data;

  if (!chartData || chartData.length === 0) {
    return <div className="text-center text-gray-500 dark:text-zinc-400 h-[300px] flex items-center justify-center">No data to display.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name" // Use the "name" field for the labels on the Y-axis
          width={120}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          interval={0}
        />
        <Tooltip
          cursor={{ fill: '#f9fafb' }}
          contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0' }}
          formatter={(value) => [value, 'Candidates']}
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Bar dataKey="count" name="Candidates" fill="#82ca9d" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
