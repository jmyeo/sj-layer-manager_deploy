'use client';

import Link from 'next/link';
import type { Customer, Flock, DailyRecord } from '@/lib/types';
import { getWeekAge } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import EmptyState from '@/components/EmptyState';
import FlockActions from './FlockActions';

interface Props {
  customer: Customer;
  flocks: Flock[];
  recentRecords: DailyRecord[];
  flockNameMap: Record<number, string>;
}

export default function CustomerDetailContent({ customer: c, flocks, recentRecords, flockNameMap }: Props) {
  const { t } = useTranslation();

  // Calculate 7-day summary
  const validHd = recentRecords.filter((r) => r.hd_ratio != null);
  const validHh = recentRecords.filter((r) => r.hh_ratio != null);
  const avgHd = validHd.length > 0
    ? Math.round((validHd.reduce((s, r) => s + (r.hd_ratio ?? 0), 0) / validHd.length) * 100) / 100
    : 0;
  const avgHh = validHh.length > 0
    ? Math.round((validHh.reduce((s, r) => s + (r.hh_ratio ?? 0), 0) / validHh.length) * 100) / 100
    : 0;
  const totalMortality = recentRecords.reduce((s, r) => s + r.mortality, 0);
  const totalEggs = recentRecords.reduce((s, r) => s + r.egg_count, 0);

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

      {/* Customer Info */}
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

      {/* Last 7 Days Summary */}
      <h2 className="text-lg font-bold mb-3">{t('customerDetail.last7days')}</h2>
      {recentRecords.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-6 text-center mb-6">
          <p className="text-sm text-muted">{t('customerDetail.noRecords')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-muted">{t('customerDetail.avgHd')}</p>
            <p className="text-2xl font-bold text-success mt-1">{avgHd}%</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-muted">{t('customerDetail.avgHh')}</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{avgHh}%</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-muted">{t('customerDetail.totalMortality')}</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{totalMortality.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-muted">{t('customerDetail.totalEggs')}</p>
            <p className="text-2xl font-bold mt-1">{totalEggs.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Recent Daily Records Table */}
      {recentRecords.length > 0 && (
        <>
          <h2 className="text-lg font-bold mb-3">{t('customerDetail.recentRecords')}</h2>
          <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50">
                    <th className="text-left px-4 py-2.5 font-medium text-muted">{t('customerDetail.date')}</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted">{t('customerDetail.flock')}</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted">{t('customerDetail.mortality')}</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted">{t('customerDetail.eggs')}</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted">{t('customerDetail.hd')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRecords.slice(0, 10).map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5">{r.record_date}</td>
                      <td className="px-4 py-2.5 truncate max-w-[120px]">{flockNameMap[r.flock_id] ?? '-'}</td>
                      <td className="px-4 py-2.5 text-right text-red-600">{r.mortality}</td>
                      <td className="px-4 py-2.5 text-right">{r.egg_count.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right">{r.hd_ratio != null ? `${r.hd_ratio}%` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* View Report Button */}
      <div className="mb-6">
        <Link
          href={`/reports/${c.id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {t('customerDetail.viewReport')}
        </Link>
      </div>

      {/* Flocks */}
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
