'use client';

import { useMemo } from 'react';
import dayjs from 'dayjs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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

const COLORS = [
  '#3498db',
  '#e74c3c',
  '#27ae60',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#e67e22',
  '#34495e',
  '#95a5a6',
  '#d35400',
];

export function CategoryBreakdownChart({ transactions, dateRange }: { transactions: any[]; dateRange: DateRange }) {
  const chartData = useMemo(() => {
    const rangeStart = dayjs(dateRange.start);
    const rangeEnd = dayjs(dateRange.end);

    // Filter to selected period and only debits
    const periodDebits = transactions.filter((t) => {
      const txDate = dayjs(t.date);
      return (
        (txDate.isAfter(rangeStart, 'day') || txDate.isSame(rangeStart, 'day')) &&
        (txDate.isBefore(rangeEnd, 'day') || txDate.isSame(rangeEnd, 'day')) &&
        (t.debit || 0) > 0
      );
    });

    // Group by category
    const categoryMap: Record<string, number> = {};
    
    periodDebits.forEach((t) => {
      const categoryName = t.gicCategory?.name || t.category_name || 'Uncategorized';
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + Math.abs(t.debit || 0);
    });

    // Convert to array and sort by amount
    const data = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 categories

    return data;
  }, [transactions, dateRange]);

  if (chartData.length === 0) {
    return (
      <Card title="Spending by Category" className="flex-1">
        <div>No spending data available for the selected period</div>
      </Card>
    );
  }

  return (
    <Card title="Spending by Category" className="flex-1">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

