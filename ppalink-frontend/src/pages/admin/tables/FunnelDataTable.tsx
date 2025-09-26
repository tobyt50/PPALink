import type { FunnelDataPoint } from '../../../types/analytics';
import { TrendingDown } from 'lucide-react';

export const FunnelDataTable = ({ data }: { data: FunnelDataPoint[] }) => {
  return (
    <div className="flow-root">
      <ul className="-my-4 divide-y divide-gray-100">
        {data.map((item, index) => (
          <li key={item.stage} className="py-4">
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="font-semibold text-primary-600 dark:text-primary-400 truncate">{index + 1}. {item.stage}</div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-zinc-50">{item.count.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Applicants</p>
              </div>
              <div className="flex justify-end">
                {index > 0 && (
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${item.conversion >= 50 ? 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-950/60 text-red-800'}`}>
                     <TrendingDown className="h-4 w-4 mr-1"/>
                     {item.conversion}% Conversion
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
