import { useRef } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import { Row } from 'components/Group';
import { dateFormat } from 'utils';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';

// TODO: Move these into a shared folder
import GicModal from '../GicModal';
import useSelectedTransactions from '../../hooks/useSelectedTransactions';

import transactionsQuery from './queries/transactions.gql';

export default function TransactionList() {
  const {
    query: { loading, previousData, data },
    paginationValues,
    onPage
  } = usePaginatedQuery(transactionsQuery, {
    fetchPolicy: 'no-cache',
    variables: {
      where: {
        gic_id: { _is_null: true }
      }
    },
    defaultSort: { tid: 'asc', date: 'desc' }
  });

  const { setSelectedTransactions } = useSelectedTransactions();

  const toastRef = useRef<Toast>(null);

  const transactions = loading
    ? previousData?.accounting_transactions
    : data?.accounting_transactions;
  const totalRecords = loading
    ? previousData?.accounting_transactions_aggregate.aggregate.count
    : data?.accounting_transactions_aggregate.aggregate.count;

  return (
    <>
      <Toast ref={toastRef} />

      <GicModal />

      <DataTable
        value={transactions}
        dataKey="id"
        // selected={transactions}
        // onSelectionChange={e => setSelectedTransactions({ transactions: e.value, type: 'credit' })}
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
        <Column field="id" header="ID" sortable />
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
          sortable
        />
        <Column
          body={({ date }) => <span>{dateFormat(date)}</span>}
          field="date"
          header="Date"
          sortable
        />
        <Column body={useActionButtons} />
      </DataTable>
    </>
  );

  function useActionButtons(data) {
    // const router = useRouter();

    // const confirmArchiveClient = () => {
    //   confirmDialog({
    //     message: `Are you sure you want to archive ${data.name}?`,
    //     header: 'Archive Contractor',
    //     icon: 'pi pi-exclamation-triangle',
    //     accept: () => _archiveContractor(data)
    //   });
    // };

    return (
      <Row>
        <Button
          size="small"
          severity="success"
          tooltip="Mark Personal"
          tooltipOptions={{ position: 'top' }}
          icon="pi pi-sun"
          onClick={() => markPersonal(data)}
        />
        <Button
          size="small"
          tooltip="Mark Business"
          tooltipOptions={{ position: 'top' }}
          icon="pi pi-briefcase"
          onClick={() => markBusiness(data)}
        />
        <Button
          size="small"
          severity="danger"
          tooltip="Mark Transfer"
          tooltipOptions={{ position: 'top' }}
          icon="pi pi-send"
          onClick={() => markTransfer(data)}
        />
        {/* <Button
          size="small"
          severity="danger"
          tooltip="Archive"
          tooltipOptions={{ position: 'top' }}
          icon="pi pi-trash"
          onClick={confirmArchiveClient}
        /> */}
      </Row>
    );
  }

  function markPersonal(data) {
    // setTransactionPurpose({
    //   variables: {
    //     id,
    //     purpose: 'personal'
    //   }
    // });

    setSelectedTransactions({
      transactions: [data],
      type: 'personal'
    });
  }

  function markBusiness(data) {
    // setTransactionPurpose({
    //   variables: {
    //     id,
    //     purpose: 'business'
    //   }
    // });

    setSelectedTransactions({
      transactions: [data],
      type: 'business'
    });
  }

  function markTransfer({ id }) {
    // setTransactionPurpose({
    //   variables: {
    //     id,
    //     purpose: 'transfer'
    //   }
    // });
  }
}
