'use client';

import { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { DailyRecord, Flock } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';

type RangePreset = '7d' | '30d' | 'monthly' | 'custom';

interface Props {
  records: DailyRecord[];
  flocks: Flock[];
}

function getDateRange(preset: RangePreset, customStart: string, customEnd: string) {
  const end = new Date();
  let start = new Date();
  switch (preset) {
    case '7d': start.setDate(end.getDate() - 7); break;
    case '30d': start.setDate(end.getDate() - 30); break;
    case 'monthly': start.setDate(1); break;
    case 'custom':
      if (customStart) start = new Date(customStart);
      if (customEnd) end.setTime(new Date(customEnd).getTime());
      break;
  }
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <h3 className="text-sm font-bold text-gray-900 mb-3">{title}</h3>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[360px]" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function ReportCharts({ records, flocks }: Props) {
  const { t } = useTranslation();
  const [preset, setPreset] = useState<RangePreset>('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedFlockId, setSelectedFlockId] = useState<number | 'all'>('all');

  const { start, end } = getDateRange(preset, customStart, customEnd);

  const filtered = useMemo(() => {
    let data = records.filter((r) => r.record_date >= start && r.record_date <= end);
    if (selectedFlockId !== 'all') data = data.filter((r) => r.flock_id === selectedFlockId);
    return data.sort((a, b) => a.record_date.localeCompare(b.record_date));
  }, [records, start, end, selectedFlockId]);

  const chartData = useMemo(() => {
    const byDate = new Map<string, { date: string; birds: number; mortality: number; feedKg: number; eggs: number; hdArr: number[]; hhArr: number[]; feedGArr: number[] }>();
    for (const r of filtered) {
      const d = byDate.get(r.record_date) ?? { date: r.record_date, birds: 0, mortality: 0, feedKg: 0, eggs: 0, hdArr: [], hhArr: [], feedGArr: [] };
      d.birds += r.current_birds;
      d.mortality += r.mortality;
      d.feedKg += r.feed_kg;
      d.eggs += r.egg_count;
      if (r.hd_ratio != null) d.hdArr.push(r.hd_ratio);
      if (r.hh_ratio != null) d.hhArr.push(r.hh_ratio);
      if (r.avg_feed_g != null) d.feedGArr.push(r.avg_feed_g);
      byDate.set(r.record_date, d);
    }
    return Array.from(byDate.values()).map((d) => ({
      date: d.date.slice(5),
      fullDate: d.date,
      birds: d.birds,
      mortality: d.mortality,
      feedKg: Math.round(d.feedKg * 100) / 100,
      eggs: d.eggs,
      hd: d.hdArr.length > 0 ? Math.round((d.hdArr.reduce((a, b) => a + b, 0) / d.hdArr.length) * 100) / 100 : 0,
      hh: d.hhArr.length > 0 ? Math.round((d.hhArr.reduce((a, b) => a + b, 0) / d.hhArr.length) * 100) / 100 : 0,
      feedG: d.feedGArr.length > 0 ? Math.round((d.feedGArr.reduce((a, b) => a + b, 0) / d.feedGArr.length) * 100) / 100 : 0,
    }));
  }, [filtered]);

  const presets: { key: RangePreset; labelKey: 'reports.7days' | 'reports.30days' | 'reports.thisMonth' | 'reports.custom' }[] = [
    { key: '7d', labelKey: 'reports.7days' },
    { key: '30d', labelKey: 'reports.30days' },
    { key: 'monthly', labelKey: 'reports.thisMonth' },
    { key: 'custom', labelKey: 'reports.custom' },
  ];

  const grid = <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />;
  const xAxis = <XAxis dataKey="date" tick={{ fontSize: 10 }} />;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-muted mb-1">{t('reports.flock')}</label>
          <select value={selectedFlockId} onChange={(e) => setSelectedFlockId(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="all">{t('reports.allFlocks')}</option>
            {flocks.map((f) => (<option key={f.id} value={f.id}>{f.flock_name ? `${f.flock_name} - ` : ''}{f.breed}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">{t('reports.period')}</label>
          <div className="flex gap-2 flex-wrap">
            {presets.map((p) => (
              <button key={p.key} onClick={() => setPreset(p.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${preset === p.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {t(p.labelKey)}
              </button>
            ))}
          </div>
        </div>
        {preset === 'custom' && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-muted mb-1">{t('reports.from')}</label>
              <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-muted mb-1">{t('reports.to')}</label>
              <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
            </div>
          </div>
        )}
        <p className="text-xs text-muted">{t('reports.showingDays', { count: chartData.length, start, end })}</p>
      </div>

      {chartData.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <p className="text-muted">{t('reports.noDataPeriod')}</p>
        </div>
      ) : (
        <>
          <h2 className="text-lg font-bold mt-2">{t('reports.dailyReport')}</h2>

          {/* 1. 일별 사육수 */}
          <ChartCard title={t('reports.dailyBirds')}>
            <LineChart data={chartData}>
              {grid}{xAxis}
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip /><Legend />
              <Line type="monotone" dataKey="birds" name={t('chart.currentBirds')} stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ChartCard>

          {/* 2. 일별 폐사수 */}
          <ChartCard title={t('reports.dailyMortality')}>
            <BarChart data={chartData}>
              {grid}{xAxis}
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip /><Legend />
              <Bar dataKey="mortality" name={t('chart.mortality')} fill="#dc2626" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ChartCard>

          {/* 3. 일별 사료 급여량 */}
          <ChartCard title={t('reports.dailyFeed')}>
            <BarChart data={chartData}>
              {grid}{xAxis}
              <YAxis tick={{ fontSize: 10 }} unit="kg" />
              <Tooltip /><Legend />
              <Bar dataKey="feedKg" name={t('chart.feedKg')} fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ChartCard>

          {/* 4. 일별 생산 계란수 */}
          <ChartCard title={t('reports.dailyEggs')}>
            <BarChart data={chartData}>
              {grid}{xAxis}
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip /><Legend />
              <Bar dataKey="eggs" name={t('chart.eggs')} fill="#16a34a" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ChartCard>

          {/* 5. HD비율 */}
          <ChartCard title={t('reports.dailyHd')}>
            <LineChart data={chartData}>
              {grid}{xAxis}
              <YAxis tick={{ fontSize: 10 }} unit="%" />
              <Tooltip /><Legend />
              <Line type="monotone" dataKey="hd" name={t('chart.hdRatio')} stroke="#16a34a" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ChartCard>

          {/* 6. HH비율 */}
          <ChartCard title={t('reports.dailyHh')}>
            <LineChart data={chartData}>
              {grid}{xAxis}
              <YAxis tick={{ fontSize: 10 }} unit="%" />
              <Tooltip /><Legend />
              <Line type="monotone" dataKey="hh" name={t('chart.hhRatio')} stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ChartCard>

          {/* 7. 마리당 평균 섭취량 */}
          <ChartCard title={t('reports.dailyAvgFeed')}>
            <LineChart data={chartData}>
              {grid}{xAxis}
              <YAxis tick={{ fontSize: 10 }} unit="g" />
              <Tooltip /><Legend />
              <Line type="monotone" dataKey="feedG" name={t('chart.feedPerBird')} stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ChartCard>
        </>
      )}
    </div>
  );
}
