import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { useRef } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';

import { Row } from 'components/Group';
import { dateFormat } from 'utils';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';

import debitQuery from './queries/debits.gql';

export default function DebitList() {
  const {
    query: { loading, previousData, data },
    paginationValues,
    onPage
  } = usePaginatedQuery(debitQuery, {
    fetchPolicy: 'no-cache'
  });

  // const [archiveContractor] = useMutation(archiveContractorMutation, {
  //   refetchQueries: ['contractors', 'contractor']
  // });

  const toastRef = useRef<Toast>(null);

  const debits = loading ? previousData?.debit : data?.debit;
  const totalRecords = loading
    ? previousData?.debit_aggregate.aggregate.count
    : data?.debit_aggregate.aggregate.count;

  return (
    <>
      <Toast ref={toastRef} />

      <DataTable
        value={debits}
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
        <Column field="account.name" header="Account" sortable />
        <Column field="description" header="Description" />
        <Column
          field="amount"
          header="Amount"
          body={({ amount }) => (
            <span>{amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
          )}
          sortable
        />
        <Column
          body={({ date }) => <span>{dateFormat(date)}</span>}
          field="date"
          header="Date"
          sortable
        />
      </DataTable>
    </>
  );
}
