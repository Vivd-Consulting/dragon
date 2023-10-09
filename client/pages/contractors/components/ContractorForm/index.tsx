import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';

import { Toast } from 'primereact/toast';

import { Form, FormFooterButtons } from 'components/Form';

import { useAuth } from 'hooks/useAuth';

import createContractorMutation from './queries/createContractor.gql';
import updateContractorMutation from './queries/updateContractor.gql';

// TODO: Add Contractor Type
interface ContractorFormPageProps {
  initialData?: any;
  isInitialDataLoading?: boolean;
}

export default function ContractorForm({
  initialData,
  isInitialDataLoading
}: ContractorFormPageProps) {
  const isEditing = !!initialData;

  const { dragonUser } = useAuth();

  const [createContractor] = useMutation(createContractorMutation, {
    refetchQueries: ['contractors']
  });

  const [updateContractor] = useMutation(updateContractorMutation, {
    refetchQueries: ['contractors', 'contractor']
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
        contractor_id: undefined,
        rate_id: undefined,
        start_date: '',
        end_data: ''
      };

  return (
    <>
      <Toast ref={toast} />

      <Form defaultValues={defaultValues} onSubmit={onSubmit} data-cy="contractor-form">
        {({ InputText, InputTextArea, InputCalendar, InputNumber, UploadFileInput }) => (
          <>
            <InputText label="Name" name="name" isRequired autoFocus />
            <InputText label="Location" name="location" isRequired />
            <InputNumber label="Rate" name="contractor_rate.rate" isRequired />
            <InputNumber label="Markup" name="markup" isRequired />
            <InputTextArea label="GPT Persona" name="gpt_persona" />
            <InputCalendar label="Start Date" name="start_date" isRequired showIcon />
            <InputCalendar label="End Date" name="end_date" showIcon />
            <UploadFileInput label="Contract" name="contract_id" isRequired />

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
            rate: data.contractor_rate.rate,
            rate_id: data.contractor_rate.id,
            userId: dragonUser?.id
          }
        });
      } else {
        await createContractor({
          variables: {
            ...data,
            rate: data.contractor_rate.rate,
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
