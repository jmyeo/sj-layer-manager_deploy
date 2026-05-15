import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Customer, Flock, DailyRecord } from '@/lib/types';
import Navbar from '@/components/Navbar';
import CustomerReportContent from './CustomerReportContent';

interface Props {
  params: Promise<{ customerId: string }>;
}

export default async function CustomerReportPage({ params }: Props) {
  const { customerId } = await params;
  const custId = parseInt(customerId, 10);
  const supabase = await createClient();

  // Fetch customer and flocks in parallel
  const [{ data: customer }, { data: flocks }] = await Promise.all([
    supabase.from('customers').select('*').eq('id', custId).single(),
    supabase.from('flocks').select('*').eq('customer_id', custId).order('placement_date', { ascending: false }),
  ]);

  if (!customer) notFound();
  const c = customer as Customer;
  const flockList = (flocks ?? []) as Flock[];
  const flockIds = flockList.map((f) => f.id);

  let allRecords: DailyRecord[] = [];
  if (flockIds.length > 0) {
    const { data: records } = await supabase
      .from('daily_records')
      .select('*')
      .in('flock_id', flockIds)
      .order('record_date', { ascending: true });

    allRecords = (records ?? []) as DailyRecord[];
  }

  return (
    <div className="md:ml-64">
      <Navbar />
      <CustomerReportContent
        customer={c}
        flocks={flockList}
        records={allRecords}
      />
    </div>
  );
}
