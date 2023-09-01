import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { Toast } from 'primereact/toast';

import { Form, FormFooterButtons } from 'components/Form';

import { useAuth } from 'hooks/useAuth';

import createClientMutation from './queries/createClient.gql';

// TODO: Add client Type
interface ClientFormPageProps {
  initialData?: any;
  isInitialDataLoading?: boolean;
}

export default function ClientForm({ initialData, isInitialDataLoading }: ClientFormPageProps) {
  const { dragonUser } = useAuth();
  const [createRequest] = useMutation(createClientMutation, {
    refetchQueries: ['accountRequests']
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
        {({ InputText, InputTextArea, InputCalendar }) => (
          <>
            <InputText label="Name" name="name" isRequired autoFocus />
            <InputTextArea label="Description" name="description" isRequired />
            <InputTextArea label="GPT Persona" name="gpt_persona" isRequired />
            <InputText label="Document" name="document" isRequired />
            <InputCalendar label="Start Date" name="start_date" isRequired />
            <InputCalendar label="End Date" name="end_date" isRequired />

            <FormFooterButtons hideCancel loading={loading} onSubmit={onSubmit} />
          </>
        )}
      </Form>
    </>
  );

  async function onSubmit(data) {
    setLoading(true);

    try {
      await createRequest({
        variables: {
          ...data,
          userId: dragonUser?.id
        }
      });

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
