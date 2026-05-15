import { SupabaseClient } from '@supabase/supabase-js';

interface AuditEntry {
  tableName: string;
  recordId: number;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
}

export async function logAudit(
  supabase: SupabaseClient,
  entry: AuditEntry
) {
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from('audit_logs').insert({
    user_id: user?.id ?? null,
    user_email: user?.email ?? null,
    table_name: entry.tableName,
    record_id: entry.recordId,
    action: entry.action,
    old_data: entry.oldData ?? null,
    new_data: entry.newData ?? null,
  });
}
