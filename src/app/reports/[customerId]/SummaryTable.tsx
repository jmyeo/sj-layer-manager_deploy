'use client';

import { useMemo } from 'react';
import type { DailyRecord, Flock } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';

interface Props {
  records: DailyRecord[];
  flocks: Flock[];
}

export default function SummaryTable({ records, flocks }: Props) {
  const { t } = useTranslation();

  const summary = useMemo(() => {
    if (records.length === 0) return null;

    const sorted = [...records].sort((a, b) => a.record_date.localeCompare(b.record_date));
    const initialBirds = flocks.reduce((s, f) => s + f.initial_birds, 0);
    const totalDays = sorted.length;

    const totalMortality = sorted.reduce((s, r) => s + r.mortality, 0);
    const totalEggs = sorted.reduce((s, r) => s + r.egg_count, 0);

    const hdValues = sorted.filter((r) => r.hd_ratio != null).map((r) => r.hd_ratio!);
    const hhValues = sorted.filter((r) => r.hh_ratio != null).map((r) => r.hh_ratio!);
    const feedGValues = sorted.filter((r) => r.avg_feed_g != null).map((r) => r.avg_feed_g!);

    const avgHd = hdValues.length > 0 ? Math.round((hdValues.reduce((a, b) => a + b, 0) / hdValues.length) * 100) / 100 : 0;
    const avgHh = hhValues.length > 0 ? Math.round((hhValues.reduce((a, b) => a + b, 0) / hhValues.length) * 100) / 100 : 0;
    const avgFeedG = feedGValues.length > 0 ? Math.round((feedGValues.reduce((a, b) => a + b, 0) / feedGValues.length) * 100) / 100 : 0;
    const mortalityRate = initialBirds > 0 ? Math.round((totalMortality / initialBirds) * 10000) / 100 : 0;
    const avgEggs = totalDays > 0 ? Math.round(totalEggs / totalDays) : 0;

    // Bird change: first vs last record
    const startBirds = sorted[0].current_birds;
    const endBirds = sorted[sorted.length - 1].current_birds;
    const change = endBirds - startBirds;

    return {
      avgHd, avgHh, totalMortality, mortalityRate,
      avgFeedG, totalEggs, avgEggs,
      startBirds, endBirds, change,
      initialBirds, totalDays,
    };
  }, [records, flocks]);

  // Monthly breakdown
  const monthlySummary = useMemo(() => {
    const byMonth = new Map<string, DailyRecord[]>();
    for (const r of records) {
      const month = r.record_date.slice(0, 7);
      const arr = byMonth.get(month) ?? [];
      arr.push(r);
      byMonth.set(month, arr);
    }

    return Array.from(byMonth.entries())
      .map(([month, recs]) => {
        const s = recs.sort((a, b) => a.record_date.localeCompare(b.record_date));
        const hdVals = s.filter((r) => r.hd_ratio != null).map((r) => r.hd_ratio!);
        const hhVals = s.filter((r) => r.hh_ratio != null).map((r) => r.hh_ratio!);
        const feedVals = s.filter((r) => r.avg_feed_g != null).map((r) => r.avg_feed_g!);
        const mort = s.reduce((acc, r) => acc + r.mortality, 0);
        const eggs = s.reduce((acc, r) => acc + r.egg_count, 0);
        const initB = flocks.reduce((acc, f) => acc + f.initial_birds, 0);
        return {
          month,
          days: s.length,
          avgHd: hdVals.length > 0 ? Math.round((hdVals.reduce((a, b) => a + b, 0) / hdVals.length) * 100) / 100 : 0,
          avgHh: hhVals.length > 0 ? Math.round((hhVals.reduce((a, b) => a + b, 0) / hhVals.length) * 100) / 100 : 0,
          mortality: mort,
          mortalityRate: initB > 0 ? Math.round((mort / initB) * 10000) / 100 : 0,
          avgFeedG: feedVals.length > 0 ? Math.round((feedVals.reduce((a, b) => a + b, 0) / feedVals.length) * 100) / 100 : 0,
          totalEggs: eggs,
          avgEggs: s.length > 0 ? Math.round(eggs / s.length) : 0,
          startBirds: s[0].current_birds,
          endBirds: s[s.length - 1].current_birds,
          change: s[s.length - 1].current_birds - s[0].current_birds,
        };
      })
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [records, flocks]);

  if (!summary) return null;

  return (
    <div className="mt-6 space-y-6">
      <h2 className="text-lg font-bold">{t('reports.overallSummary')}</h2>

      {/* 8 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 1. 평균 HD비율 */}
        <div className="bg-white rounded-xl border border-border p-3">
          <p className="text-xs text-muted">{t('reports.avgHd')}</p>
          <p className="text-xl font-bold text-green-600">{summary.avgHd}%</p>
        </div>
        {/* 2. 평균 HH비율 */}
        <div className="bg-white rounded-xl border border-border p-3">
          <p className="text-xs text-muted">{t('reports.avgHh')}</p>
          <p className="text-xl font-bold text-blue-600">{summary.avgHh}%</p>
        </div>
        {/* 3. 누적 폐사수 */}
        <div className="bg-white rounded-xl border border-border p-3">
          <p className="text-xs text-muted">{t('reports.cumulativeMortality')}</p>
          <p className="text-xl font-bold text-danger">{summary.totalMortality.toLocaleString()}</p>
        </div>
        {/* 4. 폐사율 */}
        <div className="bg-white rounded-xl border border-border p-3">
          <p className="text-xs text-muted">{t('reports.mortalityRate')}</p>
          <p className="text-xl font-bold text-danger">{summary.mortalityRate}%</p>
          <p className="text-xs text-muted">{t('reports.ofInitial')} {summary.initialBirds.toLocaleString()}</p>
        </div>
        {/* 5. 평균 사료 섭취량 */}
        <div className="bg-white rounded-xl border border-border p-3">
          <p className="text-xs text-muted">{t('reports.avgFeedIntake')}</p>
          <p className="text-xl font-bold text-warning">{summary.avgFeedG}g</p>
        </div>
        {/* 6. 총 생산 계란수 */}
        <div className="bg-white rounded-xl border border-border p-3">
          <p className="text-xs text-muted">{t('reports.totalEggProduction')}</p>
          <p className="text-xl font-bold">{summary.totalEggs.toLocaleString()}</p>
        </div>
        {/* 7. 평균 생산 계란수/일 */}
        <div className="bg-white rounded-xl border border-border p-3">
          <p className="text-xs text-muted">{t('reports.avgEggProduction')}</p>
          <p className="text-xl font-bold">{summary.avgEggs.toLocaleString()}</p>
        </div>
        {/* 8. 사육수 변화 추이 */}
        <div className="bg-white rounded-xl border border-border p-3">
          <p className="text-xs text-muted">{t('reports.birdDeclineTrend')}</p>
          <p className="text-xl font-bold">
            {summary.change > 0 ? (
              <span className="text-red-500">▲ {summary.change.toLocaleString()}</span>
            ) : summary.change < 0 ? (
              <span className="text-blue-500">▼ {Math.abs(summary.change).toLocaleString()}</span>
            ) : (
              <span className="text-gray-500">0</span>
            )}
          </p>
          <p className="text-xs text-muted">{summary.startBirds.toLocaleString()} → {summary.endBirds.toLocaleString()}</p>
        </div>
      </div>

      {/* Monthly Summary Table */}
      <h2 className="text-lg font-bold">{t('reports.monthlySummary')}</h2>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {monthlySummary.map((m) => (
          <div key={m.month} className="bg-white rounded-xl border border-border p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-900">{m.month}</span>
              <span className="text-xs text-muted">{m.days} {t('reports.days')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><p className="text-xs text-muted">{t('reports.avgHd')}</p><p className="font-semibold text-green-600">{m.avgHd}%</p></div>
              <div><p className="text-xs text-muted">{t('reports.avgHh')}</p><p className="font-semibold text-blue-600">{m.avgHh}%</p></div>
              <div><p className="text-xs text-muted">{t('reports.cumulativeMortality')}</p><p className="font-semibold text-danger">{m.mortality.toLocaleString()}</p></div>
              <div><p className="text-xs text-muted">{t('reports.mortalityRate')}</p><p className="font-semibold text-danger">{m.mortalityRate}%</p></div>
              <div><p className="text-xs text-muted">{t('reports.avgFeedIntake')}</p><p className="font-semibold">{m.avgFeedG}g</p></div>
              <div><p className="text-xs text-muted">{t('reports.totalEggProduction')}</p><p className="font-semibold">{m.totalEggs.toLocaleString()}</p></div>
              <div><p className="text-xs text-muted">{t('reports.avgEggProduction')}</p><p className="font-semibold">{m.avgEggs.toLocaleString()}</p></div>
              <div><p className="text-xs text-muted">{t('reports.birdDeclineTrend')}</p><p className="font-semibold">{m.change > 0 ? (<span className="text-red-500">▲ {m.change.toLocaleString()}</span>) : m.change < 0 ? (<span className="text-blue-500">▼ {Math.abs(m.change).toLocaleString()}</span>) : (<span className="text-gray-500">0</span>)}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm bg-white rounded-xl border border-border overflow-hidden">
          <thead>
            <tr className="bg-gray-50 text-left text-muted border-b border-border">
              <th className="px-3 py-3 font-medium">{t('reports.period')}</th>
              <th className="px-3 py-3 font-medium text-right">{t('reports.days')}</th>
              <th className="px-3 py-3 font-medium text-right">{t('reports.avgHd')}</th>
              <th className="px-3 py-3 font-medium text-right">{t('reports.avgHh')}</th>
              <th className="px-3 py-3 font-medium text-right">{t('reports.cumulativeMortality')}</th>
              <th className="px-3 py-3 font-medium text-right">{t('reports.mortalityRate')}</th>
              <th className="px-3 py-3 font-medium text-right">{t('reports.avgFeedIntake')}</th>
              <th className="px-3 py-3 font-medium text-right">{t('reports.totalEggProduction')}</th>
              <th className="px-3 py-3 font-medium text-right">{t('reports.avgEggProduction')}</th>
              <th className="px-3 py-3 font-medium text-right">{t('reports.birdDeclineTrend')}</th>
            </tr>
          </thead>
          <tbody>
            {monthlySummary.map((m) => (
              <tr key={m.month} className="border-b border-border last:border-0">
                <td className="px-3 py-3 font-medium">{m.month}</td>
                <td className="px-3 py-3 text-right">{m.days}</td>
                <td className="px-3 py-3 text-right text-green-600 font-medium">{m.avgHd}%</td>
                <td className="px-3 py-3 text-right text-blue-600 font-medium">{m.avgHh}%</td>
                <td className="px-3 py-3 text-right text-danger">{m.mortality.toLocaleString()}</td>
                <td className="px-3 py-3 text-right text-danger">{m.mortalityRate}%</td>
                <td className="px-3 py-3 text-right">{m.avgFeedG}g</td>
                <td className="px-3 py-3 text-right">{m.totalEggs.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">{m.avgEggs.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">{m.change > 0 ? (<span className="text-red-500 font-medium">▲ {m.change.toLocaleString()}</span>) : m.change < 0 ? (<span className="text-blue-500 font-medium">▼ {Math.abs(m.change).toLocaleString()}</span>) : (<span className="text-gray-500">0</span>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
