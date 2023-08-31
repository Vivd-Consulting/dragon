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

  const wireRequests = loading ? previousData?.wire_request : data?.wire_request;
  const totalRecords = loading
    ? previousData?.client_aggregate.aggregate.count
    : data?.client_aggregate.aggregate.count;

  return (
    <DataTable
      value={data?.client}
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
      data-cy="wires-table"
    >
      <Column
        field="id"
        header="ID"
        sortable
        headerClassName="white-space-nowrap"
        className="white-space-nowrap"
      />
      <Column
        field="created_at"
        header="Created At"
        body={({ created_at }) => <span>{new Date(created_at).toLocaleString()}</span>}
        sortable
        headerClassName="white-space-nowrap"
        className="white-space-nowrap"
      />
      <Column
        field="name"
        header="Name"
        headerClassName="white-space-nowrap"
        className="white-space-nowrap"
      />
      <Column
        field="description"
        header="Description"
        headerClassName="white-space-nowrap"
        className="white-space-nowrap"
      />
      <Column
        field="gpt_persona"
        header="GPT Persona"
        headerClassName="white-space-nowrap"
        className="white-space-nowrap"
      />
      <Column
        field="document"
        header="Document"
        headerClassName="white-space-nowrap"
        className="white-space-nowrap"
      />
      <Column
        field="start_date"
        header="Start Date"
        headerClassName="white-space-nowrap"
        className="white-space-nowrap"
      />
      <Column
        field="end_date"
        header="End Date"
        headerClassName="white-space-nowrap"
        className="white-space-nowrap"
      />
    </DataTable>
  );
}
