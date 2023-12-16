import Image from 'next/image';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { dateFormat } from 'utils';

import { UpdatePlaidLink } from 'components/PlaidLink';

export default function BankList({ paginatedQuery }) {
  const {
    query: { loading, previousData, data },
    refetch,
    paginationValues,
    onPage
  } = paginatedQuery;

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
      <Column
        field="logo"
        body={({ name, logo, primary_color }) => {
          // logo is base64 encoded
          return logo ? (
            <Image
              src={`data:image/png;base64,${logo}`}
              alt={name}
              height={30}
              width={30}
              style={{ borderRadius: 15 }}
            />
          ) : (
            <div
              style={{ backgroundColor: primary_color, height: 30, width: 30, borderRadius: 15 }}
            />
          );
        }}
      />
      <Column field="name" header="Name" />
      <Column
        body={({ created_at }) => <span>{dateFormat(created_at)}</span>}
        field="created_at"
        header="Created At"
      />
      <Column
        body={({ error }) =>
          error ? <span className="text-red-500">{error}</span> : <i className="pi pi-check"></i>
        }
        field="error"
        header="Errors"
      />
      <Column
        header="Actions"
        body={({ token }) => (
          <UpdatePlaidLink oldToken={token} onSuccess={onSuccessLink} onFail={onFailLink} />
        )}
      />
    </DataTable>
  );

  function onSuccessLink() {
    refetch();
    // toast.current.show({
    //   severity: 'success',
    //   summary: 'Success',
    //   detail: 'Bank is successfully linked!',
    //   life: 3000
    // });
  }

  function onFailLink() {
    // toast.current.show({
    //   severity: 'error',
    //   summary: 'Error',
    //   detail: 'Bank failed to link!',
    //   life: 3000
    // });
  }
}
