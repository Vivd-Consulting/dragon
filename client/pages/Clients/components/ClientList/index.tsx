import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';

import clientQuery from './queries/clients.gql';

export default function ClientList() {
  const {
    query: { loading, previousData, data },
    paginationValues,
    onPage
  } = usePaginatedQuery(clientQuery, {
    fetchPolicy: 'no-cache'
  });

  const clients = loading ? previousData?.clients : data?.clients;
  const totalRecords = loading
    ? previousData?.client_aggregate.aggregate.count
    : data?.client_aggregate.aggregate.count;

  return (
    <DataTable
      value={clients}
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
      emptyMessage="No Clients found."
      data-cy="clients-table"
    >
      <Column field="id" header="ID" sortable />
      <Column
        field="created_at"
        header="Created At"
        body={({ created_at }) => <span>{new Date(created_at).toLocaleString()}</span>}
        sortable
      />
    </DataTable>
  );
}
