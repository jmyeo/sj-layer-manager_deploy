import { createClient } from '@/lib/supabase/server';
import type { Flock, Customer } from '@/lib/types';
import Navbar from '@/components/Navbar';
import DashboardContent from './DashboardContent';

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  // Run all queries in parallel
  const [
    { count: customerCount },
    { count: flockCount },
    { count: todayRecordCount },
    { data: latestRecords },
    { data: activeFlocks },
    { data: todayRecords },
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
    supabase.from('flocks').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
    supabase.from('daily_records').select('*', { count: 'exact', head: true }).eq('record_date', today),
    supabase.from('daily_records').select('flock_id, hd_ratio, hh_ratio, record_date').order('record_date', { ascending: false }),
    supabase.from('flocks').select('*, customer:customers(*)').eq('status', 'Active').order('created_at', { ascending: false }).limit(10),
    supabase.from('daily_records').select('flock_id').eq('record_date', today),
  ]);

  const completionRate =
    flockCount && flockCount > 0
      ? Math.round(((todayRecordCount ?? 0) / flockCount) * 100)
      : 0;

  const seenFlocks = new Set<number>();
  const uniqueLatest: { hd_ratio: number | null; hh_ratio: number | null }[] = [];
  for (const r of latestRecords ?? []) {
    if (!seenFlocks.has(r.flock_id)) {
      seenFlocks.add(r.flock_id);
      uniqueLatest.push(r);
    }
  }

  const validHd = uniqueLatest.filter((r) => r.hd_ratio != null);
  const validHh = uniqueLatest.filter((r) => r.hh_ratio != null);
  const avgHd = validHd.length > 0
    ? Math.round((validHd.reduce((s, r) => s + (r.hd_ratio ?? 0), 0) / validHd.length) * 100) / 100
    : 0;
  const avgHh = validHh.length > 0
    ? Math.round((validHh.reduce((s, r) => s + (r.hh_ratio ?? 0), 0) / validHh.length) * 100) / 100
    : 0;

  const flocksWithTodayRecord = (todayRecords ?? []).map((r: { flock_id: number }) => r.flock_id);

  return (
    <div className="md:ml-64">
      <Navbar />
      <DashboardContent
        customerCount={customerCount ?? 0}
        flockCount={flockCount ?? 0}
        completionRate={completionRate}
        todayRecordCount={todayRecordCount ?? 0}
        avgHd={avgHd}
        avgHh={avgHh}
        activeFlocks={(activeFlocks ?? []) as (Flock & { customer: Customer })[]}
        flocksWithTodayRecord={flocksWithTodayRecord}
      />
    </div>
  );
}
