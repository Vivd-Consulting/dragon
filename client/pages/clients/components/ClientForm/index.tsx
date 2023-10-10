import React from 'react';
import { useForm } from 'react-hook-form';
import { useRef } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';

import { Toast } from 'primereact/toast';

import {
  HookForm,
  FormFooterButtons,
  InputText,
  InputTextArea,
  InputCalendar,
  UploadFileInput,
  UploadImageInput
} from 'components/Form';

import { useAuth } from 'hooks/useAuth';

import createClientMutation from './queries/createClient.gql';
import updateClientMutation from './queries/updateClient.gql';

interface ClientFormPageProps {
  defaultValues?: any;
}

export default function ClientForm({ defaultValues }: ClientFormPageProps) {
  const isEditing = !!defaultValues;

  const formHook = useForm({ defaultValues });

  const { dragonUser } = useAuth();

  const [createClient] = useMutation(createClientMutation, {
    refetchQueries: ['clients']
  });

  const [updateClient] = useMutation(updateClientMutation, {
    refetchQueries: ['clients']
  });

  const toast = useRef<any>(null);
  const router = useRouter();

  return (
    <>
      <Toast ref={toast} />

      <HookForm formHook={formHook} onSubmit={onSubmit} data-cy="client-form">
        <InputText label="Name" name="name" fullWidth isRequired autoFocus />
        <UploadImageInput label="Brand Logo" name="logo_id" isRequired />
        <InputTextArea label="Description" name="description" />
        <InputTextArea label="GPT Persona" name="gpt_persona" />
        <InputCalendar label="Start Date" name="start_date" isRequired showIcon />
        <InputCalendar label="End Date" name="end_date" showIcon />
        <UploadFileInput label="Contract" name="contract_id" isRequired />

        <FormFooterButtons hideCancel onSubmit={onSubmit} />
      </HookForm>
    </>
  );

  async function onSubmit(data) {
    return new Promise(async (resolve, reject) => {
      try {
        if (isEditing) {
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
          detail: `Client ${isEditing ? 'updated' : 'created'}!`,
          life: 3000
        });

        resolve(true);

        router.push('/clients');
      } catch (e) {
        // Show error toast
        toast?.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${isEditing ? 'update' : 'create'} Client`,
          life: 3000
        });

        reject(e);
      }
    });
  }
}
