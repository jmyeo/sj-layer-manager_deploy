'use client';

import { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useTranslation } from '@/lib/i18n';
import type { CustomerPerformance } from './page';

type RangePreset = '7d' | '30d' | 'all';

interface Props {
  data: CustomerPerformance[];
}

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#8b5cf6'];

function getDateRange(preset: RangePreset) {
  const end = new Date();
  const start = new Date();
  switch (preset) {
    case '7d': start.setDate(end.getDate() - 7); break;
    case '30d': start.setDate(end.getDate() - 30); break;
    case 'all': start.setFullYear(2000); break;
  }
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
}

export default function PerformanceContent({ data }: Props) {
  const { t } = useTranslation();
  const [preset, setPreset] = useState<RangePreset>('30d');

  const { start, end } = getDateRange(preset);

  // Top 5 customers by HD for trend charts
  const top5 = useMemo(() => data.slice(0, 5), [data]);

  // Build HD trend chart data
  const hdTrendData = useMemo(() => {
    const dateSet = new Set<string>();
    for (const c of top5) {
      for (const d of c.dailyData) {
        if (d.date >= start && d.date <= end) dateSet.add(d.date);
      }
    }
    const dates = Array.from(dateSet).sort();
    return dates.map((date) => {
      const point: Record<string, string | number> = { date: date.slice(5) };
      for (const c of top5) {
        const d = c.dailyData.find((r) => r.date === date);
        point[c.customerName] = d?.avgHd ?? 0;
      }
      return point;
    });
  }, [top5, start, end]);

  // Build mortality trend chart data
  const mortalityTrendData = useMemo(() => {
    const dateSet = new Set<string>();
    for (const c of top5) {
      for (const d of c.dailyData) {
        if (d.date >= start && d.date <= end) dateSet.add(d.date);
      }
    }
    const dates = Array.from(dateSet).sort();
    return dates.map((date) => {
      const point: Record<string, string | number> = { date: date.slice(5) };
      for (const c of top5) {
        const d = c.dailyData.find((r) => r.date === date);
        point[c.customerName] = d?.mortality ?? 0;
      }
      return point;
    });
  }, [top5, start, end]);

  const presets: { key: RangePreset; label: string }[] = [
    { key: '7d', label: t('reports.7days') },
    { key: '30d', label: t('reports.30days') },
    { key: 'all', label: t('reports.allFlocks') },
  ];

  return (
    <main className="px-4 py-6 pb-20 md:pb-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('performance.title')}</h1>
        <p className="text-sm text-muted mt-1">{t('performance.subtitle')}</p>
      </div>

      {/* Period filter */}
      <div className="flex gap-2 mb-6">
        {presets.map((p) => (
          <button
            key={p.key}
            onClick={() => setPreset(p.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              preset === p.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <p className="text-muted">{t('performance.noData')}</p>
        </div>
      ) : (
        <>
          {/* Customer Ranking Table */}
          <h2 className="text-lg font-bold mb-3">{t('performance.customerRanking')}</h2>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3 mb-6">
            {data.map((c, i) => (
              <div key={c.customerId} className="bg-white rounded-xl border border-border p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-900">#{i + 1} {c.customerName}</span>
                  <span className="text-xs text-muted">{c.flockCount} {t('performance.flocks')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted">{t('performance.avgHd')}</p>
                    <p className="font-semibold text-green-600">{c.avgHd}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">{t('performance.avgHh')}</p>
                    <p className="font-semibold text-blue-600">{c.avgHh}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">{t('performance.mortalityRate')}</p>
                    <p className="font-semibold text-red-600">{c.mortalityRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">{t('performance.totalEggs')}</p>
                    <p className="font-semibold">{c.totalEggs.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">{t('performance.avgFeed')}</p>
                    <p className="font-semibold">{c.avgFeedG}g</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto mb-6">
            <table className="w-full text-sm bg-white rounded-xl border border-border overflow-hidden">
              <thead>
                <tr className="bg-gray-50 text-left text-muted border-b border-border">
                  <th className="px-3 py-3 font-medium">{t('performance.rank')}</th>
                  <th className="px-3 py-3 font-medium">{t('performance.customer')}</th>
                  <th className="px-3 py-3 font-medium text-right">{t('performance.flocks')}</th>
                  <th className="px-3 py-3 font-medium text-right">{t('performance.avgHd')}</th>
                  <th className="px-3 py-3 font-medium text-right">{t('performance.avgHh')}</th>
                  <th className="px-3 py-3 font-medium text-right">{t('performance.mortalityRate')}</th>
                  <th className="px-3 py-3 font-medium text-right">{t('performance.totalEggs')}</th>
                  <th className="px-3 py-3 font-medium text-right">{t('performance.avgFeed')}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c, i) => (
                  <tr key={c.customerId} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="px-3 py-3 font-bold text-primary">{i + 1}</td>
                    <td className="px-3 py-3 font-medium">{c.customerName}</td>
                    <td className="px-3 py-3 text-right">{c.flockCount}</td>
                    <td className="px-3 py-3 text-right text-green-600 font-medium">{c.avgHd}%</td>
                    <td className="px-3 py-3 text-right text-blue-600 font-medium">{c.avgHh}%</td>
                    <td className="px-3 py-3 text-right text-red-600">{c.mortalityRate}%</td>
                    <td className="px-3 py-3 text-right">{c.totalEggs.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right">{c.avgFeedG}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* HD Trend Chart */}
          <h2 className="text-lg font-bold mb-3">{t('performance.top5Hd')}</h2>
          <div className="bg-white rounded-xl border border-border p-4 mb-6">
            {hdTrendData.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[360px]" style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hdTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} unit="%" />
                      <Tooltip />
                      <Legend />
                      {top5.map((c, i) => (
                        <Line
                          key={c.customerId}
                          type="monotone"
                          dataKey={c.customerName}
                          stroke={COLORS[i]}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="text-muted text-center py-8">{t('performance.noData')}</p>
            )}
          </div>

          {/* Mortality Trend Chart */}
          <h2 className="text-lg font-bold mb-3">{t('performance.top5Mortality')}</h2>
          <div className="bg-white rounded-xl border border-border p-4 mb-6">
            {mortalityTrendData.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[360px]" style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mortalityTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      {top5.map((c, i) => (
                        <Bar
                          key={c.customerId}
                          dataKey={c.customerName}
                          fill={COLORS[i]}
                          radius={[2, 2, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="text-muted text-center py-8">{t('performance.noData')}</p>
            )}
          </div>
        </>
      )}
    </main>
  );
}
