'use client';

import Link from 'next/link';
import { useState } from 'react';
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
  const [showAlertList, setShowAlertList] = useState(false);

  return (
    <main className="px-4 py-6 pb-20 md:pb-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-sm text-muted mt-1">{t('dashboard.subtitle')}</p>
      </div>

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

        {/* Mortality Increase Card */}
        <button
          onClick={() => setShowAlertList(!showAlertList)}
          className={`rounded-xl border p-4 text-left hover:shadow-md transition-shadow ${
            mortalityAlerts.length > 0
              ? 'bg-red-50 border-red-200'
              : 'bg-white border-border'
          }`}
        >
          <p className="text-xs text-muted uppercase tracking-wide">{t('dashboard.mortalityIncrease')}</p>
          <p className={`text-3xl font-bold mt-1 ${mortalityAlerts.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {mortalityAlerts.length}
          </p>
          <p className="text-xs text-muted mt-1">
            {mortalityAlerts.length > 0 ? t('dashboard.mortalityFarms') : t('mortality.allNormal')}
          </p>
        </button>
      </div>

      {/* Mortality Alert Detail List (toggle) */}
      {showAlertList && mortalityAlerts.length > 0 && (
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
