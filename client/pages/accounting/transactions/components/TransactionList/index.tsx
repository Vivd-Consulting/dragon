import _ from 'lodash';
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

import { Row } from 'components/Group';
import { InputTextDebounced } from 'components/Form';

import { dateFormat } from 'utils';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';

// TODO: Move these into a shared folder
import CategoryModal from '../CategoryModal';
import TransferModal from '../TransferModal';
import useSelectedTransactions from '../../hooks/useSelectedTransactions';

import AccountsDropdown from './components/AccountsDropdown';
import CategoryDropdown from './components/CategoryDropdown';

import transactionsQuery from './queries/transactions.gql';

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

  const where: any = {
    gic_category_id: { _is_null: onlyUncategorizedTransactions }
  };

  if (dateRange && dateRange.length > 1) {
    where.date = {
      _gte: dateRange[0],
      _lte: dateRange[1]
    };
  }

  if (selectedAccount) {
    where.account_id = { _eq: selectedAccount };
  }

  if (selectedCategory) {
    where.gic_category_id = { _eq: selectedCategory };
  }

  if (searchText) {
    where._or = [
      { name: { _ilike: `%${searchText}%` } },
      { debit: { _eq: parseFloat(searchText) || -1 } },
      { credit: { _eq: parseFloat(searchText) || -1 } }
    ];
  }

  if (transactionType) {
    if (transactionType === 'debit') {
      where.debit = { _gt: 0 };
    } else {
      where.credit = { _lt: 0 };
    }
  }

  const {
    query: { loading, previousData, data },
    paginationValues,
    onPage
  } = usePaginatedQuery(transactionsQuery, {
    fetchPolicy: 'no-cache',
    variables: {
      where
    },
    defaultSort: { date: 'desc' }
  });

  const toastRef = useRef<Toast>(null);

  const transactions = loading
    ? previousData?.accounting_transactions
    : data?.accounting_transactions;
  const totalRecords = loading
    ? previousData?.accounting_transactions_aggregate.aggregate.count
    : data?.accounting_transactions_aggregate.aggregate.count;

  const { setSelectedTransactions, bulkSelectTransactions, setBulkSelectTransactions } =
    useSelectedTransactions();

  // If any of our search params change, reset the bulk select transactions
  useEffect(() => {
    setBulkSelectTransactions([]);
  }, [
    selectedAccount,
    selectedCategory,
    searchText,
    transactionType,
    onlyUncategorizedTransactions,
    dateRange,
    setBulkSelectTransactions
  ]);

  useKeyPress(['meta.p'], e => {
    if (bulkSelectTransactions.length > 0) {
      e.preventDefault();
      markPersonal(bulkSelectTransactions);
    }
  });
  useKeyPress(['meta.b'], e => {
    if (bulkSelectTransactions.length > 0) {
      e.preventDefault();
      markBusiness(bulkSelectTransactions);
    }
  });
  useKeyPress(['meta.a'], e => {
    e.preventDefault();

    if (transactions?.length > 0) {
      const transactionsIds = transactions.map(({ id }) => id);

      if (
        _.isEqual(
          transactionsIds,
          bulkSelectTransactions.map(({ id }) => id)
        )
      ) {
        setBulkSelectTransactions([]);
      } else {
        setBulkSelectTransactions(transactions);
      }
    }
  });

  return (
    <>
      <Toast ref={toastRef} />

      <CategoryModal />
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
            onChange={e => setSearchText(e)}
          />
          <AccountsDropdown value={selectedAccount} onChange={setSelectedAccount} />
          <Calendar
            value={dateRange}
            onChange={e => setDateRange(e.value)}
            selectionMode="range"
            readOnlyInput
            showButtonBar
          />
          <SelectButton
            value={transactionType}
            itemTemplate={transactionTypeTemplate}
            onChange={e => setTransactionType(e.value)}
            options={['debit', 'credit']}
          />
          <SelectButton
            value={onlyUncategorizedTransactions ? 'Uncategorized' : 'Categorized'}
            onChange={e => setOnlyUncategorizedTransactions(e.value === 'Uncategorized')}
            options={['Uncategorized', 'Categorized']}
            unselectable={false}
          />
          <InputNumber
            value={cadUsdExchangeRate}
            onChange={e => setCadUsdExchangeRate(Number(e.value))}
            placeholder="USD/CAD Exchange"
            mode="decimal"
            minFractionDigits={2}
          />
          <CategoryDropdown value={selectedCategory} onChange={setSelectedCategory} />
        </Row>
        <Row>
          <span className="text-red-500">
            Debits:{' '}
            {bulkSelectTransactions
              ?.reduce((acc, { debit, currency }) => {
                if (currency.toUpperCase() === 'CAD') {
                  return acc + debit;
                } else {
                  return acc + debit * cadUsdExchangeRate;
                }
              }, 0)
              // Convert to a currency string
              .toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              })}
          </span>
          <span className="text-green-500">
            Credits:{' '}
            {bulkSelectTransactions
              ?.reduce((acc, { credit, currency }) => {
                if (currency.toUpperCase() === 'CAD') {
                  return acc + Math.abs(credit);
                } else {
                  return acc + Math.abs(credit) * cadUsdExchangeRate;
                }
              }, 0)
              // Convert to a currency string
              .toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              })}
          </span>
        </Row>
      </Row>
      <DataTable
        value={transactions}
        dataKey="id"
        selection={bulkSelectTransactions}
        onSelectionChange={e => setBulkSelectTransactions(e.value as any)}
        selectionMode="checkbox"
        paginator
        lazy
        onPage={onPage}
        first={paginationValues.first}
        rows={paginationValues.rows}
        onSort={onPage}
        sortField={paginationValues.sortField}
        sortOrder={paginationValues.sortOrder}
        totalRecords={totalRecords}
        removableSort
        responsiveLayout="scroll"
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No Transactions found."
        data-cy="transactions-table"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
        {/* <Column field="id" header="ID" sortable /> */}
        <Column field="account.name" header="Account" sortable />
        <Column field="name" header="Description" />
        {/* <Column
          field="personal_finance_category"
          header="Personal Category"
          body={({ personal_finance_category, personal_finance_category_confidence }) => (
            <span>
              {personal_finance_category} ({personal_finance_category_confidence})
            </span>
          )}
        /> */}
        <Column
          field="personalCategory.hirearchy"
          header="Hierarchy"
          body={({ personalCategory }) => <span>{personalCategory?.hierarchy.join(', ')}</span>}
        />
        <Column
          field="amount"
          header="Amount"
          body={({ debit, credit }) => {
            const isDebit = debit > 0;
            const value = isDebit ? -Math.abs(debit) : Math.abs(credit);
            const color = isDebit ? 'text-red-500' : 'text-green-500';

            return (
              <span className={color}>
                {value.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
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
          body={({ currency }) => <span>{currency}</span>}
          sortable
        />
        {!onlyUncategorizedTransactions && (
          <Column field="gicCategory.name" header="Category" sortable />
        )}
        {!onlyUncategorizedTransactions && (
          <Column
            field="gicCategory.is_business"
            header="Type"
            body={({ gicCategory }) => (
              <i className={`pi pi-${gicCategory?.is_business ? 'briefcase' : 'user'}`}></i>
            )}
            sortable
          />
        )}
        <Column
          body={({ date }) => <span>{dateFormat(date)}</span>}
          field="date"
          header="Date"
          sortable
        />
        {!onlyUncategorizedTransactions && (
          <Column
            body={({ applied_rule }) =>
              applied_rule ? <Tag severity="info" value={`R${applied_rule}`} /> : <Tag value="M" />
            }
            field="applied_rule"
            header="Applied Rule"
          />
        )}
        {onlyUncategorizedTransactions && <Column body={useActionButtons} />}
      </DataTable>
    </>
  );

  function useActionButtons(data) {
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

  function markPersonal(data) {
    setSelectedTransactions({
      transactions: data,
      type: 'personal'
    });
  }

  function markBusiness(data) {
    setSelectedTransactions({
      transactions: data,
      type: 'business'
    });
  }

  function markTransfer(data) {
    setTransferSource(data);
  }

  function transactionTypeTemplate(option) {
    return (
      <div className="flex align-items-center gap-2">
        {option === 'credit' ? (
          <i className="pi pi-arrow-up" style={{ color: 'green' }}></i>
        ) : (
          <i className="pi pi-arrow-down" style={{ color: 'red' }}></i>
        )}
        <div>{_.upperFirst(option)}</div>
      </div>
    );
  }
}
