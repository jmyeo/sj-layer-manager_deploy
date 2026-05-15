import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Customer, Flock, DailyRecord } from '@/lib/types';
import Navbar from '@/components/Navbar';
import CustomerDetailContent from './CustomerDetailContent';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', parseInt(id, 10))
    .single();

  if (!customer) notFound();
  const c = customer as Customer;

  const { data: flocks } = await supabase
    .from('flocks')
    .select('*')
    .eq('customer_id', c.id)
    .order('placement_date', { ascending: false });

  const flockIds = (flocks ?? []).map((f: Flock) => f.id);

  // Fetch last 7 days of records for this customer's flocks
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const { data: recentRecords } = await supabase
    .from('daily_records')
    .select('*')
    .in('flock_id', flockIds.length > 0 ? flockIds : [0])
    .gte('record_date', sevenDaysAgoStr)
    .order('record_date', { ascending: false });

  // Build flock name map
  const flockNameMap: Record<number, string> = {};
  for (const f of (flocks ?? []) as Flock[]) {
    flockNameMap[f.id] = f.flock_name ? `${f.flock_name} - ${f.breed}` : f.breed;
  }

  return (
    <div className="md:ml-64">
      <Navbar />
      <CustomerDetailContent
        customer={c}
        flocks={(flocks ?? []) as Flock[]}
        recentRecords={(recentRecords ?? []) as DailyRecord[]}
        flockNameMap={flockNameMap}
      />
    </div>
  );
}
