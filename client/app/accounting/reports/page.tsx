'use client';

import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';

import DashboardCard from '@/components/DashboardCard';
import { Column, Row } from '@/components/Group';

import { getTransactions } from '@/app/actions/accounting';

import { SpendBarChart } from './components/SpendBarChart';
import { CategoryBreakdownChart } from './components/CategoryBreakdownChart';
import { MonthlyTrendsChart } from './components/MonthlyTrendsChart';
import { TopCategoriesTable } from './components/TopCategoriesTable';
import { TimePeriodSelector, DateRange } from './components/TimePeriodSelector';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function Reports() {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    // Default to last 6 months
    const now = dayjs();
    return {
      start: now.subtract(5, 'month').startOf('month').toDate(),
      end: now.endOf('month').toDate(),
    };
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTransactions() {
      setLoading(true);
      setError(null);
      try {
        console.log('Loading transactions for date range:', {
          start: dateRange.start,
          end: dateRange.end,
        });

        const result = await getTransactions({
          where: {
            // Note: deleted_at filter removed as column may not exist in all schemas
            date_gte: dateRange.start,
            date_lte: dateRange.end,
          },
          order_by: [{ column: 'date', order: 'desc' }],
          limit: 10000, // Get enough transactions for analysis
        });

        console.log('Transaction query result:', result);

        if ('data' in result) {
          const transactionData = result.data || [];
          console.log(`Loaded ${transactionData.length} transactions`);
          setTransactions(transactionData);
        } else if ('error' in result) {
          console.error('Transaction query error:', result.error);
          setError(result.error || 'Failed to load transactions');
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
        setError(error instanceof Error ? error.message : 'Unknown error loading transactions');
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, [dateRange]);

  // Calculate totals for selected period
  const { periodDebits, periodCredits } = useMemo(() => {
    const rangeStart = dayjs(dateRange.start);
    const rangeEnd = dayjs(dateRange.end);

    const periodTransactions = transactions.filter((t) => {
      const txDate = dayjs(t.date);
      return (txDate.isAfter(rangeStart, 'day') || txDate.isSame(rangeStart, 'day')) &&
             (txDate.isBefore(rangeEnd, 'day') || txDate.isSame(rangeEnd, 'day'));
    });

    const debits = periodTransactions.reduce((sum, t) => sum + Math.abs(t.debit || 0), 0);
    const credits = periodTransactions.reduce((sum, t) => sum + Math.abs(t.credit || 0), 0);

    return {
      periodDebits: debits,
      periodCredits: credits,
    };
  }, [transactions, dateRange]);

  // Calculate business vs personal breakdown for selected period
  const { businessTotal, personalTotal } = useMemo(() => {
    const rangeStart = dayjs(dateRange.start);
    const rangeEnd = dayjs(dateRange.end);

    const periodTransactions = transactions.filter((t) => {
      const txDate = dayjs(t.date);
      return (txDate.isAfter(rangeStart, 'day') || txDate.isSame(rangeStart, 'day')) &&
             (txDate.isBefore(rangeEnd, 'day') || txDate.isSame(rangeEnd, 'day'));
    });

    let business = 0;
    let personal = 0;

    periodTransactions.forEach((t) => {
      // Use absolute values for both debits and credits
      const debitAmount = Math.abs(t.debit || 0);
      const creditAmount = Math.abs(t.credit || 0);
      const amount = debitAmount + creditAmount;
      const isBusiness = t.gicCategory?.is_business === true;
      
      if (isBusiness) {
        business += amount;
      } else {
        personal += amount;
      }
    });

    return { businessTotal: business, personalTotal: personal };
  }, [transactions, dateRange]);

  // Format date range for display
  const periodLabel = useMemo(() => {
    const start = dayjs(dateRange.start);
    const end = dayjs(dateRange.end);
    
    if (start.month() === end.month() && start.year() === end.year()) {
      return start.format('MMMM YYYY');
    }
    return `${start.format('MMM D, YYYY')} - ${end.format('MMM D, YYYY')}`;
  }, [dateRange]);

  if (loading) {
    return (
      <Column>
        <div>Loading reports...</div>
      </Column>
    );
  }

  return (
    <Column gap="2">
      <TimePeriodSelector value={dateRange} onChange={setDateRange} />
      
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee', color: '#c33', borderRadius: '4px' }}>
          Error: {error}
        </div>
      )}
      
      <div style={{ fontSize: '0.9rem', color: '#666', padding: '0.5rem 0' }}>
        Found {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} in selected period
        {transactions.length > 0 && transactions.length < 5 && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
            Sample dates: {transactions.slice(0, 3).map(t => dayjs(t.date).format('MMM D, YYYY')).join(', ')}
          </div>
        )}
      </div>
      
      <Row>
        <DashboardCard title={`${periodLabel} Debits`}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>
            {formatCurrency(periodDebits)}
          </div>
        </DashboardCard>

        <DashboardCard title={`${periodLabel} Credits`}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
            {formatCurrency(periodCredits)}
          </div>
        </DashboardCard>

        <DashboardCard title="Net Flow">
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: periodCredits - periodDebits >= 0 ? '#27ae60' : '#e74c3c',
            }}
          >
            {formatCurrency(periodCredits - periodDebits)}
          </div>
        </DashboardCard>
      </Row>

      <Row>
        <DashboardCard title="Business vs Personal">
          <Column gap="1" style={{ width: '100%' }}>
            <Row justify="between">
              <span>Business:</span>
              <span style={{ fontWeight: 'bold', color: '#3498db' }}>
                {formatCurrency(businessTotal)}
              </span>
            </Row>
            <Row justify="between">
              <span>Personal:</span>
              <span style={{ fontWeight: 'bold', color: '#9b59b6' }}>
                {formatCurrency(personalTotal)}
              </span>
            </Row>
            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #ddd' }}>
              <Row justify="between">
                <span style={{ fontWeight: 'bold' }}>Total:</span>
                <span style={{ fontWeight: 'bold' }}>
                  {formatCurrency(businessTotal + personalTotal)}
                </span>
              </Row>
            </div>
          </Column>
        </DashboardCard>
      </Row>

      <SpendBarChart transactions={transactions} dateRange={dateRange} />
      <MonthlyTrendsChart transactions={transactions} dateRange={dateRange} />
      <Row>
        <CategoryBreakdownChart transactions={transactions} dateRange={dateRange} />
        <TopCategoriesTable transactions={transactions} dateRange={dateRange} />
      </Row>
    </Column>
  );
}
