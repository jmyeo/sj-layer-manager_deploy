'use client';

import Link from 'next/link';
import type { Customer } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import EmptyState from '@/components/EmptyState';
import CustomerActions from './CustomerActions';

interface Props {
  customers: Customer[];
  showAddButton: boolean;
}

export default function CustomersContent({ customers, showAddButton }: Props) {
  const { t } = useTranslation();

  return (
    <main className="px-4 py-6 pb-20 md:pb-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('customers.title')}</h1>
          <p className="text-sm text-muted mt-0.5">{t('customers.subtitle')}</p>
        </div>
        {showAddButton && <CustomerActions />}
      </div>

      {customers.length === 0 ? (
        <EmptyState title={t('customers.noCustomers')} description={t('customers.addFirst')} />
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className="block bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{customer.customer_name}</h3>
                  <p className="text-sm text-muted mt-0.5">{customer.farm_name}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                    {customer.region && <span>{customer.region}</span>}
                    {customer.contact_name && <span>{customer.contact_name}</span>}
                  </div>
                </div>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                  customer.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {customer.status === 'Active' ? t('common.active') : t('common.inactive')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
