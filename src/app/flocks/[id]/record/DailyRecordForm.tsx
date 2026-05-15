'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/i18n';
import { logAudit } from '@/lib/audit';
import type { Flock, DailyRecord } from '@/lib/types';

interface Props {
  flock: Flock;
  latestRecord: DailyRecord | null;
  existingDates: string[];
}

export default function DailyRecordForm({ flock, latestRecord, existingDates }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const today = new Date().toISOString().split('T')[0];

  const [recordDate, setRecordDate] = useState(today);
  const [previousBirds, setPreviousBirds] = useState(latestRecord?.current_birds ?? flock.initial_birds);
  const [mortality, setMortality] = useState(0);
  const [currentBirdsOverride, setCurrentBirdsOverride] = useState<number | null>(null);
  const [feedKg, setFeedKg] = useState(0);
  const [eggCount, setEggCount] = useState(0);
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Computed
  const autoCurrentBirds = previousBirds - mortality;
  const currentBirds = currentBirdsOverride ?? autoCurrentBirds;
  const hdRatio = currentBirds > 0 ? Math.round((eggCount / currentBirds) * 10000) / 100 : 0;
  const hhRatio = flock.initial_birds > 0 ? Math.round((eggCount / flock.initial_birds) * 10000) / 100 : 0;
  const avgFeedG = currentBirds > 0 ? Math.round((feedKg * 1000 / currentBirds) * 100) / 100 : 0;

  const isDuplicateDate = existingDates.includes(recordDate);

  const handleDateChange = async (newDate: string) => {
    setRecordDate(newDate);
    setSaved(false);
    const supabase = createClient();
    const { data } = await supabase.from('daily_records').select('current_birds').eq('flock_id', flock.id).lt('record_date', newDate).order('record_date', { ascending: false }).limit(1).single();
    setPreviousBirds(data ? data.current_birds : flock.initial_birds);
    setCurrentBirdsOverride(null);
  };

  const handleMortalityChange = (val: number) => {
    setMortality(val);
    setCurrentBirdsOverride(null); // reset override when mortality changes
    setSaved(false);
    scheduleAutoSave();
  };

  // Auto-save: after 3 seconds of inactivity on key fields
  const scheduleAutoSave = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      const formEl = document.getElementById('daily-record-form') as HTMLFormElement | null;
      if (formEl) formEl.requestSubmit();
    }, 3000);
  };

  const handleFieldChange = () => {
    setSaved(false);
    scheduleAutoSave();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDuplicateDate || currentBirds < 0) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const newRecord = {
      flock_id: flock.id,
      record_date: recordDate,
      previous_birds: previousBirds,
      mortality,
      current_birds: currentBirds,
      feed_kg: feedKg,
      egg_count: eggCount,
      hd_ratio: hdRatio,
      hh_ratio: hhRatio,
      avg_feed_g: avgFeedG,
      memo: memo || null,
      created_by: user?.email ?? null,
    };

    const { data: inserted, error: insertError } = await supabase.from('daily_records').insert(newRecord).select('id').single();
    setLoading(false);

    if (insertError) {
      if (insertError.code === '23505') {
        setError(t('record.duplicateDate'));
      } else {
        setError(insertError.message);
      }
    } else {
      if (inserted) {
        await logAudit(supabase, { tableName: 'daily_records', recordId: inserted.id, action: 'INSERT', newData: newRecord });
      }
      setSaved(true);
      // Navigate back after a brief delay to show saved state
      setTimeout(() => {
        router.push(`/flocks/${flock.id}`);
        router.refresh();
      }, 800);
    }
  };

  const numInputClass = "w-full px-4 py-3.5 border border-border rounded-xl text-lg font-semibold text-center focus:outline-none focus:ring-2 focus:ring-primary";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form id="daily-record-form" onSubmit={handleSubmit} className="space-y-4">
      {/* 1. 날짜 */}
      <div>
        <label className={labelClass}>1. {t('record.date')} *</label>
        <input type="date" value={recordDate} onChange={(e) => handleDateChange(e.target.value)} required className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary" />
        {isDuplicateDate && <p className="text-sm text-danger mt-1 font-medium">{t('record.duplicateDate')}</p>}
      </div>

      {/* 2. 최초 입식수 (읽기 전용) */}
      <div className="bg-gray-50 rounded-xl p-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted">2. {t('record.initialBirds')}</span>
          <span className="text-lg font-bold text-gray-700">{flock.initial_birds.toLocaleString()}</span>
        </div>
      </div>

      {/* 3. 전날 사육수 (자동 불러오기) */}
      <div className="bg-gray-50 rounded-xl p-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted">3. {t('record.previousBirds')}</span>
          <span className="text-lg font-bold text-gray-700">{previousBirds.toLocaleString()}</span>
        </div>
      </div>

      {/* 4. 폐사 */}
      <div>
        <label className={labelClass}>4. {t('record.mortality')} *</label>
        <input type="number" inputMode="numeric" min={0} max={previousBirds} value={mortality || ''} onChange={(e) => handleMortalityChange(parseInt(e.target.value) || 0)} required className={numInputClass} placeholder="0" />
      </div>

      {/* 5. 당일 사육수 (자동 계산 + 수동 수정) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">5. {t('record.currentBirds')}</label>
          <span className="text-xs text-muted">{t('record.manualEdit')}</span>
        </div>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={currentBirdsOverride ?? autoCurrentBirds}
          onChange={(e) => { setCurrentBirdsOverride(parseInt(e.target.value) || 0); handleFieldChange(); }}
          className={`${numInputClass} ${currentBirdsOverride !== null ? 'border-blue-400 bg-blue-50' : 'bg-blue-50'}`}
        />
        <p className="text-xs text-muted mt-1">{t('record.currentBirdsDesc')}: {previousBirds.toLocaleString()} - {mortality} = {autoCurrentBirds.toLocaleString()}</p>
        {currentBirdsOverride !== null && currentBirdsOverride !== autoCurrentBirds && (
          <button type="button" onClick={() => setCurrentBirdsOverride(null)} className="text-xs text-primary mt-1 hover:underline">
            {t('common.cancel')}
          </button>
        )}
      </div>

      {/* 6. 사료 급여량 */}
      <div>
        <label className={labelClass}>6. {t('record.feedKg')} *</label>
        <input type="number" inputMode="decimal" step="0.01" min={0} value={feedKg || ''} onChange={(e) => { setFeedKg(parseFloat(e.target.value) || 0); handleFieldChange(); }} required className={numInputClass} placeholder="0.00" />
      </div>

      {/* 7. 당일 생산 계란수 */}
      <div>
        <label className={labelClass}>7. {t('record.eggCount')} *</label>
        <input type="number" inputMode="numeric" min={0} value={eggCount || ''} onChange={(e) => { setEggCount(parseInt(e.target.value) || 0); handleFieldChange(); }} required className={numInputClass} placeholder="0" />
      </div>

      {/* Auto-calculated metrics */}
      <div className="bg-green-50 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-green-800">{t('record.calculated')}</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-green-600">{t('chart.hdRatio')}</p>
            <p className="text-lg font-bold text-green-900">{hdRatio}%</p>
          </div>
          <div>
            <p className="text-xs text-green-600">{t('chart.hhRatio')}</p>
            <p className="text-lg font-bold text-green-900">{hhRatio}%</p>
          </div>
          <div>
            <p className="text-xs text-green-600">{t('record.avgFeed')}</p>
            <p className="text-lg font-bold text-green-900">{avgFeedG}g</p>
          </div>
        </div>
      </div>

      {/* 8. 비고 */}
      <div>
        <label className={labelClass}>8. {t('record.memo')}</label>
        <textarea value={memo} onChange={(e) => { setMemo(e.target.value); handleFieldChange(); }} rows={2} className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder={t('record.memoPlaceholder')} />
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      {saved && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 text-center font-medium">
          {t('record.autoSaved')}
        </div>
      )}

      <button type="submit" disabled={loading || isDuplicateDate || currentBirds < 0} className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 text-lg sticky bottom-20 md:bottom-4">
        {loading ? t('common.saving') : t('record.saveRecord')}
      </button>
    </form>
  );
}
