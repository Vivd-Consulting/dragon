import _ from 'lodash';
import { useState, useRef, useEffect } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { SelectButton } from 'primereact/selectbutton';

import { Row } from 'components/Group';
import { InputTextDebounced } from 'components/Form';

import { dateFormat } from 'utils';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';

// TODO: Move these into a shared folder
import GicModal from '../GicModal';
import useSelectedTransactions from '../../hooks/useSelectedTransactions';

import AccountsDropdown from './components/AccountsDropdown';

import transactionsQuery from './queries/transactions.gql';

export default function TransactionList() {
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const [transactionType, setTransactionType] = useState<string | undefined>(undefined);
  const [onlyUncategorizedTransactions, setOnlyUncategorizedTransactions] = useState<boolean>(true);

  const where: any = {
    gic_id: { _is_null: onlyUncategorizedTransactions }
  };

  if (selectedAccount) {
    where.account_id = { _eq: selectedAccount };
  }

  if (searchText) {
    where._or = [
      { description: { _ilike: `%${searchText}%` } },
      { debit: { _eq: parseFloat(searchText) || -1 } },
      { credit: { _eq: parseFloat(searchText) || -1 } }
    ];
  }

  if (transactionType) {
    if (transactionType === 'debit') {
      where.debit = { _gt: 0 };
    } else {
      where.credit = { _gt: 0 };
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
    defaultSort: { tid: 'asc', date: 'desc' }
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
    searchText,
    transactionType,
    onlyUncategorizedTransactions,
    setBulkSelectTransactions
  ]);

  return (
    <>
      <Toast ref={toastRef} />

      <GicModal />

      <Row align="center" justify="between" px={2} pb={4}>
        <Row>
          <Button
            icon="pi pi-refresh"
            className="p-button-secondary"
            onClick={() => {
              setSearchText('');
              setSelectedAccount(undefined);
              setTransactionType(undefined);
              setOnlyUncategorizedTransactions(true);
            }}
          />
          <InputTextDebounced
            icon="pi-search"
            placeholder="Search by"
            value={searchText}
            onChange={e => setSearchText(e)}
          />
          <AccountsDropdown value={selectedAccount} onChange={setSelectedAccount} />
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
        </Row>
        <Row>
          <span className="text-red-500">
            Debits:{' '}
            {bulkSelectTransactions
              ?.reduce((acc, { debit }) => acc + debit, 0)
              // Convert to a currency string
              .toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              })}
          </span>
          <span className="text-green-500">
            Credits:{' '}
            {bulkSelectTransactions
              ?.reduce((acc, { credit }) => acc + credit, 0)
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
        emptyMessage="No Contractors found."
        data-cy="contractors-table"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
        <Column field="id" header="ID" sortable />
        <Column field="tid" header="TID" sortable />
        <Column field="account.name" header="Account" sortable />
        <Column field="description" header="Description" />
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
        {!onlyUncategorizedTransactions && <Column field="gic.name" header="Category" sortable />}
        {!onlyUncategorizedTransactions && (
          <Column
            field="gic.is_business"
            header="Type"
            body={({ gic }) => (
              <i className={`pi pi-${gic?.is_business ? 'briefcase' : 'user'}`}></i>
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
        {onlyUncategorizedTransactions && <Column body={useActionButtons} />}
      </DataTable>
    </>
  );

  function useActionButtons(data) {
    const _data = bulkSelectTransactions.length > 0 ? bulkSelectTransactions : [data];

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
