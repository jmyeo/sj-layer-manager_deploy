import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { DailyRecord, Flock } from './types';

export function exportToExcel(
  records: DailyRecord[],
  flocks: Flock[],
  filename: string
) {
  const flockMap = new Map(flocks.map((f) => [f.id, f]));

  const rows = records.map((r) => {
    const flock = flockMap.get(r.flock_id);
    return {
      Date: r.record_date,
      Breed: flock?.breed ?? '',
      'Previous Birds': r.previous_birds,
      Mortality: r.mortality,
      'Current Birds': r.current_birds,
      'Feed (kg)': r.feed_kg,
      'Egg Count': r.egg_count,
      'HD Ratio (%)': r.hd_ratio,
      'HH Ratio (%)': r.hh_ratio,
      'Avg Feed (g)': r.avg_feed_g,
      Memo: r.memo ?? '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Daily Records');

  // Auto column widths
  const colWidths = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(key.length, 12),
  }));
  ws['!cols'] = colWidths;

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/octet-stream' });
  saveAs(blob, `${filename}.xlsx`);
}
