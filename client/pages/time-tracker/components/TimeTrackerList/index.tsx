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
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { SelectButton } from 'primereact/selectbutton';

import { Nullable } from 'primereact/ts-helpers';

import { Row } from 'components/Group';
import { InputTextDebounced } from 'components/Form';

import { dateFormat, formatDuration } from 'utils';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';

import timersQuery from './queries/timers.gql';
import deleteTimeMutation from './queries/deleteTime.gql';
import updateTimerMutation from './queries/updateTimer.gql';

import ManualTimeModal from './components/ManualTimeModal';

dayjs.extend(utc);
dayjs.extend(duration);

export default function TimeTrackerList() {
  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const [dates, setDates] = useState<Nullable<string | Date | Date[]>>(null);
  const [grouped, setGrouped] = useState(false);

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
    },
    defaultSort: { id: 'desc' }
  });

  const [deleteTimer] = useMutation(deleteTimeMutation, {
    refetchQueries: ['timers']
  });

  const [updateTimer] = useMutation(updateTimerMutation, {
    refetchQueries: ['timers']
  });

  const toastRef = useRef<Toast>(null);

  let timers = loading ? previousData?.project_time : data?.project_time;
  let totalRecords = loading
    ? previousData?.project_time_aggregate.aggregate.count
    : data?.project_time_aggregate.aggregate.count;

  if (grouped) {
    timers = _.chain(timers)
      .groupBy(({ project }) => project?.name)
      .map((timers, name) => ({
        id: timers[0].id,
        project: { name },
        description: '', // TODO
        new_time: timers.reduce((acc, { new_time }) => acc + new_time, 0), // TODO
        start_time: timers[timers.length - 1].start_time, // TODO
        end_time: timers[0].end_time, // TODO
        grouped: true,
        grouped_time: calculateTotalDurations(timers)
      }))
      .value();

    totalRecords = timers.length;
  }

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

          <SelectButton
            value={grouped ? 'Grouped' : 'Ungrouped'}
            onChange={e => setGrouped(e.value === 'Grouped')}
            options={['Grouped', 'Ungrouped']}
          />
        </Row>

        <Row>
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

          <ManualTimeModal />
        </Row>
      </Row>

      <DataTable
        value={timers}
        editMode="row"
        onRowEditComplete={onRowEditComplete}
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
          editor={options => textEditor(options)}
          style={{ width: '20%' }}
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
          body={({ start_time, end_time, new_time, grouped = false, grouped_time = null }) => (
            <span>
              {grouped
                ? grouped_time
                : new_time
                ? `${new_time} hr`
                : calculateDurationFormatted(start_time, end_time)}
            </span>
          )}
          editor={options => numberEditor(options)}
          sortable
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />

        <Column
          rowEditor
          headerStyle={{ width: '10%', minWidth: '8rem' }}
          bodyStyle={{ textAlign: 'center' }}
        />

        <Column body={useActionButtons} />
      </DataTable>
    </>
  );

  function textEditor(options) {
    const { rowData } = options;
    const { end_time, description } = rowData;

    return !!end_time && !grouped ? (
      <InputText
        type="text"
        value={options.value}
        onChange={e => options.editorCallback(e.target.value)}
      />
    ) : (
      description
    );
  }

  function numberEditor(options) {
    const { rowData } = options;
    const { new_time, start_time, end_time } = rowData;

    const value = new_time || calculateDuration(start_time, end_time).hours();

    return !!end_time && !grouped ? (
      <InputNumber
        minFractionDigits={2}
        value={value}
        onChange={e => options.editorCallback(e.value)}
      />
    ) : (
      `${value} hr`
    );
  }

  async function onRowEditComplete(e) {
    const { id, duration, description = '' } = e?.newData;

    try {
      await updateTimer({
        variables: {
          id,
          description,
          newTime: duration
        }
      });

      toastRef?.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Time Entry updated',
        life: 3000
      });
    } catch (e) {
      toastRef?.current?.show({
        life: 3000,
        severity: 'error',
        summary: 'Failed to update Time Entry.',
        detail: 'Unable to update the Time Entry at this time.'
      });
      console.error(e);
    }
  }

  function useActionButtons(data) {
    const confirmArchiveHistory = () => {
      confirmDialog({
        message: 'Are you sure you want to delete this entry?',
        header: 'Delete Time Entry',
        icon: 'pi pi-exclamation-triangle',
        accept: () => _deleteTime(data)
      });
    };

    return data?.end_time && !grouped ? (
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
    ) : null;
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
  const startTime = dayjs(start_time);
  const endTime = dayjs(end_time);

  return dayjs.duration(endTime.diff(startTime));
}

function calculateDurationFormatted(start_time, end_time) {
  if (!end_time) {
    return 0;
  }

  const duration = calculateDuration(start_time, end_time);

  return formatDuration(duration);
}

function calculateTotalDurations(data) {
  const totalDuration = data.reduce((acc, item) => {
    if (item.new_time) {
      return acc.add(item.new_time, 'h');
    }

    const startTime = dayjs(item.start_time);
    const endTime = dayjs(item.end_time);

    return acc.add(endTime.diff(startTime, 's'), 's');
  }, dayjs.duration(0));

  return formatDuration(totalDuration);
}
