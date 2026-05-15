import { createClient } from '@/lib/supabase/server';
import { getUserProfile, canAccessAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { AuditLog } from '@/lib/types';
import Navbar from '@/components/Navbar';
import AuditContent from './AuditContent';

export default async function AuditPage() {
  const supabase = await createClient();

  let profile;
  try {
    profile = await getUserProfile(supabase);
  } catch {
    redirect('/');
  }

  if (!profile || !canAccessAdmin(profile.role)) {
    redirect('/');
  }

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  const auditLogs = (logs ?? []) as AuditLog[];

  return (
    <div className="md:ml-64">
      <Navbar />
      <main className="px-4 py-6 pb-20 md:pb-6 max-w-5xl mx-auto">
        <AuditContent logs={auditLogs} />
      </main>
    </div>
  );
}
