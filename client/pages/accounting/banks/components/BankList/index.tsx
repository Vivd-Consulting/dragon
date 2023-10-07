import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { dateFormat } from 'utils';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';

import banksQuery from './queries/banks.gql';

export default function BankList() {
  const {
    query: { loading, previousData, data },
    paginationValues,
    onPage
  } = usePaginatedQuery(banksQuery, {
    fetchPolicy: 'no-cache'
  });

  const banks = loading ? previousData?.accounting_bank : data?.accounting_bank;
  const totalRecords = loading
    ? previousData?.accounting_bank_aggregate.aggregate.count
    : data?.accounting_bank_aggregate.aggregate.count;

  return (
    <DataTable
      value={banks}
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
      emptyMessage="No Banks found."
      data-cy="banks-table"
    >
      <Column field="id" header="ID" sortable />
      <Column field="name" header="Name" />
      <Column
        body={({ created_at }) => <span>{dateFormat(created_at)}</span>}
        field="created_at"
        header="Created At"
      />
    </DataTable>
  );
}
