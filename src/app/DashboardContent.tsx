'use client';

import Link from 'next/link';
import type { Flock, Customer } from '@/lib/types';
import { getWeekAge } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import type { MortalityAlert } from './page';

interface Props {
  customerCount: number;
  flockCount: number;
  completionRate: number;
  todayRecordCount: number;
  avgHd: number;
  avgHh: number;
  activeFlocks: (Flock & { customer: Customer })[];
  flocksWithTodayRecord: number[];
  mortalityAlerts: MortalityAlert[];
}

export default function DashboardContent({
  customerCount, flockCount, completionRate, todayRecordCount,
  avgHd, avgHh, activeFlocks, flocksWithTodayRecord, mortalityAlerts,
}: Props) {
  const { t } = useTranslation();
  const todaySet = new Set(flocksWithTodayRecord);

  return (
    <main className="px-4 py-6 pb-20 md:pb-6 max-w-4xl mx-auto">
      {/* Mortality Increase Alerts */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{t('mortality.title')}</h1>
        <p className="text-sm text-muted mt-0.5">{t('mortality.subtitle')}</p>
      </div>

      {mortalityAlerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-6 text-center mb-6">
          <svg className="w-10 h-10 text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-muted">{t('mortality.allNormal')}</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {mortalityAlerts.map((alert) => (
            <Link
              key={alert.flockId}
              href={`/flocks/${alert.flockId}`}
              className="block bg-white rounded-xl border border-red-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{alert.flockName}</h3>
                  <p className="text-sm text-muted mt-0.5">{alert.customerName}</p>
                </div>
                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                  +{alert.increase}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-muted">{t('mortality.yesterday')}</p>
                  <p className="text-sm font-semibold">{alert.yesterdayMortality}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2">
                  <p className="text-xs text-muted">{t('mortality.today')}</p>
                  <p className="text-sm font-semibold text-red-700">{alert.todayMortality}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2">
                  <p className="text-xs text-muted">{t('mortality.increase')}</p>
                  <p className="text-sm font-bold text-red-700">+{alert.increase}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <Link href="/customers" className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
          <p className="text-xs text-muted uppercase tracking-wide">{t('dashboard.customers')}</p>
          <p className="text-3xl font-bold mt-1">{customerCount}</p>
        </Link>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted uppercase tracking-wide">{t('dashboard.activeFlocks')}</p>
          <p className="text-3xl font-bold mt-1">{flockCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted uppercase tracking-wide">{t('dashboard.todayCompletion')}</p>
          <p className="text-3xl font-bold mt-1 text-primary">{completionRate}%</p>
          <p className="text-xs text-muted mt-1">{todayRecordCount} / {flockCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted uppercase tracking-wide">{t('dashboard.avgHd')}</p>
          <p className="text-3xl font-bold mt-1 text-success">{avgHd}%</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted uppercase tracking-wide">{t('dashboard.avgHh')}</p>
          <p className="text-3xl font-bold mt-1 text-blue-600">{avgHh}%</p>
        </div>
        <Link href="/reports" className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow flex flex-col items-center justify-center">
          <svg className="w-8 h-8 text-primary mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-sm font-semibold text-primary">{t('dashboard.viewReports')}</span>
        </Link>
      </div>

      {/* Quick Entry */}
      <h2 className="text-lg font-bold mb-3">{t('dashboard.quickEntry')}</h2>
      <p className="text-sm text-muted mb-4">{t('dashboard.quickEntryDesc')}</p>

      {activeFlocks.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <p className="text-muted">{t('dashboard.noFlocks')}</p>
          <Link href="/customers" className="text-primary text-sm font-medium hover:underline mt-2 inline-block">
            {t('dashboard.addCustomerFirst')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {activeFlocks.map((flock) => {
            const hasToday = todaySet.has(flock.id);
            const weekAge = getWeekAge(flock.placement_date);
            return (
              <div key={flock.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{flock.breed}</h3>
                  <p className="text-sm text-muted truncate">
                    {flock.customer.farm_name} &middot; {weekAge}{t('flocks.age')}
                  </p>
                </div>
                {hasToday ? (
                  <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg">
                    {t('common.done')}
                  </span>
                ) : (
                  <Link href={`/flocks/${flock.id}/record`} className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors">
                    + {t('record.addRecord')}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
