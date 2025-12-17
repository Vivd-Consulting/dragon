'use client';

import { useState, useRef, useEffect } from 'react';
import { useKeyPress } from 'ahooks';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { SelectButton } from 'primereact/selectbutton';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Chip } from 'primereact/chip';

import { Row, Column as Col } from '@/components/Group';
import { InputTextDebounced } from '@/components/Form';

import { dateFormat } from '@/utils';
import { getTransactions, updateTransaction } from '@/app/actions/accounting';
import { isEqual } from 'lodash';
import useSelectedTransactions from '../hooks/useSelectedTransactions';
import AccountsDropdown from './components/AccountsDropdown';
import CategoryDropdown from './components/CategoryDropdown';
import CategoryModal from '../CategoryModal';
import TransferModal from '../TransferModal';

const thisYear = [new Date(new Date().getFullYear(), 0, 1), new Date()];

// Date preset helpers
function getDatePreset(preset: string): Date[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (preset) {
    case 'last7days':
      return [new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000), today];
    case 'last30days':
      return [new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000), today];
    case 'thisMonth':
      return [new Date(now.getFullYear(), now.getMonth(), 1), today];
    case 'lastMonth':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return [lastMonth, lastDayOfLastMonth];
    case 'thisQuarter':
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      return [new Date(now.getFullYear(), quarterStartMonth, 1), today];
    case 'thisYear':
      return [new Date(now.getFullYear(), 0, 1), today];
    default:
      return thisYear;
  }
}

