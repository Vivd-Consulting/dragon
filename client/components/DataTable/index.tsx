import { DataTable as PrimeDataTable } from 'primereact/datatable';

export function DataTable({ value, emptyMessage, chlidren }) {
  return (
    <PrimeDataTable
      value={value}
      paginator
      responsiveLayout="scroll"
      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
      rows={10}
      rowsPerPageOptions={[10, 25, 50, 100]}
      emptyMessage={emptyMessage}
    >
      {chlidren}
    </PrimeDataTable>
  );
}
