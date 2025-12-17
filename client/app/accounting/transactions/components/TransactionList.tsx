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

import { Row } from '@/components/Group';
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

export default function TransactionList() {
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const [transactionType, setTransactionType] = useState<string | undefined>(undefined);
  const [onlyUncategorizedTransactions, setOnlyUncategorizedTransactions] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<String | Date | Date[] | any>(thisYear);
  const [cadUsdExchangeRate, setCadUsdExchangeRate] = useState<number>(1.35);

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

      let filteredData = result.data || [];

      if (searchText) {
        filteredData = filteredData.filter(
          (t: any) =>
            t.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            t.merchant_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            t.debit === parseFloat(searchText) ||
            t.credit === parseFloat(searchText)
        );
      }

      setTransactions(filteredData);
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
      <Row>
        <Button
          size="small"
          severity="success"
          tooltip="Mark Personal"
          tooltipOptions={{ position: 'top' }}
          icon="pi pi-user"
          onClick={() => markPersonal(_data)}
        />
        <Button
          size="small"
          tooltip="Mark Business"
          tooltipOptions={{ position: 'top' }}
          icon="pi pi-briefcase"
          onClick={() => markBusiness(_data)}
        />
        {hasRecommendations && (
          <Button
            size="small"
            severity="warning"
            tooltip="Mark Transfer"
            tooltipOptions={{ position: 'top' }}
            icon="pi pi-arrow-right-arrow-left"
            onClick={() => markTransfer(data)}
          />
        )}
      </Row>
    );
  }

  return (
    <>
      <Toast ref={toastRef} />

      <CategoryModal refetchTransactions={refetchTransactions} />
      <TransferModal transferSourceId={transferSource?.id} setTransferSource={setTransferSource} />

      <Row align="center" justify="between" px={2} pb={4}>
        <Row wrap>
          <Button
            icon="pi pi-refresh"
            className="p-button-secondary"
            onClick={() => {
              setSearchText('');
              setSelectedAccount(undefined);
              setTransactionType(undefined);
              setOnlyUncategorizedTransactions(true);
              setDateRange(thisYear);
            }}
          />
          <InputTextDebounced
            icon="pi-search"
            placeholder="Search by"
            value={searchText}
            onChange={(e) => setSearchText(e)}
          />
          <AccountsDropdown value={selectedAccount} onChange={setSelectedAccount} />
          <Calendar
            value={dateRange}
            onChange={(e) => setDateRange(e.value)}
            selectionMode="range"
            readOnlyInput
            showButtonBar
          />
          <SelectButton
            value={transactionType}
            itemTemplate={transactionTypeTemplate}
            onChange={(e) => setTransactionType(e.value)}
            options={['debit', 'credit']}
          />
          <SelectButton
            value={onlyUncategorizedTransactions ? 'Uncategorized' : 'Categorized'}
            onChange={(e) => setOnlyUncategorizedTransactions(e.value === 'Uncategorized')}
            options={['Uncategorized', 'Categorized']}
            unselectable={false}
          />
          <InputNumber
            value={cadUsdExchangeRate}
            onChange={(e) => setCadUsdExchangeRate(Number(e.value))}
            placeholder="USD/CAD Exchange"
            mode="decimal"
            minFractionDigits={2}
          />
          {!onlyUncategorizedTransactions && (
            <CategoryDropdown 
              value={selectedCategory ? Number(selectedCategory) : undefined} 
              onChange={(val) => setSelectedCategory(val?.toString())} 
            />
          )}
        </Row>
        <Row>
          <span className="text-red-500">
            Debits:{' '}
            {bulkSelectTransactions
              ?.reduce((acc, { debit, currency }: any) => {
                if (currency?.toUpperCase() === 'CAD') {
                  return acc + (debit || 0);
                } else {
                  return acc + (debit || 0) * cadUsdExchangeRate;
                }
              }, 0)
              .toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
          </span>
          <span className="text-green-500">
            Credits:{' '}
            {bulkSelectTransactions
              ?.reduce((acc, { credit, currency }: any) => {
                if (currency?.toUpperCase() === 'CAD') {
                  return acc + Math.abs(credit || 0);
                } else {
                  return acc + Math.abs(credit || 0) * cadUsdExchangeRate;
                }
              }, 0)
              .toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
          </span>
        </Row>
      </Row>
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
          body={({ debit, credit }: any) => {
            const isDebit = (debit || 0) > 0;
            const value = isDebit ? -Math.abs(debit || 0) : Math.abs(credit || 0);
            const color = isDebit ? 'text-red-500' : 'text-green-500';

            return (
              <span className={color}>
                {value.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </span>
            );
          }}
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
