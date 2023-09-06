import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';

import { Toast } from 'primereact/toast';

import { Form, FormFooterButtons } from 'components/Form';

import { useAuth } from 'hooks/useAuth';

import createContractorMutation from './queries/createContractor.gql';
import updateContractorMutation from './queries/updateContractor.gql';

// TODO: Add client Type
interface ContractorFormPageProps {
  initialData?: any;
  isInitialDataLoading?: boolean;
}

export default function ContractorForm({
  initialData,
  isInitialDataLoading
}: ContractorFormPageProps) {
  const { dragonUser } = useAuth();
  const [createContractor] = useMutation(createContractorMutation, {
    refetchQueries: ['accountRequests', 'contractors']
  });

  const [updateContractor] = useMutation(updateContractorMutation, {
    refetchQueries: ['accountRequests', 'contractor']
  });

  const [loading, setLoading] = useState(false);
  const toast = useRef<any>(null);
  const router = useRouter();

  if (isInitialDataLoading) {
    return null;
  }

  const defaultValues = initialData
    ? initialData.contractor[0]
    : {
        name: '',
        gpt_persona: '',
        location: '',
        rate: undefined,
        invoice: undefined,
        document: '',
        start_date: '',
        end_data: ''
      };

  return (
    <>
      <Toast ref={toast} />

      <Form defaultValues={defaultValues} onSubmit={onSubmit} resetOnSubmit data-cy="request-form">
        {({ InputText, InputTextArea, InputCalendar, InputNumber }) => (
          <>
            <InputText label="Name" name="name" isRequired autoFocus />
            <InputText label="Location" name="location" isRequired />
            <InputText label="Document" name="document" />
            <InputNumber label="Rate" name="rate" isRequired />
            <InputNumber label="Invoice" name="invoice" isRequired />
            <InputTextArea label="GPT Persona" name="gpt_persona" isRequired />
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
      if (initialData) {
        await updateContractor({
          variables: {
            ...data,
            userId: dragonUser?.id
          }
        });
      } else {
        await createContractor({
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
        detail: 'Contractor Created!',
        life: 3000
      });

      router.push('/contractors');
    } catch {
      setLoading(false);

      // Show error toast
      toast?.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create contractor!',
        life: 3000
      });
    }

    setLoading(false);
  }
}
