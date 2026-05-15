'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/i18n';

export default function FlockActions({ customerId }: { customerId: number }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.from('flocks').insert({
      customer_id: customerId,
      flock_name: (form.get('flock_name') as string) || null,
      breed: form.get('breed') as string,
      placement_date: form.get('placement_date') as string,
      initial_birds: parseInt(form.get('initial_birds') as string, 10),
    });

    setLoading(false);
    if (!error) {
      setShowForm(false);
      router.refresh();
    }
  };

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
      >
        {t('common.add')}
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{t('flocks.new')}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('flocks.flockName')}</label>
                <input name="flock_name" className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary" placeholder={t('flocks.phFlockName')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('flocks.breed')} *</label>
                <input name="breed" required className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary" placeholder={t('flocks.phBreed')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('flocks.placementDate')} *</label>
                <input name="placement_date" type="date" required className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('flocks.initialBirds')} *</label>
                <input name="initial_birds" type="number" inputMode="numeric" required min={1} className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary" placeholder={t('flocks.phInitialBirds')} />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50">
                {loading ? t('common.saving') : t('flocks.addFlockBtn')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
