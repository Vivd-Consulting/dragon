import { useRef, useState } from 'react';
import { useMutation } from '@apollo/client';

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';

import { Form, FormFooterButtons, InputText, InputDropdown } from 'components/Form';

import createSecretKeyMutation from './queries/createSecret.gql';
import updateSecretKeyMutation from './queries/updateSecret.gql';

interface SecretKeyFormModalPageProps {
  projectId: string;
  projectName: string;
  toUpdateSecretKey?: boolean;
  initialData?: any;
}

export default function SecretKeyFormModal({
  projectId,
  projectName,
  initialData,
  toUpdateSecretKey = false
}: SecretKeyFormModalPageProps) {
  const [visible, setVisible] = useState(false);

  const [createSecretKey] = useMutation(createSecretKeyMutation, {
    refetchQueries: ['secrets']
  });

  const [updateSecretKey] = useMutation(updateSecretKeyMutation, {
    refetchQueries: ['secrets', 'getSecret']
  });

  const toast = useRef<any>(null);

  const defaultValues = initialData
    ? initialData
    : {
        path: '',
        value: ''
      };

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast} />

      {toUpdateSecretKey ? (
        <Button
          size="small"
          icon="pi pi-pencil"
          tooltip="Edit"
          tooltipOptions={{ position: 'top' }}
          onClick={() => setVisible(true)}
        />
      ) : (
        <Button label="Add Keys" icon="pi pi-plus" onClick={() => setVisible(true)} />
      )}
      <Dialog
        header={toUpdateSecretKey ? 'Update Secret Key' : 'Create Secret Key'}
        visible={visible}
        style={{ width: '70vw' }}
        onHide={() => setVisible(false)}
      >
        <Form defaultValues={defaultValues} onSubmit={onSubmit} data-cy="secret-key-form">
          <InputText label="Key" name="key" isRequired autoFocus />
          <InputText label="Value" name="value" isRequired />
          <InputDropdown label="Env" name="env" options={['dev', 'staging', 'prod']} isRequired />

          <FormFooterButtons hideCancel onSubmit={onSubmit} />
        </Form>
      </Dialog>
    </div>
  );

  async function onSubmit(data) {
    return new Promise(async resolve => {
      try {
        if (initialData) {
          const formatedSecretKey = formatSecretKey({
            projectName,
            projectId,
            env: data.env,
            key: data.key
          });

          await updateSecretKey({
            variables: {
              projectId: Number(projectId),
              path: formatedSecretKey,
              env: data.env,
              value: data.value
            }
          });

          toast?.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Key is updated!',
            life: 3000
          });
        } else {
          const formatedSecretKey = formatSecretKey({
            projectName,
            projectId,
            env: data.env,
            key: data.key
          });

          await createSecretKey({
            variables: {
              projectId: Number(projectId),
              path: formatedSecretKey,
              env: data.env,
              value: data.value
            }
          });

          toast?.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Key is created!',
            life: 3000
          });
        }
      } catch {
        // Show error toast
        toast?.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${initialData ? 'update' : 'create'} key`,
          life: 3000
        });
      } finally {
        setVisible(false);

        resolve(true);
      }
    });
  }

  function formatSecretKey({
    projectName,
    projectId,
    env,
    key
  }: {
    projectName: string;
    projectId: string;
    env: string;
    key: string;
  }) {
    const validProjectName = projectName.replace(/\s+/g, '-');
    const validKey = key.replace(/\s+/g, '-');

    return `/${validProjectName}-${projectId}/${env}/${validKey}`;
  }
}
