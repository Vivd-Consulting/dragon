import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';

import { Toast } from 'primereact/toast';

import { Form, FormFooterButtons } from 'components/Form';

import { useAuth } from 'hooks/useAuth';

import createClientMutation from './queries/createClient.gql';
import updateClientMutation from './queries/updateClient.gql';

// TODO: Add client Type
interface ClientFormPageProps {
  initialData?: any;
  isInitialDataLoading?: boolean;
}

export default function ClientForm({ initialData, isInitialDataLoading }: ClientFormPageProps) {
  const isEditing = !!initialData;

  const { dragonUser } = useAuth();

  const [createClient] = useMutation(createClientMutation, {
    refetchQueries: ['clients', 'client']
  });

  const [updateClient] = useMutation(updateClientMutation, {
    refetchQueries: ['clients', 'client']
  });

  const [loading, setLoading] = useState(false);
  const toast = useRef<any>(null);
  const router = useRouter();

  if (isInitialDataLoading) {
    return null;
  }

  const defaultValues = initialData ? initialData.client[0] : {};

  return (
    <>
      <Toast ref={toast} />

      <Form defaultValues={defaultValues} onSubmit={onSubmit} data-cy="client-form">
        {({ UploadImageInput, InputText, InputTextArea, InputCalendar, UploadFileInput }) => (
          <>
            <InputText label="Name" name="name" isRequired={!isEditing} autoFocus />
            <UploadImageInput label="Brand Logo" name="logo_id" isRequired={!isEditing} />
            <InputTextArea label="Description" name="description" />
            <InputTextArea label="GPT Persona" name="gpt_persona" />
            <InputCalendar label="Start Date" name="start_date" isRequired={!isEditing} showIcon />
            <InputCalendar label="End Date" name="end_date" showIcon />
            <UploadFileInput label="Contract" name="contract_id" isRequired={!isEditing} />

            <FormFooterButtons hideCancel loading={loading} onSubmit={onSubmit} />
          </>
        )}
      </Form>
    </>
  );

  async function onSubmit(data) {
    setLoading(true);

    try {
      if (initialData) {
        await updateClient({
          variables: {
            ...data,
            userId: dragonUser?.id
          }
        });
      } else {
        await createClient({
          variables: {
            ...data,
            userId: dragonUser?.id
          }
        });
      }

      // Show success toast
      toast?.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Client created!',
        life: 3000
      });

      router.push('/clients');
    } catch {
      setLoading(false);

      // Show error toast
      toast?.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create Client',
        life: 3000
      });
    }

    setLoading(false);
  }
}
