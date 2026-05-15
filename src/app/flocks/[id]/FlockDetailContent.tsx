'use client';

import Link from 'next/link';
import type { Flock, DailyRecord, Customer } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import EmptyState from '@/components/EmptyState';

interface Props {
  flock: Flock & { customer: Customer };
  dailyRecords: DailyRecord[];
  weekAge: number;
  currentBirds: number;
  totalMortality: number;
  latestHdRatio: number | null;
}

export default function FlockDetailContent({ flock: f, dailyRecords, weekAge, currentBirds, totalMortality, latestHdRatio }: Props) {
  const { t } = useTranslation();

  return (
    <main className="px-4 py-6 pb-20 md:pb-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/customers/${f.customer_id}`} className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-border hover:bg-gray-50">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{f.breed}</h1>
            <p className="text-sm text-muted mt-0.5">{f.customer.customer_name} - {f.customer.farm_name}</p>
          </div>
        </div>
        <Link href={`/flocks/${f.id}/record`} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors">
          + {t('record.addRecord')}
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted uppercase tracking-wide">{t('flocks.age')}</p>
          <p className="text-2xl font-bold mt-1">{weekAge}<span className="text-sm text-muted ml-1">wks</span></p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted uppercase tracking-wide">{t('flocks.currentBirds')}</p>
          <p className="text-2xl font-bold mt-1">{currentBirds.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted uppercase tracking-wide">{t('flocks.totalMortality')}</p>
          <p className="text-2xl font-bold mt-1 text-danger">{totalMortality.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted uppercase tracking-wide">{t('flocks.hdRatio')}</p>
          <p className="text-2xl font-bold mt-1 text-success">{latestHdRatio != null ? `${latestHdRatio}%` : '-'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted">{t('flocks.placementDate')}</span>
            <p className="font-medium">{f.placement_date}</p>
          </div>
          <div>
            <span className="text-muted">{t('flocks.initialBirds')}</span>
            <p className="font-medium">{f.initial_birds.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-muted">{t('customers.status')}</span>
            <p className={`font-medium ${f.status === 'Active' ? 'text-green-600' : 'text-gray-500'}`}>{f.status}</p>
          </div>
          <div>
            <span className="text-muted">{t('reports.totalRecords')}</span>
            <p className="font-medium">{dailyRecords.length}</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-3">{t('record.dailyRecords')}</h2>
      {dailyRecords.length === 0 ? (
        <EmptyState title={t('record.noRecords')} description="" action={
          <Link href={`/flocks/${f.id}/record`} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark">
            {t('record.addRecord')}
          </Link>
        } />
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {dailyRecords.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{r.record_date}</span>
                  <span className="text-xs text-muted">{t('flocks.currentBirds')}: {r.current_birds.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div><p className="text-muted text-xs">{t('chart.mortality')}</p><p className="font-semibold text-danger">{r.mortality}</p></div>
                  <div><p className="text-muted text-xs">{t('chart.eggs')}</p><p className="font-semibold">{r.egg_count.toLocaleString()}</p></div>
                  <div><p className="text-muted text-xs">{t('chart.hdRatio')}</p><p className="font-semibold text-success">{r.hd_ratio ?? '-'}</p></div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-sm mt-2">
                  <div><p className="text-muted text-xs">{t('chart.feedKg')}</p><p className="font-semibold">{r.feed_kg}</p></div>
                  <div><p className="text-muted text-xs">{t('chart.hhRatio')}</p><p className="font-semibold">{r.hh_ratio ?? '-'}</p></div>
                  <div><p className="text-muted text-xs">{t('chart.feedPerBird')}</p><p className="font-semibold">{r.avg_feed_g ?? '-'}</p></div>
                </div>
                {r.memo && <p className="text-xs text-muted mt-2 border-t border-border pt-2">{r.memo}</p>}
              </div>
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-border">
                  <th className="pb-3 pr-4 font-medium">{t('chart.date')}</th>
                  <th className="pb-3 pr-4 font-medium text-right">{t('flocks.currentBirds')}</th>
                  <th className="pb-3 pr-4 font-medium text-right">{t('chart.mortality')}</th>
                  <th className="pb-3 pr-4 font-medium text-right">{t('chart.eggs')}</th>
                  <th className="pb-3 pr-4 font-medium text-right">{t('chart.feedKg')}</th>
                  <th className="pb-3 pr-4 font-medium text-right">{t('chart.hdRatio')}</th>
                  <th className="pb-3 pr-4 font-medium text-right">{t('chart.hhRatio')}</th>
                  <th className="pb-3 font-medium text-right">{t('chart.feedPerBird')}</th>
                </tr>
              </thead>
              <tbody>
                {dailyRecords.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-medium">{r.record_date}</td>
                    <td className="py-3 pr-4 text-right">{r.current_birds.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-right text-danger">{r.mortality}</td>
                    <td className="py-3 pr-4 text-right">{r.egg_count.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-right">{r.feed_kg}</td>
                    <td className="py-3 pr-4 text-right text-success font-medium">{r.hd_ratio ?? '-'}</td>
                    <td className="py-3 pr-4 text-right">{r.hh_ratio ?? '-'}</td>
                    <td className="py-3 text-right">{r.avg_feed_g ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
