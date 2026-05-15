import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Flock, DailyRecord, Customer } from '@/lib/types';
import { getWeekAge } from '@/lib/types';
import Navbar from '@/components/Navbar';
import FlockDetailContent from './FlockDetailContent';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FlockDetailPage({ params }: Props) {
  const { id } = await params;
  const flockId = parseInt(id, 10);
  const supabase = await createClient();

  // Fetch flock and records in parallel
  const [{ data: flock }, { data: records }] = await Promise.all([
    supabase.from('flocks').select('*, customer:customers(*)').eq('id', flockId).single(),
    supabase.from('daily_records').select('*').eq('flock_id', flockId).order('record_date', { ascending: false }),
  ]);

  if (!flock) notFound();
  const f = flock as Flock & { customer: Customer };
  const dailyRecords = (records ?? []) as DailyRecord[];
  const weekAge = getWeekAge(f.placement_date);
  const latestRecord = dailyRecords[0];
  const totalMortality = dailyRecords.reduce((sum, r) => sum + r.mortality, 0);
  const currentBirds = latestRecord?.current_birds ?? f.initial_birds;

  return (
    <div className="md:ml-64">
      <Navbar />
      <FlockDetailContent
        flock={f}
        dailyRecords={dailyRecords}
        weekAge={weekAge}
        currentBirds={currentBirds}
        totalMortality={totalMortality}
        latestHdRatio={latestRecord?.hd_ratio ?? null}
      />
    </div>
  );
}
