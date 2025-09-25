import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import type { FunnelDataPoint } from '../../../types/analytics';

interface ChartProps {
  data: FunnelDataPoint[];
}

export const ApplicationFunnelChart = ({ data }: ChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="stage"
          width={100}
          tickLine={false}
          axisLine={false}
          fontSize={14}
        />
        <Tooltip
          cursor={{ fill: '#f9fafb' }}
          contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0' }}
          formatter={(_value, _name, props) => [`${props.payload.count} applicants`, `${props.payload.conversion}% conversion`]}
        />
        <Bar dataKey="count" name="Applicants" fill="#16a34a" barSize={40}>
          <LabelList
            dataKey="count"
            position="right"
            style={{ fill: '#1f2937', fontWeight: 'bold', fontSize: '14px' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};