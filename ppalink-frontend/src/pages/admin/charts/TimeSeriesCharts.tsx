import { format, parseISO } from 'date-fns';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AdminTimeSeriesData } from '../../../types/analytics';

interface ChartProps {
  data: AdminTimeSeriesData;
}

// Helper to process the raw backend data into a format Recharts can use
const processDataForChart = (rawData: AdminTimeSeriesData) => {
    const dailyData: { [key: string]: any } = {};

    rawData.userSignups.forEach(item => {
        const day = format(parseISO(item.createdAt), 'MMM d');
        if (!dailyData[day]) dailyData[day] = { date: day, Candidates: 0, Agencies: 0 };
        if (item.role === 'CANDIDATE') dailyData[day].Candidates += item._count._all;
        if (item.role === 'AGENCY') dailyData[day].Agencies += item._count._all;
    });

    rawData.jobsPosted.forEach(item => {
        const day = format(parseISO(item.createdAt), 'MMM d');
        if (!dailyData[day]) dailyData[day] = { date: day };
        dailyData[day].Jobs = (dailyData[day].Jobs || 0) + item._count._all;
    });

     rawData.applicationsSubmitted.forEach(item => {
        const day = format(parseISO(item.createdAt), 'MMM d');
        if (!dailyData[day]) dailyData[day] = { date: day };
        dailyData[day].Applications = (dailyData[day].Applications || 0) + item._count._all;
    });

    return Object.values(dailyData).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const AdminTimeSeriesChart = ({ data }: ChartProps) => {
  const chartData = processDataForChart(data);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorAgencies" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0' }} />
        <Area type="monotone" dataKey="Candidates" stroke="#8884d8" fillOpacity={1} fill="url(#colorCandidates)" />
        <Area type="monotone" dataKey="Agencies" stroke="#82ca9d" fillOpacity={1} fill="url(#colorAgencies)" />
        <Area type="monotone" dataKey="Jobs" stroke="#ffc658" fill="transparent" />
      </AreaChart>
    </ResponsiveContainer>
  );
};