import { format, parseISO } from 'date-fns';
import type { UserGrowthDataPoint } from '../../../types/analytics';

interface TableProps {
  data: UserGrowthDataPoint[];
}

export const UserGrowthTable = ({ data }: TableProps) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 p-8">No data available for the selected period.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Candidates</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Agencies</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Signups</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((row) => (
            <tr key={row.date} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{format(parseISO(row.date), 'MMM d, yyyy')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.CANDIDATE.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.AGENCY.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">{(row.CANDIDATE + row.AGENCY).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};