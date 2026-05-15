'use client';

import Link from 'next/link';
import type { Customer } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

interface Props {
  customers: Customer[];
}

export default function ReportsContent({ customers }: Props) {
  const { t } = useTranslation();

  return (
    <main className="px-4 py-6 pb-20 md:pb-6 max-w-4xl mx-auto">
      <PageHeader title={t('reports.title')} subtitle={t('reports.subtitle')} />

      {customers.length === 0 ? (
        <EmptyState
          title={t('reports.noCustomers')}
          description={t('reports.addData')}
        />
      ) : (
        <div className="space-y-3">
          {customers.map((c) => (
            <Link
              key={c.id}
              href={`/reports/${c.id}`}
              className="block bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900">{c.customer_name}</h3>
              <p className="text-sm text-muted mt-0.5">{c.farm_name}</p>
              {c.region && <p className="text-xs text-muted mt-1">{c.region}</p>}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
