import _ from 'lodash';
import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

import { Row } from 'components/Group';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';
import useClipboard from 'hooks/useClipboard';

import SecretKeyFormModal from '../SecretKeyFormModal';

import secretsQuery from './queries/secrets.gql';
import getSecretQuery from './queries/getSecret.gql';
import customDeleteSecretMutation from './queries/deleteSecret.gql';
import nativeDeleteSecretMutation from './queries/delete_secret.gql';

export default function SecretKeysList({ projectId }) {
  const [selectedEnv, setSelectedEnv] = useState(null);

  const [customDeleteSecret] = useMutation(customDeleteSecretMutation, {
    refetchQueries: ['secrets']
  });
  const [nativeDeleteSecret] = useMutation(nativeDeleteSecretMutation, {
    refetchQueries: ['secrets']
  });

  const where: any = {
    project_id: { _eq: projectId }
  };

  if (selectedEnv) {
    where.env = { _eq: selectedEnv };
  }

  const {
    query: { loading, previousData, data },
    paginationValues,
    onPage
  } = usePaginatedQuery(secretsQuery, {
    fetchPolicy: 'no-cache',
    variables: { where }
  });

  const toastRef = useRef<Toast>(null);

  const secrets = loading ? previousData?.secret : data?.secret;
  const totalRecords = loading
    ? previousData?.secret_aggregate.aggregate.count
    : data?.secret_aggregate.aggregate.count;

  return (
    <>
      <Toast ref={toastRef} />

      <Row align="center" px={2} pb={4}>
        <Dropdown
          showClear
          value={selectedEnv}
          onChange={e => setSelectedEnv(e.value)}
          placeholder="Select env"
          options={[
            { label: 'Dev', value: 'dev' },
            { label: 'Staging', value: 'staging' },
            { label: 'Production', value: 'production' }
          ]}
        />
        {/* <InputTextDebounced
          placeholder="Search by"
          value={searchText}
          onChange={e => setSearchText(e)}
        /> */}
      </Row>

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
          body={({ path }) => {
            const key = _.last(_.split(path, '/'));

            return <span>{key}</span>;
          }}
          header="Key"
          headerClassName="white-space-nowrap"
          className="white-space-nowrap"
        />

        <Column header="Value" body={useActionButtons} />
      </DataTable>
    </>
  );

  function useActionButtons(data) {
    const [value, setValue] = useState('*****');
    const [isDeletingKey, setIsDeletingKey] = useState(false);
    const [isKeyRevealed, setIsKeyRevealed] = useState(false);
    const [shouldGetSecret, setShouldGetSecret] = useState(false);

    const { hasCopied, copyToClipboard } = useClipboard();

    const projectName = _.get(data, 'projects.name');

    const { data: secret, loading } = useQuery(getSecretQuery, {
      variables: {
        path: data?.path
      },
      skip: !shouldGetSecret
    });

    useEffect(() => {
      if (!loading && secret) {
        if (isKeyRevealed) {
          setValue(secret?.getSecret);
        } else {
          copyToClipboard(secret?.getSecret);
          setShouldGetSecret(false);
        }
      }
    }, [secret, loading, isKeyRevealed, copyToClipboard]);

    const confirmDeleteKey = () => {
      confirmDialog({
        message: `Are you sure you want to delete ${data?.path}'s key?`,
        header: 'Delete Key',
        icon: 'pi pi-exclamation-triangle',
        accept: () => _deleteKey(data)
      });
    };

    const pseudoInitialData = { path: _.last(_.split(data.path, '/')) };

    return (
      <Row>
        <InputText value={value} />

        {isKeyRevealed ? (
          <Button
            loading={isKeyRevealed && loading}
            loadingIcon="pi pi-spin pi-spinner"
            size="small"
            icon="pi pi-eye-slash"
            tooltip="Hide"
            tooltipOptions={{ position: 'top' }}
            onClick={() => {
              setShouldGetSecret(false);
              setIsKeyRevealed(false);
              setValue('*****');
            }}
          />
        ) : (
          <Button
            size="small"
            icon="pi pi-eye"
            tooltip="View"
            tooltipOptions={{ position: 'top' }}
            onClick={() => {
              setShouldGetSecret(true);
              setIsKeyRevealed(true);
            }}
          />
        )}
        <Button
          size="small"
          loading={!isKeyRevealed && loading}
          loadingIcon="pi pi-spin pi-spinner"
          icon={`pi ${hasCopied ? 'pi-check' : 'pi-clone'}`}
          tooltip={hasCopied ? 'Copied' : 'Copy'}
          tooltipOptions={{ position: 'top' }}
          onClick={() => {
            if (isKeyRevealed) {
              copyToClipboard(value);
              return;
            }

            setShouldGetSecret(true);
          }}
        />
        <SecretKeyFormModal
          projectId={projectId}
          projectName={projectName}
          initialData={pseudoInitialData}
          toUpdateSecretKey
        />
        <Button
          severity="danger"
          loading={isDeletingKey}
          loadingIcon="pi pi-spin pi-spinner"
          size="small"
          icon="pi pi-trash"
          tooltip="Delete"
          tooltipOptions={{ position: 'top' }}
          onClick={confirmDeleteKey}
        />
      </Row>
    );

    async function _deleteKey(data) {
      setIsDeletingKey(true);

      try {
        await customDeleteSecret({
          variables: {
            path: data.path
          }
        });

        await nativeDeleteSecret({
          variables: {
            path: data.path
          }
        });

        toastRef?.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Key is deleted.',
          life: 3000
        });
      } catch (e) {
        toastRef?.current?.show({
          life: 3000,
          severity: 'error',
          summary: 'Failed to delete key.',
          detail: 'Unable to delete the key at this time.'
        });
        console.error(e);
      } finally {
        setIsDeletingKey(false);
      }
    }
  }
}
