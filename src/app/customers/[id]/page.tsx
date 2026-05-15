import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Customer, Flock } from '@/lib/types';
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

  return (
    <div className="md:ml-64">
      <Navbar />
      <CustomerDetailContent
        customer={c}
        flocks={(flocks ?? []) as Flock[]}
      />
    </div>
  );
}
