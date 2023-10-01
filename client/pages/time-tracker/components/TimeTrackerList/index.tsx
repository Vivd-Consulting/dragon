import _ from 'lodash';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import { useRef, useState } from 'react';
import { useMutation } from '@apollo/client';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';

import { Nullable } from 'primereact/ts-helpers';

import { Row } from 'components/Group';
import { InputTextDebounced } from 'components/Form';

import { dateFormat } from 'utils';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';

import timersQuery from './queries/timers.gql';
import deleteTimeMutation from './queries/deleteTime.gql';

dayjs.extend(utc);
dayjs.extend(duration);

export default function TimeTrackerList() {
  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const [dates, setDates] = useState<Nullable<string | Date | Date[]>>(null);

  const where: any = {
    deleted_at: { _is_null: true }
  };

  if (searchText) {
    where._or = [
      { project: { client: { name: { _ilike: `%${searchText}%` } } } },
      { project: { name: { _ilike: `%${searchText}%` } } },
      { project: { github_repo_name: { _ilike: `%${searchText}%` } } }
    ];
  }

  if (dates && Array.isArray(dates) && dates.length > 1 && !!dates[1]) {
    where._and = [{ start_time: { _gte: dates[0] } }, { end_time: { _lte: dates[1] } }];
  }

  const {
    query: { loading, previousData, data },
    paginationValues,
    onPage
  } = usePaginatedQuery(timersQuery, {
    fetchPolicy: 'no-cache',
    variables: {
      where
    }
  });

  const [deleteTimer] = useMutation(deleteTimeMutation, {
    refetchQueries: ['timers']
  });

  const toastRef = useRef<Toast>(null);

  const timers = loading ? previousData?.project_time : data?.project_time;
  const totalRecords = loading
    ? previousData?.project_time_aggregate.aggregate.count
    : data?.project_time_aggregate.aggregate.count;

  return (
    <>
      <Toast ref={toastRef} />

      <Row className="pb-4" align="center" justify="between" gap="3">
        <Row gap="3" align="center">
          <InputTextDebounced
            placeholder="Search by name"
            value={searchText}
            onChange={e => setSearchText(e)}
          />
          <Calendar
            showButtonBar
            placeholder="Search by date"
            value={dates}
            onChange={e => setDates(e.value)}
            selectionMode="range"
            readOnlyInput
          />
        </Row>

        <Button
          size="small"
          tooltip="Clear filters"
          tooltipOptions={{ position: 'top' }}
          icon="pi pi-undo"
          onClick={() => {
            setSearchText(undefined);
            setDates(null);
          }}
        />
      </Row>

      <DataTable
        value={timers}
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
        emptyMessage="No Times found."
        data-cy="times-table"
      >
        <Column
          field="id"
          header="ID"
          sortable
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />

        <Column
          field="project.name"
          header="Project"
          sortable
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column
          field="description"
          header="Description"
          body={({ description }) => <span>{_.truncate(description, { length: 200 })}</span>}
          sortable
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column
          field="start_time"
          header="Start Time"
          body={({ start_time }) => <span>{dateFormat(start_time)}</span>}
          sortable
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column
          field="duration"
          header="Hours"
          body={({ start_time, end_time }) => (
            <span>{calculateDuration(start_time, end_time)}</span>
          )}
          sortable
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column body={useActionButtons} />
      </DataTable>
    </>
  );

  function useActionButtons(data) {
    const confirmArchiveHistory = () => {
      confirmDialog({
        message: 'Are you sure you want to delete this entry?',
        header: 'Delete Time Entry',
        icon: 'pi pi-exclamation-triangle',
        accept: () => _deleteTime(data)
      });
    };

    return (
      <Row>
        <Button
          size="small"
          severity="danger"
          tooltip="Archive"
          tooltipOptions={{ position: 'top' }}
          icon="pi pi-trash"
          onClick={confirmArchiveHistory}
        />
      </Row>
    );
  }

  async function _deleteTime(data) {
    const date = new Date();

    try {
      await deleteTimer({
        variables: { id: data.id, deleted_at: date }
      });

      toastRef?.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Time Entry deleted',
        life: 3000
      });
    } catch (e) {
      toastRef?.current?.show({
        life: 3000,
        severity: 'error',
        summary: 'Failed to delete Time Entry.',
        detail: 'Unable to delete the Time Entry at this time.'
      });
      console.error(e);
    }
  }
}

function calculateDuration(start_time, end_time) {
  if (!end_time) {
    return '--:--:--';
  }

  const startTime = dayjs(start_time);
  const endTime = dayjs(end_time);

  const duration = dayjs.duration(endTime.diff(startTime));

  const formattedHours = String(duration.hours()).padStart(2, '0');
  const formattedMinutes = String(duration.minutes()).padStart(2, '0');
  const formattedSeconds = String(duration.seconds()).padStart(2, '0');

  const formattedTotalTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

  return formattedTotalTime;
}
