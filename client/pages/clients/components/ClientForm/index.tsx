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
  const { dragonUser } = useAuth();
  const [createClient] = useMutation(createClientMutation, {
    refetchQueries: ['accountRequests']
  });

  const [updateClient] = useMutation(updateClientMutation, {
    refetchQueries: ['accountRequests', 'client']
  });

  const [loading, setLoading] = useState(false);
  const toast = useRef<any>(null);
  const router = useRouter();

  if (isInitialDataLoading) {
    return null;
  }

  const defaultValues = initialData
    ? initialData.client[0]
    : {
        logo_id: '',
        name: '',
        description: '',
        gpt_persona: '',
        document: '',
        start_date: '',
        end_data: ''
      };

  return (
    <>
      <Toast ref={toast} />

      <Form defaultValues={defaultValues} onSubmit={onSubmit} resetOnSubmit data-cy="request-form">
        {({ UploadImageInput, InputText, InputTextArea, InputCalendar }) => (
          <>
            <UploadImageInput label="Brand Logo" name="logo_id" />
            <InputText label="Name" name="name" isRequired autoFocus />
            <InputTextArea label="Description" name="description" />
            <InputTextArea label="GPT Persona" name="gpt_persona" />
            <InputText label="Document" name="document" />
            <InputCalendar label="Start Date" name="start_date" isRequired showIcon />
            <InputCalendar label="End Date" name="end_date" showIcon />

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
        detail: 'Account Request Submitted!',
        life: 3000
      });

      router.push('/clients');
    } catch {
      setLoading(false);

      // Show error toast
      toast?.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to submit Account Request',
        life: 3000
      });
    }

    setLoading(false);
  }
}
