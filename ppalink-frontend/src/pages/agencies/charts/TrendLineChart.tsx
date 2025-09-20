import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AgencyProAnalytics } from '../../../types/analytics';

interface ChartProps {
  data: AgencyProAnalytics['applicationTrends'];
}

export const TrendLineChart = ({ data }: ChartProps) => {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    month: name,
    count: value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
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
          dataKey="month"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
          }}
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Line
          type="monotone"
          dataKey="count"
          name="New Applicants"
          stroke="#4ade80" // green-400 (paler, softer)
          strokeWidth={2}
          activeDot={{ r: 6, fill: "#22c55e" }} // slightly deeper green for emphasis
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
