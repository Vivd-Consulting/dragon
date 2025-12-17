'use client';

import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Calendar } from 'primereact/calendar';
import { SelectButton } from 'primereact/selectbutton';
import { Card } from 'primereact/card';
import { Row } from '@/components/Group';

export type TimePeriod = 'thisMonth' | 'last3Months' | 'last6Months' | 'thisYear' | 'lastYear' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
}

interface TimePeriodSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function TimePeriodSelector({ value, onChange }: TimePeriodSelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('last6Months');
  const [customDateRange, setCustomDateRange] = useState<Date[] | null>(null);

  const presetOptions = [
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last 3 Months', value: 'last3Months' },
    { label: 'Last 6 Months', value: 'last6Months' },
    { label: 'This Year', value: 'thisYear' },
    { label: 'Last Year', value: 'lastYear' },
    { label: 'Custom', value: 'custom' },
  ];

  // Detect which period matches the current value
  const detectPeriod = (range: DateRange): TimePeriod => {
    const start = dayjs(range.start);
    const end = dayjs(range.end);
    const now = dayjs();

    // Check if it matches "This Month"
    if (
      start.isSame(now.startOf('month'), 'day') &&
      end.isSame(now.endOf('month'), 'day')
    ) {
      return 'thisMonth';
    }

    // Check if it matches "Last 3 Months"
    const last3MonthsStart = dayjs().subtract(2, 'month').startOf('month');
    if (
      start.isSame(last3MonthsStart, 'day') &&
      end.isSame(now.endOf('month'), 'day')
    ) {
      return 'last3Months';
    }

    // Check if it matches "Last 6 Months"
    const last6MonthsStart = dayjs().subtract(5, 'month').startOf('month');
    if (
      start.isSame(last6MonthsStart, 'day') &&
      end.isSame(now.endOf('month'), 'day')
    ) {
      return 'last6Months';
    }

    // Check if it matches "This Year"
    if (
      start.isSame(now.startOf('year'), 'day') &&
      end.isSame(now.endOf('month'), 'day')
    ) {
      return 'thisYear';
    }

    // Check if it matches "Last Year"
    const lastYearStart = now.subtract(1, 'year').startOf('year');
    const lastYearEnd = now.subtract(1, 'year').endOf('year');
    if (
      start.isSame(lastYearStart, 'day') &&
      end.isSame(lastYearEnd, 'day')
    ) {
      return 'lastYear';
    }

    // Otherwise it's custom
    return 'custom';
  };

  // Sync selectedPeriod with value prop
  useEffect(() => {
    const detected = detectPeriod(value);
    setSelectedPeriod(detected);
    
    if (detected === 'custom') {
      setCustomDateRange([value.start, value.end]);
    }
  }, [value]);

  const getDateRangeForPeriod = (period: TimePeriod): DateRange => {
    const now = dayjs();
    
    switch (period) {
      case 'thisMonth':
        return {
          start: now.startOf('month').toDate(),
          end: now.endOf('month').toDate(),
        };
      case 'last3Months':
        return {
          start: now.subtract(2, 'month').startOf('month').toDate(),
          end: now.endOf('month').toDate(),
        };
      case 'last6Months':
        return {
          start: now.subtract(5, 'month').startOf('month').toDate(),
          end: now.endOf('month').toDate(),
        };
      case 'thisYear':
        return {
          start: now.startOf('year').toDate(),
          end: now.endOf('month').toDate(),
        };
      case 'lastYear':
        return {
          start: now.subtract(1, 'year').startOf('year').toDate(),
          end: now.subtract(1, 'year').endOf('year').toDate(),
        };
      case 'custom':
        if (customDateRange && customDateRange.length === 2) {
          return {
            start: dayjs(customDateRange[0]).startOf('day').toDate(),
            end: dayjs(customDateRange[1]).endOf('day').toDate(),
          };
        }
        return {
          start: now.subtract(5, 'month').startOf('month').toDate(),
          end: now.endOf('month').toDate(),
        };
      default:
        return {
          start: now.subtract(5, 'month').startOf('month').toDate(),
          end: now.endOf('month').toDate(),
        };
    }
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    if (period !== 'custom') {
      const range = getDateRangeForPeriod(period);
      onChange(range);
    } else {
      // When switching to custom, initialize with current value
      setCustomDateRange([value.start, value.end]);
    }
  };

  const handleCustomDateChange = (e: any) => {
    const dates = e.value as Date[] | null;
    setCustomDateRange(dates);
    // Update parent only when we have a complete range (2 dates)
    if (dates && Array.isArray(dates) && dates.length === 2 && dates[0] && dates[1]) {
      onChange({
        start: dayjs(dates[0]).startOf('day').toDate(),
        end: dayjs(dates[1]).endOf('day').toDate(),
      });
    }
  };

  return (
    <Card>
      <Row gap="2" align="center" wrap>
        <SelectButton
          value={selectedPeriod}
          onChange={(e) => handlePeriodChange(e.value)}
          options={presetOptions}
          unselectable={false}
        />
        {selectedPeriod === 'custom' && (
          <Calendar
            value={customDateRange || [value.start, value.end]}
            onChange={handleCustomDateChange}
            selectionMode="range"
            readOnlyInput
            showButtonBar
            dateFormat="mm/dd/yy"
            placeholder="Select date range"
            minDate={new Date(2000, 0, 1)}
            maxDate={new Date(2100, 11, 31)}
          />
        )}
      </Row>
    </Card>
  );
}

