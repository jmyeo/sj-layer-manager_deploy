'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/i18n';

export default function CustomerActions() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    // 1. Insert customer
    const { data: customer, error: custErr } = await supabase.from('customers').insert({
      customer_name: form.get('customer_name') as string,
      farm_name: form.get('farm_name') as string,
      region: (form.get('region') as string) || null,
      contact_name: (form.get('contact_name') as string) || null,
      contact_phone: (form.get('contact_phone') as string) || null,
      status: form.get('status') as string || 'Active',
    }).select('id').single();

    if (custErr || !customer) {
      setLoading(false);
      return;
    }

    // 2. Insert flock linked to this customer
    const placementDate = form.get('placement_date') as string;
    const initialBirds = form.get('initial_birds') as string;
    if (placementDate && initialBirds) {
      await supabase.from('flocks').insert({
        customer_id: customer.id,
        flock_name: (form.get('flock_name') as string) || null,
        breed: (form.get('breed') as string) || '',
        placement_date: placementDate,
        initial_birds: parseInt(initialBirds, 10),
        status: form.get('status') as string || 'Active',
      });
    }

    setLoading(false);
    setShowForm(false);
    router.refresh();
  };

  const inputClass = "w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <>
      <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors">
        {t('common.add')}
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{t('customers.new')}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* 1. 거래처명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">1. {t('customers.customerName')} *</label>
                <input name="customer_name" required className={inputClass} placeholder={t('customers.phCustomerName')} />
              </div>
              {/* 2. 농장명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">2. {t('customers.farmName')} *</label>
                <input name="farm_name" required className={inputClass} placeholder={t('customers.phFarmName')} />
              </div>
              {/* 3. 지역 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">3. {t('customers.region')}</label>
                <input name="region" className={inputClass} placeholder={t('customers.phRegion')} />
              </div>
              {/* 4. 담당자명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">4. {t('customers.contact')}</label>
                <input name="contact_name" className={inputClass} placeholder={t('customers.phContact')} />
              </div>
              {/* 5. 연락처 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">5. {t('customers.contactPhone')}</label>
                <input name="contact_phone" type="tel" className={inputClass} placeholder={t('customers.phPhone')} />
              </div>

              <div className="border-t border-border pt-3 mt-3">
                <p className="text-xs text-muted mb-3 font-medium uppercase tracking-wide">{t('flocks.title')}</p>
              </div>

              {/* 6. 최초 입식일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">6. {t('flocks.placementDate')} *</label>
                <input name="placement_date" type="date" required className={inputClass} />
              </div>
              {/* 7. 최초 입식수 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">7. {t('flocks.initialBirds')} *</label>
                <input name="initial_birds" type="number" inputMode="numeric" required min={1} className={inputClass} placeholder={t('flocks.phInitialBirds')} />
              </div>
              {/* 8. 품종 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">8. {t('flocks.breed')} *</label>
                <input name="breed" required className={inputClass} placeholder={t('flocks.phBreed')} />
              </div>
              {/* 9. 계군 번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">9. {t('flocks.flockName')}</label>
                <input name="flock_name" className={inputClass} placeholder={t('flocks.phFlockName')} />
              </div>
              {/* 10. 상태 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">10. {t('customers.status')}</label>
                <select name="status" className={inputClass}>
                  <option value="Active">{t('flocks.statusActive')}</option>
                  <option value="Completed">{t('flocks.statusCompleted')}</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 mt-2">
                {loading ? t('common.saving') : t('customers.addCustomer')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
