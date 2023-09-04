import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { useRef } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';

import { Row } from 'components/Group';
import { dateFormat } from 'utils';

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

  const [archiveClient] = useMutation(archiveClientMutation, {
    refetchQueries: ['clients', 'client']
  });

  const toastRef = useRef<Toast>(null);

  const clients = loading ? previousData?.client : data?.client;
  const totalRecords = loading
    ? previousData?.client_aggregate.aggregate.count
    : data?.client_aggregate.aggregate.count;

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
        emptyMessage="No Clients found."
        data-cy="clients-table"
      >
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
          body={({ created_at }) => <span>{dateFormat(created_at)}</span>}
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
        <Column
          body={({ archived_at }) => {
            const isArchived = !!archived_at;
            const archivedDate = dateFormat(archived_at);

            return (
              <>
                <Tooltip target=".pi-check" />
                <i
                  data-pr-tooltip={isArchived ? archivedDate : ''}
                  data-pr-position="bottom"
                  className={`pi ${isArchived ? 'pi-check text-green-500' : 'pi-minus'}`}
                />
              </>
            );
          }}
          field="archived_at"
          header="Archived"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column body={useActionButtons} />
      </DataTable>
    </>
  );

  function useActionButtons(data) {
    const router = useRouter();
    const isArchived = !!data.archived_at;

    const confirmArchiveClient = () => {
      confirmDialog({
        message: `Are you sure you want to ${isArchived ? 'unarchive' : 'archive'} ${data.name}?`,
        header: `${isArchived ? 'Unarchive' : 'Archive'} Client`,
        icon: 'pi pi-exclamation-triangle',
        accept: () => _archiveClient(data)
      });
    };

    return (
      <Row>
        <Button
          size="small"
          icon="pi pi-user-edit"
          onClick={() => router.push(`/clients/edit/${data?.id}`)}
        />
        <Button size="small" icon="pi pi-folder" onClick={confirmArchiveClient} />
      </Row>
    );
  }

  async function _archiveClient(data) {
    const date = new Date();
    const isArchived = !!data.archived_at;

    try {
      await archiveClient({
        variables: { id: data.id, archived_at: isArchived ? null : date }
      });

      toastRef?.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Client is ${isArchived ? 'unarchived' : 'archived'}!`,
        life: 3000
      });
    } catch (e) {
      toastRef?.current?.show({
        life: 3000,
        severity: 'error',
        summary: `Failed to ${isArchived ? 'unarchive' : 'archive'} client.`,
        detail: `Unable to ${isArchived ? 'unarchive' : 'archive'} the client at this time.`
      });
      console.error(e);
    }
  }
}
