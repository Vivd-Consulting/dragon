import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';

import { Row } from 'components/Group';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';
import useClipboard from 'hooks/useClipboard';

import secretsQuery from './queries/secrets.gql';
import getSecretQuery from './queries/getSecret.gql';

export default function SecretKeysList({ projectId }) {
  const {
    query: { loading, previousData, data },
    paginationValues,
    onPage
  } = usePaginatedQuery(secretsQuery, {
    fetchPolicy: 'no-cache',
    variables: {
      projectId
    }
  });

  const toastRef = useRef<Toast>(null);

  const secrets = loading ? previousData?.secret : data?.secret;
  const totalRecords = loading
    ? previousData?.secret_aggregate.aggregate.count
    : data?.secret_aggregate.aggregate.count;

  return (
    <>
      <Toast ref={toastRef} />

      <DataTable
        value={secrets}
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
        emptyMessage="No Keys found."
        data-cy="secret-keys-table"
      >
        <Column
          field="projects.client.name"
          header="Client Name"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />
        <Column
          field="path"
          header="Name"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />

        <Column header="Key" body={useActionButtons} />
      </DataTable>
    </>
  );

  function useActionButtons(data) {
    const [value, setValue] = useState('*****');
    const [shouldGetSecret, setShouldGetSecret] = useState(false);
    const router = useRouter();

    const { hasCopied, copyToClipboard } = useClipboard();

    const { data: secret, loading } = useQuery(getSecretQuery, {
      variables: {
        path: data?.path
      },
      skip: !shouldGetSecret
    });

    useEffect(() => {
      if (!loading && secret) {
        setValue(secret?.getSecret);
      }
    }, [secret, loading]);

    const confirmDeleteKey = () => {
      confirmDialog({
        message: `Are you sure you want to archive ${data.name}?`,
        header: 'Archive Project',
        icon: 'pi pi-exclamation-triangle',
        accept: () => _archiveProject(data)
      });
    };

    return (
      <Row>
        <InputText value={value} />

        {shouldGetSecret ? (
          <Button
            loading={loading}
            loadingIcon="pi pi-spin pi-spinner"
            size="small"
            icon="pi pi-eye-slash"
            tooltip="Hide"
            tooltipOptions={{ position: 'top' }}
            onClick={() => {
              setShouldGetSecret(false);
              setValue('*****');
            }}
          />
        ) : (
          <Button
            size="small"
            icon="pi pi-eye"
            tooltip="View"
            tooltipOptions={{ position: 'top' }}
            onClick={() => setShouldGetSecret(true)}
          />
        )}
        <Button
          disabled={!shouldGetSecret}
          size="small"
          icon={`pi ${hasCopied ? 'pi-check' : 'pi-clone'}`}
          tooltip={hasCopied ? 'Copied' : 'Copy'}
          tooltipOptions={{ position: 'top' }}
          onClick={() => copyToClipboard(value)}
        />
        <Button
          severity="danger"
          size="small"
          icon="pi pi-trash"
          tooltip="Delete"
          tooltipOptions={{ position: 'top' }}
          onClick={confirmDeleteKey}
        />
      </Row>
    );
  }

  async function _archiveProject(data) {
    const date = new Date();

    try {
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
