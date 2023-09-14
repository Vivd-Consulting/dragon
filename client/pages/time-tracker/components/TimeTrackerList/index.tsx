import { useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

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
    const startDate = dayjs(dates[0]).toISOString();
    const endDate = dayjs(dates[1]).toISOString();

    where._and = [
      { start_time: { _gte: dayjs(dates[0]).toISOString() } },
      { end_time: { _lte: dayjs(dates[1]).toISOString() } }
    ];
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

      <Row className="pb-4" align="center" gap="3">
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
          field="project.client.name"
          header="Client"
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
          field="start_time"
          header="Start Time"
          body={({ start_time }) => <span>{dateFormat(start_time)}</span>}
          sortable
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column
          field="end_time"
          header="End Time"
          body={({ end_time }) => <span>{dateFormat(end_time)}</span>}
          sortable
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column
          field="duration"
          header="Duration"
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
    const confirmArchiveClient = () => {
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
          onClick={confirmArchiveClient}
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

function nowUTC() {
  return dayjs.utc();
}

function dateUTC(date) {
  return dayjs.utc(date);
}

function calculateDuration(startTime, endTime) {
  const start = dayjs(startTime);
  const end = dayjs(endTime);

  const duration = end.diff(start, 'second');
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

function diffMinutes(start, end) {
  // TODO: Return difference as hours:minutes:seconds
  return dateUTC(end).diff(dateUTC(start), 'minutes');
}
