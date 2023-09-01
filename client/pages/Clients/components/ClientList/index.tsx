import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { useRef } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { SplitButton } from 'primereact/splitbutton';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';

import clientQuery from './queries/clients.gql';
import archiveClientMutation from './queries/archiveClient.gql';

export default function ClientList() {
  const {
    query: { loading, previousData, data },
    paginationValues,
    onPage
  } = usePaginatedQuery(clientQuery, {
    fetchPolicy: 'no-cache'
  });

  const [archiveClient] = useMutation(archiveClientMutation);

  const toastRef = useRef<Toast>(null);

  const wireRequests = loading ? previousData?.wire_request : data?.wire_request;
  const totalRecords = loading
    ? previousData?.client_aggregate.aggregate.count
    : data?.client_aggregate.aggregate.count;

  return (
    <>
      <Toast ref={toastRef} />

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
        <Column body={useActionButtons} />
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
          body={({ document }) => (
            <a
              href={document ?? ''}
              rel="noopener noreferrer"
              target="_blank"
              className="flex items-center gap-2 hover:text-blue-500"
            >
              <div className="pi pi-link" />
              View
            </a>
          )}
          field="document"
          header="Document"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column
          body={({ start_date }) => <span>{new Date(start_date).toISOString()}</span>}
          field="start_date"
          header="Start Date"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column
          body={({ end_date }) => <span>{new Date(end_date).toLocaleString()}</span>}
          field="end_date"
          header="End Date"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
      </DataTable>
    </>
  );

  function useActionButtons(data) {
    const router = useRouter();

    const confirmArchiveClient = () => {
      confirmDialog({
        message: `Are you sure you want to archive ${data.name}?`,
        header: 'Archive Client',
        icon: 'pi pi-exclamation-triangle',
        accept: () => _archiveClient(data.id)
      });
    };

    return (
      <SplitButton
        size="small"
        icon="pi pi-user-edit"
        id="user-profile"
        onClick={() => router.push(`/clients/edit/${data?.id}`)}
        model={[
          {
            label: 'Archive User',
            icon: 'pi pi-folder',
            command: () => confirmArchiveClient()
          }
        ]}
        className="p-button-raised p-button-secondary p-button-text mb-2"
      />
    );
  }

  async function _archiveClient(id) {
    const date = new Date();

    try {
      await archiveClient({
        variables: { id, archived_at: date }
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
