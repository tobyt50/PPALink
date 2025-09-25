import { format, parseISO } from 'date-fns';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { UserGrowthDataPoint } from '../../../types/analytics';

interface ChartProps {
  data: UserGrowthDataPoint[];
}

export const UserGrowthChart = ({ data }: ChartProps) => {
  // Format the date for display on the X-axis
  const chartData = data.map(item => ({
    ...item,
    date: format(parseISO(item.date), 'MMM d'),
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCandidate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorAgency" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0' }} />
        <Legend verticalAlign="top" height={36} />
        <Area type="monotone" dataKey="CANDIDATE" name="Candidates" stroke="#8884d8" fillOpacity={1} fill="url(#colorCandidate)" />
        <Area type="monotone" dataKey="AGENCY" name="Agencies" stroke="#82ca9d" fillOpacity={1} fill="url(#colorAgency)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};