export default function TransactionList() {
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const [transactionType, setTransactionType] = useState<string | undefined>(undefined);
  const [onlyUncategorizedTransactions, setOnlyUncategorizedTransactions] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<String | Date | Date[] | any>(thisYear);
  const [cadUsdExchangeRate, setCadUsdExchangeRate] = useState<number>(1.35);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [transferSource, setTransferSource] = useState<any>(undefined);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [sortField, setSortField] = useState<string | undefined>('date');
  const [sortOrder, setSortOrder] = useState<0 | 1 | -1 | null | undefined>(-1);

  const toastRef = useRef<Toast>(null);

  const { transactions: selectedTransactions, type: selectedType, setSelectedTransactions, bulkSelectTransactions, setBulkSelectTransactions } =
    useSelectedTransactions();

  useEffect(() => {
    loadTransactions();
  }, [
    selectedAccount,
    selectedCategory,
    searchText,
    transactionType,
    onlyUncategorizedTransactions,
    dateRange,
    first,
    rows,
    sortField,
    sortOrder,
  ]);

  useEffect(() => {
    setBulkSelectTransactions([]);
  }, [
    selectedAccount,
    selectedCategory,
    searchText,
    transactionType,
    onlyUncategorizedTransactions,
    dateRange,
    setBulkSelectTransactions,
  ]);

  useEffect(() => {
    setSelectedCategory(undefined);
  }, [onlyUncategorizedTransactions]);

  async function loadTransactions() {
    setLoading(true);
    try {
      const filters: any = {
        limit: rows,
        offset: first,
        order_by: sortField ? [{ column: sortField, order: (sortOrder === 1 ? 'asc' : 'desc') as 'asc' | 'desc' }] : undefined,
        where: {},
      };

      if (onlyUncategorizedTransactions) {
        filters.where.gic_id = { _is_null: true };
      } else if (selectedCategory) {
        filters.where.gic_id = selectedCategory;
      }

      if (dateRange && Array.isArray(dateRange) && dateRange.length > 1) {
        filters.where.date_gte = dateRange[0];
        filters.where.date_lte = dateRange[1];
      }

      if (selectedAccount) {
        filters.where.account_id = selectedAccount;
      }

      if (transactionType === 'debit') {
        filters.where.debit_gt = 0;
      } else if (transactionType === 'credit') {
        filters.where.credit_gt = 0;
      }

      // Server-side search
      if (searchText) {
        filters.where.search = searchText;
      }

      const result = await getTransactions(filters);

      if ('error' in result) {
        toastRef.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: result.error,
          life: 3000,
        });
        return;
      }

      setTransactions(result.data || []);
      setTotalRecords(result.total || 0);
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load transactions',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  const onPage = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
    if (event.sortField) {
      setSortField(event.sortField);
      setSortOrder(event.sortOrder);
    }
  };

  const refetchTransactions = () => {
    loadTransactions();
  };

  function resetFilters() {
    setSearchText('');
    setSelectedAccount(undefined);
    setSelectedCategory(undefined);
    setTransactionType(undefined);
    setOnlyUncategorizedTransactions(true);
    setDateRange(thisYear);
    setFirst(0);
  }

  function removeFilter(filterType: string) {
    switch (filterType) {
      case 'search':
        setSearchText('');
        break;
      case 'account':
        setSelectedAccount(undefined);
        break;
      case 'category':
        setSelectedCategory(undefined);
        break;
      case 'type':
        setTransactionType(undefined);
        break;
      case 'date':
        setDateRange(thisYear);
        break;
      case 'uncategorized':
        setOnlyUncategorizedTransactions(true);
        break;
    }
  }

  function getActiveFilters() {
    const filters: Array<{ key: string; label: string; value: string }> = [];
    
    if (searchText) {
      filters.push({ key: 'search', label: 'Search', value: searchText });
    }
    if (selectedAccount) {
      filters.push({ key: 'account', label: 'Account', value: selectedAccount });
    }
    if (selectedCategory) {
      filters.push({ key: 'category', label: 'Category', value: selectedCategory });
    }
    if (transactionType) {
      filters.push({ key: 'type', label: 'Type', value: transactionType });
    }
    if (dateRange && Array.isArray(dateRange) && dateRange.length > 1) {
      const start = dateFormat(dateRange[0], true);
      const end = dateFormat(dateRange[1], true);
      filters.push({ key: 'date', label: 'Date Range', value: `${start} - ${end}` });
    }
    if (!onlyUncategorizedTransactions) {
      filters.push({ key: 'uncategorized', label: 'Show', value: 'Categorized' });
    }
    
    return filters;
  }

  useKeyPress(['meta.p'], (e) => {
    if (bulkSelectTransactions.length > 0) {
      e.preventDefault();
      markPersonal(bulkSelectTransactions);
    }
  });
  useKeyPress(['meta.b'], (e) => {
    if (bulkSelectTransactions.length > 0) {
      e.preventDefault();
      markBusiness(bulkSelectTransactions);
    }
  });
  useKeyPress(['meta.shift.a'], (e) => {
    e.preventDefault();

    if (transactions?.length > 0) {
      const transactionsIds = transactions.map(({ id }) => id);

      if (isEqual(transactionsIds, bulkSelectTransactions.map(({ id }) => id))) {
        setBulkSelectTransactions([]);
      } else {
        setBulkSelectTransactions(transactions);
      }
    }
  });

  function markPersonal(data: any[]) {
    setSelectedTransactions({ transactions: data, type: 'personal' });
  }

  function markBusiness(data: any[]) {
    setSelectedTransactions({ transactions: data, type: 'business' });
  }

  function markTransfer(data: any) {
    setTransferSource(data);
  }

  function transactionTypeTemplate(option: string) {
    return (
      <div className="flex align-items-center gap-2">
        {option === 'credit' ? (
          <i className="pi pi-arrow-up" style={{ color: 'green' }}></i>
        ) : (
          <i className="pi pi-arrow-down" style={{ color: 'red' }}></i>
        )}
        <div>{option.charAt(0).toUpperCase() + option.slice(1)}</div>
      </div>
    );
  }

  function useActionButtons(data: any) {
    const _data = bulkSelectTransactions.length > 0 ? bulkSelectTransactions : [data];

    const hasRecommendations = data.recommendations?.length > 0;

    return (
      <Row gap="1">
        <Button
          size="small"
          severity="success"
          tooltip="Mark Personal"
          tooltipOptions={{ position: 'top' }}
          icon="pi pi-user"
          className="p-button-sm"
          onClick={() => markPersonal(_data)}
        />
        <Button
          size="small"
          severity="info"
          tooltip="Mark Business"
          tooltipOptions={{ position: 'top' }}
          icon="pi pi-briefcase"
          className="p-button-sm"
          onClick={() => markBusiness(_data)}
        />
        {hasRecommendations && (
          <Button
            size="small"
            severity="warning"
            tooltip="Mark Transfer"
            tooltipOptions={{ position: 'top' }}
            icon="pi pi-arrow-right-arrow-left"
            className="p-button-sm"
            onClick={() => markTransfer(data)}
          />
        )}
      </Row>
    );
  }

  function amountBodyTemplate({ debit, credit, currency }: any) {
    const isDebit = (debit || 0) !== 0;
    const originalAmount = isDebit ? Math.abs(debit || 0) : Math.abs(credit || 0);
    const originalCurrency = currency || 'USD';
    
    // Convert to USD if needed
    let usdAmount = originalAmount;
    if (originalCurrency.toUpperCase() === 'CAD') {
      usdAmount = originalAmount * cadUsdExchangeRate;
    }
    
    const displayValue = isDebit ? -usdAmount : usdAmount;
    const color = isDebit ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold';
    const tooltipText = `${originalAmount.toLocaleString('en-US', { style: 'currency', currency: originalCurrency })} ${originalCurrency}`;

    return (
      <div className="flex align-items-center gap-2">
        <span className={color} title={tooltipText}>
          {displayValue.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </span>
        {originalCurrency !== 'USD' && (
          <span className="text-xs text-gray-400">
            ({originalCurrency})
          </span>
        )}
      </div>
    );
  }

  const activeFilters = getActiveFilters();
  const hasSelectedTransactions = bulkSelectTransactions.length > 0;

  return (
    <>
      <Toast ref={toastRef} />

      <CategoryModal refetchTransactions={refetchTransactions} />
      <TransferModal transferSourceId={transferSource?.id} setTransferSource={setTransferSource} />

      {/* Filter Chips */}
      {activeFilters.length > 0 && (
        <Row wrap gap="2" px={2} pb={2}>
          {activeFilters.map((filter) => (
            <Chip
              key={filter.key}
              label={`${filter.label}: ${filter.value}`}
              removable
              onRemove={() => removeFilter(filter.key)}
            />
          ))}
          <Button
            label="Clear All"
            icon="pi pi-times"
            size="small"
            className="p-button-text"
            onClick={resetFilters}
          />
        </Row>
      )}

      {/* Filters Row */}
      <Row align="center" justify="between" px={2} pb={4}>
        <Col gap="2" fullWidth>
          {/* Quick Date Presets */}
          <Row wrap gap="2">
            <Button
              label="Last 7 Days"
              size="small"
              className="p-button-outlined"
              onClick={() => setDateRange(getDatePreset('last7days'))}
            />
            <Button
              label="Last 30 Days"
              size="small"
              className="p-button-outlined"
              onClick={() => setDateRange(getDatePreset('last30days'))}
            />
            <Button
              label="This Month"
              size="small"
              className="p-button-outlined"
              onClick={() => setDateRange(getDatePreset('thisMonth'))}
            />
            <Button
              label="Last Month"
              size="small"
              className="p-button-outlined"
              onClick={() => setDateRange(getDatePreset('lastMonth'))}
            />
            <Button
              label="This Quarter"
              size="small"
              className="p-button-outlined"
              onClick={() => setDateRange(getDatePreset('thisQuarter'))}
            />
            <Button
              label="This Year"
              size="small"
              className="p-button-outlined"
              onClick={() => setDateRange(getDatePreset('thisYear'))}
            />
          </Row>

          {/* Main Filters */}
          <Row wrap gap="2" align="center">
            <Button
              icon="pi pi-refresh"
              className="p-button-secondary"
              onClick={resetFilters}
              tooltip="Reset Filters"
            />
            <InputTextDebounced
              icon="pi-search"
              placeholder="Search transactions..."
              value={searchText}
              onChange={(e) => setSearchText(e)}
              style={{ minWidth: '200px' }}
            />
            <AccountsDropdown value={selectedAccount} onChange={setSelectedAccount} />
            <Calendar
              value={dateRange}
              onChange={(e) => setDateRange(e.value)}
              selectionMode="range"
              readOnlyInput
              showButtonBar
              placeholder="Select Date Range"
            />
            <SelectButton
              value={transactionType}
              itemTemplate={transactionTypeTemplate}
              onChange={(e) => setTransactionType(e.value)}
              options={['debit', 'credit']}
              unselectable
            />
            <SelectButton
              value={onlyUncategorizedTransactions ? 'Uncategorized' : 'Categorized'}
              onChange={(e) => setOnlyUncategorizedTransactions(e.value === 'Uncategorized')}
              options={['Uncategorized', 'Categorized']}
              unselectable={false}
            />
            {!onlyUncategorizedTransactions && (
              <CategoryDropdown 
                value={selectedCategory ? Number(selectedCategory) : undefined} 
                onChange={(val) => setSelectedCategory(val?.toString())} 
              />
            )}
            <Button
              icon={showAdvancedFilters ? 'pi pi-chevron-up' : 'pi pi-chevron-down'}
              label="Advanced"
              className="p-button-text"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            />
          </Row>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <Row wrap gap="2" align="center" className="p-3 border-round border-1 border-gray-300">
              <div className="flex align-items-center gap-2">
                <label className="text-sm font-semibold">USD/CAD Exchange:</label>
                <InputNumber
                  value={cadUsdExchangeRate}
                  onChange={(e) => setCadUsdExchangeRate(Number(e.value))}
                  mode="decimal"
                  minFractionDigits={2}
                  maxFractionDigits={4}
                  style={{ width: '100px' }}
                />
              </div>
            </Row>
          )}
        </Col>
      </Row>

      {/* Bulk Actions Bar */}
      {hasSelectedTransactions && (
        <div className="sticky top-0 z-10 border-bottom-1 border-surface-border p-3 shadow-1" style={{ backgroundColor: 'var(--surface-card)' }}>
          <Row align="center" justify="between">
            <div className="flex align-items-center gap-4">
              <span className="font-semibold">
                {bulkSelectTransactions.length} transaction{bulkSelectTransactions.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex align-items-center gap-3">
                <span className="text-sm">Debits:</span>
                <span className="text-red-600 font-semibold">
                  {bulkSelectTransactions
                    ?.reduce((acc, { debit, currency }: any) => {
                      const debitAmount = Math.abs(debit || 0);
                      if (currency?.toUpperCase() === 'CAD') {
                        return acc + debitAmount;
                      } else {
                        return acc + debitAmount * cadUsdExchangeRate;
                      }
                    }, 0)
                    .toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                </span>
                <span className="text-sm">Credits:</span>
                <span className="text-green-600 font-semibold">
                  {bulkSelectTransactions
                    ?.reduce((acc, { credit, currency }: any) => {
                      const creditAmount = Math.abs(credit || 0);
                      if (currency?.toUpperCase() === 'CAD') {
                        return acc + creditAmount;
                      } else {
                        return acc + creditAmount * cadUsdExchangeRate;
                      }
                    }, 0)
                    .toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                </span>
              </div>
            </div>
            <Row gap="2">
              <Button
                label="Mark Personal"
                icon="pi pi-user"
                severity="success"
                size="small"
                className="p-button-sm"
                onClick={() => markPersonal(bulkSelectTransactions)}
              />
              <Button
                label="Mark Business"
                icon="pi pi-briefcase"
                severity="info"
                size="small"
                className="p-button-sm"
                onClick={() => markBusiness(bulkSelectTransactions)}
              />
              <Button
                icon="pi pi-times"
                className="p-button-text p-button-sm"
                onClick={() => setBulkSelectTransactions([])}
                tooltip="Clear Selection"
              />
            </Row>
          </Row>
        </div>
      )}

      <DataTable
        value={transactions}
        dataKey="id"
        selection={bulkSelectTransactions}
        onSelectionChange={(e) => setBulkSelectTransactions(e.value as any)}
        selectionMode="checkbox"
        paginator
        lazy
        onPage={onPage}
        first={first}
        rows={rows}
        onSort={onPage}
        sortField={sortField}
        sortOrder={sortOrder}
        totalRecords={totalRecords}
        removableSort
        responsiveLayout="scroll"
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No Transactions found."
        data-cy="transactions-table"
        loading={loading}
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
        <Column field="account.name" header="Account" sortable />
        <Column field="name" header="Description" />
        <Column field="merchant_name" header="Merchant" />
        <Column
          field="amount"
          header="Amount"
          body={amountBodyTemplate}
          sortField={transactionType === 'debit' ? 'debit' : 'credit'}
          sortable
        />
        <Column
          field="currency"
          header="Currency"
          body={({ currency }: any) => <span>{currency}</span>}
          sortable
        />
        {!onlyUncategorizedTransactions && <Column field="gicCategory.name" header="Category" sortable />}
        {!onlyUncategorizedTransactions && (
          <Column
            field="gicCategory.is_business"
            header="Type"
            body={({ gicCategory }: any) => (
              <i className={`pi pi-${gicCategory?.is_business ? 'briefcase' : 'user'}`}></i>
            )}
            sortable
          />
        )}
        <Column
          body={({ date }: any) => <span>{dateFormat(date, true)}</span>}
          field="date"
          header="Date"
          sortable
        />
        {!onlyUncategorizedTransactions && (
          <Column
            body={({ appliedRule }: any) =>
              appliedRule ? <Tag severity="info" value={appliedRule.name} /> : <Tag value="M" />
            }
            field="appliedRule"
            header="Applied Rule"
          />
        )}
        <Column body={useActionButtons} />
      </DataTable>
    </>
  );
}
