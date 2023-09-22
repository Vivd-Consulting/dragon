import { useRef, useState } from 'react';
import { useMutation } from '@apollo/client';

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';

import { Form, FormFooterButtons } from 'components/Form';

import createSecretKeyMutation from './queries/createSecret.gql';
import updateSecretKeyMutation from './queries/updateSecret.gql';

interface SecretKeyFormModalPageProps {
  projectId: string | string[];
  toUpdateSecretKey?: boolean;
  initialData?: any;
}

export default function SecretKeyFormModal({
  projectId,
  initialData,
  toUpdateSecretKey = false
}: SecretKeyFormModalPageProps) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

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
        header={toUpdateSecretKey ? 'Update Key' : 'Create Key'}
        visible={visible}
        style={{ width: '70vw' }}
        onHide={() => setVisible(false)}
      >
        <Form
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          resetOnSubmit
          data-cy="request-form"
        >
          {({ InputText }) => (
            <>
              <InputText label="Path" name="path" isRequired autoFocus />
              <InputText label="Value" name="value" isRequired />

              <FormFooterButtons hideCancel loading={loading} onSubmit={onSubmit} />
            </>
          )}
        </Form>
      </Dialog>
    </div>
  );
  async function onSubmit(data) {
    setLoading(true);

    try {
      if (initialData) {
        await updateSecretKey({
          variables: {
            ...data,
            projectId: +projectId
          }
        });

        toast?.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Key is updated!',
          life: 3000
        });
      } else {
        await createSecretKey({
          variables: {
            ...data,
            projectId: +projectId
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
      setLoading(false);

      // Show error toast
      toast?.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: `Failed to ${initialData ? 'update' : 'create'} key`,
        life: 3000
      });
    } finally {
      setVisible(false);
      setLoading(false);
    }
  }
}
