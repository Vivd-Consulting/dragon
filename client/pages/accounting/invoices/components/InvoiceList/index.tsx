import _ from 'lodash';
import dayjs from 'dayjs';

import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { useRef } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Badge } from 'primereact/badge';

import { Row } from 'components/Group';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';

import calculateTotalTimeAndCost from 'utils/calculateTotalTimeAndCost';

import invoicesQuery from './queries/invoices.gql';
import archiveInvoiceMutation from './queries/archiveInvoice.gql';

export default function InvoiceList() {
  const {
    query: { loading, previousData, data },
    paginationValues,
    onPage
  } = usePaginatedQuery(invoicesQuery, {
    fetchPolicy: 'no-cache',
    variables: {
      where: {
        archived_at: { _is_null: true }
      }
    }
  });

  const [archiveInvoice] = useMutation(archiveInvoiceMutation, {
    refetchQueries: ['invoices']
  });

  const toastRef = useRef<Toast>(null);

  const clients = loading ? previousData?.invoice : data?.invoice;
  const totalRecords = loading
    ? previousData?.invoice_aggregate.aggregate.count
    : data?.invoice_aggregate.aggregate.count;

  return (
    <>
      <Toast ref={toastRef} />

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
        emptyMessage="No invoices found."
        data-cy="invoices-table"
      >
        <Column
          field="id"
          header="ID"
          sortable
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />

        <Column
          field="client.name"
          header="Client Name"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />

        <Column
          body={({ client }) => {
            const contractors = _.get(client, 'projects[0].contractors');

            return (
              <>
                {contractors.map(({ contractor }) => (
                  <Row key={contractor.id}>
                    <span>{contractor.name}</span>
                  </Row>
                ))}
              </>
            );
          }}
          header="Contractors"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />

        <Column
          body={({ client }) => {
            const projectTimes = _.get(client, 'projects[0].project_times');

            const { totalTime } = calculateTotalTimeAndCost(projectTimes);

            return <span>{totalTime}</span>;
          }}
          header="Total time"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />

        <Column
          body={({ client }) => {
            const projectTimes = _.get(client, 'projects[0].project_times');

            // TODO: Add dynamic rates here
            const { totalCost } = calculateTotalTimeAndCost(projectTimes, 20);

            return (
              <span>
                {totalCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
            );
          }}
          header="Cost"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />

        <Column
          body={({ submitted_at, paid_at }) => {
            interface IStatus {
              value: string;
              severity: 'warning' | 'info' | 'success' | 'danger' | null | undefined;
            }

            const status = {
              value: 'Draft',
              severity: 'warning'
            } as IStatus;

            if (submitted_at) {
              status.value = 'Submitted';
              status.severity = 'info';
            }

            if (paid_at) {
              status.value = 'Paid';
              status.severity = 'success';
            }

            return <Badge value={status.value} severity={status.severity} />;
          }}
          header="Status"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />

        <Column body={useActionButtons} />
      </DataTable>
    </>
  );

  function useActionButtons(data) {
    const router = useRouter();

    const confirmArchiveInvoice = () => {
      confirmDialog({
        message: 'Are you sure you want to archive this invoice?',
        header: 'Archive Invoice',
        icon: 'pi pi-exclamation-triangle',
        accept: () => _archiveInvoice(data)
      });
    };

    return (
      <Row>
        <Button
          size="small"
          tooltip="View"
          tooltipOptions={{ position: 'top' }}
          icon="pi pi-eye"
          // onClick={...}
        />
        <Button
          size="small"
          icon="pi pi-user-edit"
          tooltip="Edit"
          tooltipOptions={{ position: 'top' }}
          onClick={() => router.push(`/accounting/invoices/${data.id}/edit`)}
        />
        <Button
          size="small"
          tooltip="Archive"
          tooltipOptions={{ position: 'top' }}
          severity="danger"
          icon="pi pi-trash"
          onClick={confirmArchiveInvoice}
        />
      </Row>
    );
  }

  async function _archiveInvoice(data) {
    const date = new Date();

    try {
      await archiveInvoice({
        variables: { id: data.id, archived_at: date }
      });

      toastRef?.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Client is archived!',
        life: 3000
      });
    } catch (e) {
      toastRef?.current?.show({
        life: 3000,
        severity: 'error',
        summary: 'Failed to archive client.',
        detail: 'Unable to archive the client at this time.'
      });
      console.error(e);
    }
  }
}
