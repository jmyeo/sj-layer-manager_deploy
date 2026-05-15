import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Flock, DailyRecord, Customer } from '@/lib/types';
import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import DailyRecordForm from './DailyRecordForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RecordPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch flock with customer
  const { data: flock } = await supabase
    .from('flocks')
    .select('*, customer:customers(*)')
    .eq('id', parseInt(id, 10))
    .single();

  if (!flock) notFound();
  const f = flock as Flock & { customer: Customer };

  // Get latest record (for previous_birds auto-fill)
  const { data: latestRecordData } = await supabase
    .from('daily_records')
    .select('*')
    .eq('flock_id', f.id)
    .order('record_date', { ascending: false })
    .limit(1)
    .single();

  const latestRecord = (latestRecordData as DailyRecord) ?? null;

  // Get all existing dates for duplicate prevention
  const { data: existingRecords } = await supabase
    .from('daily_records')
    .select('record_date')
    .eq('flock_id', f.id);

  const existingDates = (existingRecords ?? []).map(
    (r: { record_date: string }) => r.record_date
  );

  return (
    <div className="md:ml-64">
      <Navbar />
      <main className="px-4 py-6 pb-20 md:pb-6 max-w-lg mx-auto">
        <PageHeader
          title="New Daily Record"
          subtitle={`${f.breed} - ${f.customer.farm_name}`}
          backHref={`/flocks/${f.id}`}
        />

        <DailyRecordForm
          flock={f}
          latestRecord={latestRecord}
          existingDates={existingDates}
        />
      </main>
    </div>
  );
}
