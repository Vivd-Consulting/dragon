import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { useRef } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';

import { Row } from 'components/Group';

import { dateFormat } from 'utils';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';

import contractorsQuery from './queries/contractors.gql';
import archiveContractorMutation from './queries/archiveContractor.gql';

export default function ContractorList() {
  const {
    query: { loading, previousData, data },
    paginationValues,
    onPage
  } = usePaginatedQuery(contractorsQuery, {
    fetchPolicy: 'no-cache',
    variables: {
      where: {
        archived_at: { _is_null: true }
      }
    }
  });

  const [archiveContractor] = useMutation(archiveContractorMutation, {
    refetchQueries: ['contractors', 'contractor']
  });

  const toastRef = useRef<Toast>(null);

  const contractors = loading ? previousData?.contractor : data?.contractor;
  const totalRecords = loading
    ? previousData?.contractor_aggregate.aggregate.count
    : data?.contractor_aggregate.aggregate.count;

  return (
    <>
      <Toast ref={toastRef} />

      <DataTable
        value={contractors}
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
        emptyMessage="No Contractors found."
        data-cy="contractors-table"
      >
        <Column
          field="id"
          header="ID"
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
          field="location"
          header="Location"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column
          body={({ contractor_rate }) => {
            const rate = `${contractor_rate.rate.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD'
            })}/hr`;

            return <Row>{rate}</Row>;
          }}
          field="contractor_rate.rate"
          header="Rate"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column
          body={({ start_date }) => <span>{dateFormat(start_date)}</span>}
          field="start_date"
          header="Start Date"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column
          body={({ end_date }) => <span>{dateFormat(end_date)}</span>}
          field="end_date"
          header="End Date"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column body={useActionButtons} />
      </DataTable>
    </>
  );

  function useActionButtons(data) {
    const router = useRouter();

    const confirmArchiveClient = () => {
      confirmDialog({
        message: `Are you sure you want to archive ${data.name}?`,
        header: 'Archive Contractor',
        icon: 'pi pi-exclamation-triangle',
        accept: () => _archiveContractor(data)
      });
    };

    return (
      <Row>
        <Button
          size="small"
          tooltip="Edit"
          tooltipOptions={{ position: 'top' }}
          icon="pi pi-user-edit"
          onClick={() => router.push(`/contractors/edit/${data?.id}`)}
        />
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

  async function _archiveContractor(data) {
    const date = new Date();

    try {
      await archiveContractor({
        variables: { id: data.id, archived_at: date }
      });

      toastRef?.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Contractor is archived',
        life: 3000
      });
    } catch (e) {
      toastRef?.current?.show({
        life: 3000,
        severity: 'error',
        summary: 'Failed to archive contractor.',
        detail: 'Unable to archive the contractor at this time.'
      });
      console.error(e);
    }
  }
}
