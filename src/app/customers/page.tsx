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
            <CustomersContent customers={[]} showAddButton={false} />
          </div>
        );
      }
      query = query.in('id', filter.ids);
    }
  }

  const { data: customers } = await query;
  const showAddButton = profile ? canEditData(profile.role) : true;

  return (
    <div className="md:ml-64">
      <Navbar />
      <CustomersContent
        customers={(customers ?? []) as Customer[]}
        showAddButton={showAddButton}
      />
    </div>
  );
}
