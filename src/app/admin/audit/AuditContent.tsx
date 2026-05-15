'use client';

import type { AuditLog } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import EmptyState from '@/components/EmptyState';

interface Props {
  logs: AuditLog[];
}

export default function AuditContent({ logs }: Props) {
  const { t } = useTranslation();

  if (logs.length === 0) {
    return <EmptyState title={t('audit.noLogs')} description={t('audit.changesAppear')} />;
  }

  return (
    <>
      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                log.action === 'INSERT' ? 'bg-green-50 text-green-700' :
                log.action === 'UPDATE' ? 'bg-blue-50 text-blue-700' :
                'bg-red-50 text-red-700'
              }`}>{log.action}</span>
              <span className="text-xs text-muted">{new Date(log.created_at).toLocaleString()}</span>
            </div>
            <p className="text-sm font-medium">{log.table_name} #{log.record_id}</p>
            <p className="text-xs text-muted mt-1">{log.user_email ?? 'System'}</p>
            {log.action === 'UPDATE' && log.old_data && log.new_data && (
              <div className="mt-2 text-xs space-y-1">
                {Object.keys(log.new_data).map((key) => {
                  const oldVal = (log.old_data as Record<string, unknown>)?.[key];
                  const newVal = (log.new_data as Record<string, unknown>)?.[key];
                  if (JSON.stringify(oldVal) === JSON.stringify(newVal)) return null;
                  return (
                    <div key={key} className="flex gap-2">
                      <span className="text-muted">{key}:</span>
                      <span className="text-red-500 line-through">{String(oldVal ?? '')}</span>
                      <span className="text-green-600">{String(newVal ?? '')}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm bg-white rounded-xl border border-border overflow-hidden">
          <thead>
            <tr className="bg-gray-50 text-left text-muted border-b border-border">
              <th className="px-4 py-3 font-medium">{t('chart.date')}</th>
              <th className="px-4 py-3 font-medium">{t('login.email')}</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Table</th>
              <th className="px-4 py-3 font-medium">Record</th>
              <th className="px-4 py-3 font-medium">Changes</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-xs">{log.user_email ?? '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    log.action === 'INSERT' ? 'bg-green-50 text-green-700' :
                    log.action === 'UPDATE' ? 'bg-blue-50 text-blue-700' :
                    'bg-red-50 text-red-700'
                  }`}>{log.action}</span>
                </td>
                <td className="px-4 py-3">{log.table_name}</td>
                <td className="px-4 py-3">#{log.record_id}</td>
                <td className="px-4 py-3 text-xs max-w-xs truncate">
                  {log.action === 'INSERT' && t('audit.newRecord')}
                  {log.action === 'UPDATE' && log.old_data && log.new_data &&
                    Object.keys(log.new_data).filter(k => {
                      const o = (log.old_data as Record<string, unknown>)?.[k];
                      const n = (log.new_data as Record<string, unknown>)?.[k];
                      return JSON.stringify(o) !== JSON.stringify(n);
                    }).join(', ')
                  }
                  {log.action === 'DELETE' && t('audit.deleted')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
