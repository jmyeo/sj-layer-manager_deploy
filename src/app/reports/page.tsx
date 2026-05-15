import { createClient } from '@/lib/supabase/server';
import type { Customer } from '@/lib/types';
import Navbar from '@/components/Navbar';
import ReportsContent from './ReportsContent';

export default async function ReportsPage() {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('status', 'Active')
    .order('customer_name');

  return (
    <div className="md:ml-64">
      <Navbar />
      <ReportsContent customers={(customers ?? []) as Customer[]} />
    </div>
  );
}
