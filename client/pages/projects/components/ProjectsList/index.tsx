import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';

import { Row } from 'components/Group';
import { Dropdown } from 'primereact/dropdown';
import { convertDataToDropdownOptions, dateFormat } from 'utils';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';

import clientsQuery from '../queries/clients.gql';

import projectsQuery from './queries/projects.gql';
import archiveProjectMutation from './queries/archiveProject.gql';

export default function ProjectList() {
  const [client, setClient] = useState<{ label: string; value: any } | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState(undefined);

  const { data: clientsData } = useQuery(clientsQuery);

  const {
    query: { loading, previousData, data },
    paginationValues,
    onPage
  } = usePaginatedQuery(projectsQuery, {
    fetchPolicy: 'no-cache',
    variables: {
      where: {
        archived_at: { _is_null: true },
        client_id: {
          _eq: client
        },
        // github_repo_name: { _eq: searchTerm }
        _or: {
          github_repo_name: { _eq: searchTerm || undefined },
          github_repo_org: { _eq: searchTerm || undefined }
        }
      }
    }
  });

  const [archiveProject] = useMutation(archiveProjectMutation, {
    refetchQueries: ['projects', 'project']
  });

  const toastRef = useRef<Toast>(null);

  const projects = loading ? previousData?.project : data?.project;
  const totalRecords = loading
    ? previousData?.project_aggregate.aggregate.count
    : data?.project_aggregate.aggregate.count;

  const clients = convertDataToDropdownOptions(clientsData?.client, 'name', 'id');

  return (
    <>
      <Toast ref={toastRef} />

      <Row align="center" px={2} pb={4}>
        <Dropdown
          filter
          showClear
          value={client}
          onChange={e => setClient(e.value)}
          placeholder="Select client"
          options={clients}
        />
        <InputText
          placeholder="Search by"
          value={searchTerm}
          // onChange={e => setSearchTerm(e.target.value)}
        />
      </Row>

      <DataTable
        value={projects}
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
        emptyMessage="No Projects found."
        data-cy="projects-table"
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
          field="github_repo_org"
          header="Github Repo Organization"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column
          field="github_repo_name"
          header="Github Repo Name"
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
          body={({ archived_at }) => {
            return <i className="pi pi-times-circle" />;
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

    const confirmArchiveProject = () => {
      confirmDialog({
        message: `Are you sure you want to archive ${data.name}?`,
        header: 'Archive Project',
        icon: 'pi pi-exclamation-triangle',
        accept: () => _archiveProject(data)
      });
    };

    return (
      <Row>
        <Button
          size="small"
          icon="pi pi-user-edit"
          tooltip="Edit"
          tooltipOptions={{ position: 'top' }}
          onClick={() => router.push(`/projects/edit/${data?.id}`)}
        />
        <Button
          size="small"
          tooltip="Archive"
          tooltipOptions={{ position: 'top' }}
          severity="danger"
          icon="pi pi-trash"
          onClick={confirmArchiveProject}
        />
      </Row>
    );
  }

  async function _archiveProject(data) {
    const date = new Date();

    try {
      await archiveProject({
        variables: { id: data.id, archived_at: date }
      });

      toastRef?.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Project is archived',
        life: 3000
      });
    } catch (e) {
      toastRef?.current?.show({
        life: 3000,
        severity: 'error',
        summary: 'Failed to archive project.',
        detail: 'Unable to archive the project at this time.'
      });
      console.error(e);
    }
  }
}
