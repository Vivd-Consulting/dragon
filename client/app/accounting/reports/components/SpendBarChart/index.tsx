'use client';

import { useMemo } from 'react';
import dayjs from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from 'primereact/card';
import { DateRange } from '../TimePeriodSelector';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function SpendBarChart({ transactions, dateRange }: { transactions: any[]; dateRange: DateRange }) {
  const chartData = useMemo(() => {
    const start = dayjs(dateRange.start);
    const end = dayjs(dateRange.end);
    
    // Group transactions by month
    const months: Record<string, { month: string; debits: number; credits: number }> = {};
    
    // Initialize all months in the range
    let current = start.startOf('month');
    const endMonth = end.startOf('month');
    while (current.isBefore(endMonth) || current.isSame(endMonth, 'month')) {
      const monthKey = current.format('MMM YYYY');
      months[monthKey] = {
        month: monthKey,
        debits: 0,
        credits: 0,
      };
      current = current.add(1, 'month');
      if (current.isAfter(endMonth, 'month')) {
        break;
      }
    }

    // Aggregate transactions by month
    transactions.forEach((t) => {
      const txDate = dayjs(t.date);
      const monthKey = txDate.format('MMM YYYY');
      
      if (months[monthKey]) {
        months[monthKey].debits += Math.abs(t.debit || 0);
        months[monthKey].credits += Math.abs(t.credit || 0);
      }
    });

    return Object.values(months);
  }, [transactions, dateRange]);

  if (chartData.length === 0) {
    return (
      <Card title="Monthly Spending Trends">
        <div>No transaction data available</div>
      </Card>
    );
  }

  return (
    <Card title="Monthly Spending Trends (Last 6 Months)">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Bar dataKey="debits" fill="#e74c3c" name="Debits" />
          <Bar dataKey="credits" fill="#27ae60" name="Credits" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
