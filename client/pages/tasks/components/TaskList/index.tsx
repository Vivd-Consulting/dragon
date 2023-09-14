import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import { Row } from 'components/Group';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';

import tasksQuery from './queries/tasks.gql';

export default function TaskList() {
  const [searchText, setSearchText] = useState<string | undefined>(undefined);

  const where: any = {
    archived_at: { _is_null: true }
  };

  if (searchText) {
    where._or = [{ title: { _ilike: `%${searchText}%` } }];
  }

  const {
    query: { loading, previousData, data },
    paginationValues,
    onPage
  } = usePaginatedQuery(tasksQuery, {
    fetchPolicy: 'no-cache',
    variables: {
      where
    }
  });

  const toastRef = useRef<Toast>(null);

  const tasks = loading ? previousData?.task : data?.task;
  const totalRecords = loading
    ? previousData?.task_aggregate.aggregate.count
    : data?.task_aggregate.aggregate.count;

  return (
    <>
      <Toast ref={toastRef} />

      <DataTable
        value={tasks}
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
        emptyMessage="No Tasks found."
        data-cy="tasks-table"
      >
        <Column
          field="id"
          header="ID"
          sortable
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column body={useActionButtons} />
      </DataTable>
    </>
  );

  function useActionButtons(data) {
    const router = useRouter();

    return (
      <Row>
        <Button
          size="small"
          icon="pi pi-user-edit"
          tooltip="Edit"
          tooltipOptions={{ position: 'top' }}
          onClick={() => router.push(`/tasks/edit/${data?.id}`)}
        />
      </Row>
    );
  }
}
