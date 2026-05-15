import { createClient } from '@/lib/supabase/server';
import type { Customer } from '@/lib/types';
import { getUserProfile, buildCustomerFilter, canEditData } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import CustomersContent from './CustomersContent';

export default async function CustomersPage() {
  const supabase = await createClient();

  // Fetch profile and customers in parallel where possible
  const profile = await getUserProfile(supabase);

  let query = supabase.from('customers').select('*').order('created_at', { ascending: false });

  if (profile) {
    const filter = await buildCustomerFilter(supabase, profile);
    if (filter.mode === 'region' && filter.region) {
      query = query.eq('region', filter.region);
    } else if (filter.mode === 'ids') {
      if (filter.ids.length === 0) {
        return (
          <div className="md:ml-64">
            <Navbar />
            <CustomersContent customers={[]} showAddButton={false} flockCounts={{}} latestRecordDates={{}} />
          </div>
        );
      }
      query = query.in('id', filter.ids);
    }
  }

  const { data: customers } = await query;
  const showAddButton = profile ? canEditData(profile.role) : true;

  const customerIds = (customers ?? []).map((c: Customer) => c.id);

  // Fetch active flock counts
  const { data: flockData } = await supabase
    .from('flocks')
    .select('customer_id')
    .in('customer_id', customerIds.length > 0 ? customerIds : [0])
    .eq('status', 'Active');

  // Count active flocks per customer
  const flockCounts: Record<number, number> = {};
  for (const f of flockData ?? []) {
    flockCounts[f.customer_id] = (flockCounts[f.customer_id] || 0) + 1;
  }

  // Get latest record date per customer via flocks
  // We need to refetch using a different approach since flock_id != customer_id
  const { data: flocksList } = await supabase
    .from('flocks')
    .select('id, customer_id')
    .in('customer_id', customerIds.length > 0 ? customerIds : [0]);

  const flockToCustomer = new Map<number, number>();
  for (const f of flocksList ?? []) {
    flockToCustomer.set(f.id, f.customer_id);
  }

  const flockIds = (flocksList ?? []).map((f: { id: number }) => f.id);
  const { data: allRecords } = await supabase
    .from('daily_records')
    .select('flock_id, record_date')
    .in('flock_id', flockIds.length > 0 ? flockIds : [0])
    .order('record_date', { ascending: false });

  const latestRecordDates: Record<number, string> = {};
  for (const r of allRecords ?? []) {
    const custId = flockToCustomer.get(r.flock_id);
    if (custId && !latestRecordDates[custId]) {
      latestRecordDates[custId] = r.record_date;
    }
  }

  return (
    <div className="md:ml-64">
      <Navbar />
      <CustomersContent
        customers={(customers ?? []) as Customer[]}
        showAddButton={showAddButton}
        flockCounts={flockCounts}
        latestRecordDates={latestRecordDates}
      />
    </div>
  );
}
