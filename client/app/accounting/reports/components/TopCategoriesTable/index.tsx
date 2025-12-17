'use client';

import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { DateRange } from '../TimePeriodSelector';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function TopCategoriesTable({ transactions, dateRange }: { transactions: any[]; dateRange: DateRange }) {
  const tableData = useMemo(() => {
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
    const categoryMap: Record<string, { name: string; total: number; count: number; isBusiness: boolean }> = {};
    
    periodDebits.forEach((t) => {
      const categoryName = t.gicCategory?.name || t.category_name || 'Uncategorized';
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
          name: categoryName,
          total: 0,
          count: 0,
          isBusiness: t.gicCategory?.is_business || false,
        };
      }
      categoryMap[categoryName].total += Math.abs(t.debit || 0);
      categoryMap[categoryName].count += 1;
    });

    // Convert to array and sort by total
    return Object.values(categoryMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10 categories
  }, [transactions, dateRange]);

  const amountBodyTemplate = (rowData: any) => {
    return formatCurrency(rowData.total);
  };

  const typeBodyTemplate = (rowData: any) => {
    return (
      <span style={{ color: rowData.isBusiness ? '#3498db' : '#9b59b6' }}>
        {rowData.isBusiness ? 'Business' : 'Personal'}
      </span>
    );
  };

  if (tableData.length === 0) {
    return (
      <Card title="Top Spending Categories" className="flex-1">
        <div>No spending data available for the selected period</div>
      </Card>
    );
  }

  return (
    <Card title="Top Spending Categories" className="flex-1">
      <DataTable value={tableData} showGridlines stripedRows>
        <Column field="name" header="Category" sortable />
        <Column field="total" header="Total" body={amountBodyTemplate} sortable />
        <Column field="count" header="Transactions" sortable />
        <Column field="isBusiness" header="Type" body={typeBodyTemplate} sortable />
      </DataTable>
    </Card>
  );
}

