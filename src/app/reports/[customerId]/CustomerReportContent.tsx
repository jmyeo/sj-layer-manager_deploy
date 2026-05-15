'use client';

import type { Customer, Flock, DailyRecord } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import ReportCharts from './ReportCharts';
import SummaryTable from './SummaryTable';
import ExportButtons from './ExportButtons';

interface Props {
  customer: Customer;
  flocks: Flock[];
  records: DailyRecord[];
}

export default function CustomerReportContent({ customer, flocks, records }: Props) {
  const { t } = useTranslation();

  return (
    <main className="px-4 py-6 pb-20 md:pb-6 max-w-5xl mx-auto">
      <PageHeader
        title={customer.customer_name}
        subtitle={customer.farm_name}
        backHref="/reports"
        action={
          <ExportButtons records={records} flocks={flocks} customer={customer} />
        }
      />

      {records.length === 0 ? (
        <EmptyState title={t('reports.noRecords')} description="" />
      ) : (
        <>
          <ReportCharts records={records} flocks={flocks} />
          <SummaryTable records={records} flocks={flocks} />
        </>
      )}
    </main>
  );
}
