'use client';

import { useState } from 'react';
import { exportToExcel } from '@/lib/export-excel';
import type { DailyRecord, Flock, Customer } from '@/lib/types';

interface Props {
  records: DailyRecord[];
  flocks: Flock[];
  customer: Customer;
}

export default function ExportButtons({ records, flocks, customer }: Props) {
  const [exporting, setExporting] = useState(false);

  const handleExcel = () => {
    setExporting(true);
    try {
      const filename = `${customer.customer_name}_report_${new Date().toISOString().split('T')[0]}`;
      exportToExcel(records, flocks, filename);
    } finally {
      setExporting(false);
    }
  };

  const handleCSV = () => {
    // Simple CSV export as PDF alternative (react-pdf has SSR issues in Next.js)
    const headers = ['Date', 'Breed', 'Prev Birds', 'Mortality', 'Current Birds', 'Feed(kg)', 'Eggs', 'HD%', 'HH%', 'Feed(g)', 'Memo'];
    const flockMap = new Map(flocks.map(f => [f.id, f]));
    const rows = records.map(r => {
      const flock = flockMap.get(r.flock_id);
      return [
        r.record_date, flock?.breed ?? '', r.previous_birds, r.mortality,
        r.current_birds, r.feed_kg, r.egg_count, r.hd_ratio ?? '',
        r.hh_ratio ?? '', r.avg_feed_g ?? '', r.memo ?? ''
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customer.customer_name}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (records.length === 0) return null;

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExcel}
        disabled={exporting}
        className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        Excel
      </button>
      <button
        onClick={handleCSV}
        className="px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors"
      >
        CSV
      </button>
    </div>
  );
}
