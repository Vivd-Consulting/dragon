import _ from 'lodash';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import { InputTextDebounced } from 'components/Form';
import { Row } from 'components/Group';
import { AssignContractorTaskDropdown } from 'components/AssignContractorTaskDropdown';

import { dateFormat } from 'utils';

import { TASK_PRIORITY } from 'consts';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';
import { useAuth } from 'hooks/useAuth';

import tasksQuery from './queries/tasks.gql';
import TaskPreview from './components/TaskPreview';

interface ITaskViewedBy {
  task_viewed_by: {
    dragon_user: {
      id: string;
    };
  }[];
}

// TODO: Add an accurate interface
interface ITask extends ITaskViewedBy {}

export default function TaskList() {
  const { dragonUser } = useAuth();
  const [searchText, setSearchText] = useState<string | undefined>(undefined);

  const where: any = {
    deleted_at: { _is_null: true }
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

      <Row align="center" px={2} pb={4}>
        <InputTextDebounced
          placeholder="Search by"
          value={searchText}
          onChange={e => setSearchText(e)}
        />
      </Row>

      <DataTable
        rowClassName={(data: ITask) =>
          data?.task_viewed_by?.find(({ dragon_user }) => dragon_user.id === dragonUser.id)
            ? 'surface-50'
            : ''
        }
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
        <Column
          header="Priority"
          body={({ priority }) => {
            const taskPriority = TASK_PRIORITY.find(x => x.id === priority);

            if (!taskPriority) {
              return null;
            }

            return (
              <Row align="center" gap="2" className={`${taskPriority.textColor}`}>
                <FontAwesomeIcon icon={taskPriority.icon} size="sm" />
                <div>{taskPriority.name}</div>
              </Row>
            );
          }}
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column
          field="title"
          header="Title"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column
          field="project.name"
          header="Project"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column
          field="description"
          body={({ description }) => <span>{_.truncate(description, { length: 100 })}</span>}
          header="Description"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column
          body={({ due_date }) => <span>{dateFormat(due_date)}</span>}
          field="due_date"
          header="Due Date"
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
      <Row align="center" justify="between" gap="5">
        <AssignContractorTaskDropdown taskId={data?.id} />
        <Row align="center">
          <Button
            size="small"
            icon="pi pi-user-edit"
            tooltip="Edit"
            tooltipOptions={{ position: 'top' }}
            onClick={() => router.push(`/tasks/edit/${data?.id}`)}
          />
          <TaskPreview data={data} toastRef={toastRef} />
        </Row>
      </Row>
    );
  }
}
