'use client';

import { useMemo } from 'react';
import dayjs from 'dayjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

export function MonthlyTrendsChart({ transactions, dateRange }: { transactions: any[]; dateRange: DateRange }) {
  const chartData = useMemo(() => {
    const start = dayjs(dateRange.start);
    const end = dayjs(dateRange.end);
    
    // Group transactions by month
    const months: Record<string, { month: string; net: number; debits: number; credits: number }> = {};
    
    // Initialize all months in the range
    let current = start.startOf('month');
    const endMonth = end.startOf('month');
    while (current.isBefore(endMonth) || current.isSame(endMonth, 'month')) {
      const monthKey = current.format('MMM YYYY');
      months[monthKey] = {
        month: monthKey,
        net: 0,
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
        const debit = Math.abs(t.debit || 0);
        const credit = Math.abs(t.credit || 0);
        months[monthKey].debits += debit;
        months[monthKey].credits += credit;
        // Net flow: credits (money in) minus debits (money out)
        months[monthKey].net += credit - debit;
      }
    });

    return Object.values(months);
  }, [transactions, dateRange]);

  if (chartData.length === 0) {
    return (
      <Card title="Net Cash Flow Trends">
        <div>No transaction data available</div>
      </Card>
    );
  }

  return (
    <Card title="Net Cash Flow Trends (Last 6 Months)">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="net" 
            stroke="#3498db" 
            strokeWidth={2}
            name="Net Flow"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

