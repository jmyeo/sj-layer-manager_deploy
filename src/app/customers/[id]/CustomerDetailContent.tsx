'use client';

import Link from 'next/link';
import type { Customer, Flock } from '@/lib/types';
import { getWeekAge } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import EmptyState from '@/components/EmptyState';
import FlockActions from './FlockActions';

interface Props {
  customer: Customer;
  flocks: Flock[];
}

export default function CustomerDetailContent({ customer: c, flocks }: Props) {
  const { t } = useTranslation();

  return (
    <main className="px-4 py-6 pb-20 md:pb-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/customers" className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-border hover:bg-gray-50">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{c.customer_name}</h1>
            <p className="text-sm text-muted mt-0.5">{c.farm_name}</p>
          </div>
        </div>
        <FlockActions customerId={c.id} />
      </div>

      <div className="bg-white rounded-xl border border-border p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted">{t('customers.region')}</span>
            <p className="font-medium">{c.region || '-'}</p>
          </div>
          <div>
            <span className="text-muted">{t('customers.contact')}</span>
            <p className="font-medium">{c.contact_name || '-'}</p>
          </div>
          <div>
            <span className="text-muted">{t('customers.contactPhone')}</span>
            <p className="font-medium">{c.contact_phone || '-'}</p>
          </div>
          <div>
            <span className="text-muted">{t('customers.status')}</span>
            <p className={`font-medium ${c.status === 'Active' ? 'text-green-600' : 'text-gray-500'}`}>
              {c.status === 'Active' ? t('common.active') : t('common.inactive')}
            </p>
          </div>
          <div>
            <span className="text-muted">{t('customers.flocks')}</span>
            <p className="font-medium">{flocks.length}</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-3">{t('flocks.title')}</h2>
      {flocks.length === 0 ? (
        <EmptyState title={t('flocks.noFlocks')} description={t('flocks.addFlock')} />
      ) : (
        <div className="space-y-3">
          {flocks.map((flock) => {
            const weekAge = getWeekAge(flock.placement_date);
            return (
              <Link key={flock.id} href={`/flocks/${flock.id}`} className="block bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {flock.flock_name ? `${flock.flock_name} - ${flock.breed}` : flock.breed}
                    </h3>
                    <p className="text-sm text-muted mt-0.5">
                      {t('flocks.placementDate')}: {flock.placement_date} &middot; {weekAge} {t('flocks.age')}
                    </p>
                    <p className="text-sm text-muted mt-0.5">
                      {t('flocks.initialBirds')}: {flock.initial_birds.toLocaleString()}
                    </p>
                  </div>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                    flock.status === 'Active' ? 'bg-green-50 text-green-700' :
                    flock.status === 'Completed' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                  }`}>{flock.status}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
