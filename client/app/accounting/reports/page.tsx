'use client';

import { useState, useEffect } from 'react';

import DashboardCard from '@/components/DashboardCard';
import { Column, Row } from '@/components/Group';

import { getCurrentMonth } from '@/utils';
import { getTransactions } from '@/app/actions/accounting';

import { SpendBarChart } from './components/SpendBarChart';

export default function Reports() {
  const currentMonthName = getCurrentMonth();
  const [isBusiness, setIsBusiness] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    async function loadTransactions() {
      const result = await getTransactions({
        where: {
          gic_id: { _is_null: false } as any,
          deleted_at: { _is_null: true },
        },
      });

      if ('data' in result) {
        setTransactions(result.data || []);
      }
    }

    loadTransactions();
  }, []);

  return (
    <Column>
      <Row>
        <DashboardCard title={`${currentMonthName} Debits`}>
          <i className="pi pi-wallet" style={{ fontSize: '1.5rem' }} />
        </DashboardCard>

        <DashboardCard title={`${currentMonthName} Credits`}>
          <i className="pi pi-wallet" style={{ fontSize: '1.5rem' }} />
        </DashboardCard>
      </Row>

      <SpendBarChart spendHistory={transactions} />
    </Column>
  );
}
