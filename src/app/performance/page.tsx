import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Customer, Flock, DailyRecord } from '@/lib/types';
import { getUserProfile } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import PerformanceContent from './PerformanceContent';

export interface CustomerPerformance {
  customerId: number;
  customerName: string;
  flockCount: number;
  avgHd: number;
  avgHh: number;
  mortalityRate: number;
  totalEggs: number;
  avgFeedG: number;
  dailyData: { date: string; avgHd: number; mortality: number }[];
}

export default async function PerformancePage() {
  const supabase = await createClient();

  // Only Admin and Manager can access this page
  const profile = await getUserProfile(supabase);
  if (!profile || (profile.role !== 'Admin' && profile.role !== 'Manager')) {
    redirect('/');
  }

  // Fetch all active customers and their flocks
  const [{ data: customers }, { data: flocks }, { data: records }] = await Promise.all([
    supabase.from('customers').select('*').eq('status', 'Active').order('customer_name'),
    supabase.from('flocks').select('*').eq('status', 'Active'),
    supabase.from('daily_records').select('*').order('record_date', { ascending: true }),
  ]);

  const customerList = (customers ?? []) as Customer[];
  const flockList = (flocks ?? []) as Flock[];
  const recordList = (records ?? []) as DailyRecord[];

  // Build flock -> customer mapping
  const flockToCustomer = new Map<number, number>();
  const customerFlockCount = new Map<number, number>();
  for (const f of flockList) {
    flockToCustomer.set(f.id, f.customer_id);
    customerFlockCount.set(f.customer_id, (customerFlockCount.get(f.customer_id) ?? 0) + 1);
  }

  // Build initial birds per flock
  const flockInitialBirds = new Map<number, number>();
  for (const f of flockList) {
    flockInitialBirds.set(f.id, f.initial_birds);
  }

  // Group records by customer
  const customerRecords = new Map<number, DailyRecord[]>();
  for (const r of recordList) {
    const custId = flockToCustomer.get(r.flock_id);
    if (custId === undefined) continue;
    const arr = customerRecords.get(custId) ?? [];
    arr.push(r);
    customerRecords.set(custId, arr);
  }

  // Calculate performance per customer
  const performanceData: CustomerPerformance[] = customerList.map((c) => {
    const recs = customerRecords.get(c.id) ?? [];

    const hdValues = recs.filter((r) => r.hd_ratio != null).map((r) => r.hd_ratio!);
    const hhValues = recs.filter((r) => r.hh_ratio != null).map((r) => r.hh_ratio!);
    const feedGValues = recs.filter((r) => r.avg_feed_g != null).map((r) => r.avg_feed_g!);

    const avgHd = hdValues.length > 0
      ? Math.round((hdValues.reduce((a, b) => a + b, 0) / hdValues.length) * 100) / 100
      : 0;
    const avgHh = hhValues.length > 0
      ? Math.round((hhValues.reduce((a, b) => a + b, 0) / hhValues.length) * 100) / 100
      : 0;
    const avgFeedG = feedGValues.length > 0
      ? Math.round((feedGValues.reduce((a, b) => a + b, 0) / feedGValues.length) * 100) / 100
      : 0;

    const totalMortality = recs.reduce((s, r) => s + r.mortality, 0);
    const totalInitialBirds = flockList
      .filter((f) => f.customer_id === c.id)
      .reduce((s, f) => s + f.initial_birds, 0);
    const mortalityRate = totalInitialBirds > 0
      ? Math.round((totalMortality / totalInitialBirds) * 10000) / 100
      : 0;

    const totalEggs = recs.reduce((s, r) => s + r.egg_count, 0);

    // Daily aggregation for trend charts
    const byDate = new Map<string, { hdArr: number[]; mortality: number }>();
    for (const r of recs) {
      const d = byDate.get(r.record_date) ?? { hdArr: [], mortality: 0 };
      if (r.hd_ratio != null) d.hdArr.push(r.hd_ratio);
      d.mortality += r.mortality;
      byDate.set(r.record_date, d);
    }
    const dailyData = Array.from(byDate.entries()).map(([date, d]) => ({
      date,
      avgHd: d.hdArr.length > 0 ? Math.round((d.hdArr.reduce((a, b) => a + b, 0) / d.hdArr.length) * 100) / 100 : 0,
      mortality: d.mortality,
    }));

    return {
      customerId: c.id,
      customerName: c.customer_name,
      flockCount: customerFlockCount.get(c.id) ?? 0,
      avgHd,
      avgHh,
      mortalityRate,
      totalEggs,
      avgFeedG,
      dailyData,
    };
  });

  // Sort by avgHd descending
  performanceData.sort((a, b) => b.avgHd - a.avgHd);

  return (
    <div className="md:ml-64">
      <Navbar />
      <PerformanceContent data={performanceData} />
    </div>
  );
}
