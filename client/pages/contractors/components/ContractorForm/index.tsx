import { useRef } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import countryList from 'country-list';

import { Toast } from 'primereact/toast';

import {
  Form,
  FormFooterButtons,
  InputText,
  InputTextArea,
  InputCalendar,
  InputNumber,
  UploadFileInput,
  InputDropdown,
  HookForm
} from 'components/Form';

import { useAuth } from 'hooks/useAuth';

import createContractorMutation from './queries/createContractor.gql';
import updateContractorMutation from './queries/updateContractor.gql';

interface ContractorFormPageProps {
  defaultValues?: any;
}

export default function ContractorForm({ defaultValues }: ContractorFormPageProps) {
  const isEditing = !!defaultValues;

  const { dragonUser } = useAuth();

  const countries = countryList.getNames();

  const formHook = useForm({ defaultValues });

  const [createContractor] = useMutation(createContractorMutation, {
    refetchQueries: ['contractors', 'projects']
  });

  const [updateContractor] = useMutation(updateContractorMutation, {
    refetchQueries: ['contractors', 'contractor', 'projects']
  });

  const toast = useRef<any>(null);
  const router = useRouter();

  const firstName = formHook.watch('first_name') || 'f';
  const lastName = formHook.watch('last_name') || 'last';

  return (
    <>
      <Toast ref={toast} />

      <HookForm formHook={formHook} onSubmit={onSubmit} data-cy="contractor-form">
        <InputText label="First Name" name="first_name" isRequired autoFocus />

        <InputText label="Last Name" name="last_name" isRequired />

        <InputDropdown
          placeholder="Country"
          label="Country"
          name="country"
          options={countries}
          isRequired
        />

        <InputText label="City" name="city" isRequired />

        <InputTextArea label="Address" name="address" isRequired />

        <InputText label="Post Code" name="post_code" isRequired />

        <InputText label="Personal Email" name="personal_email" isRequired />

        <InputText
          label="Work Email"
          name="work_email"
          value={`${firstName[0]?.toLowerCase()}${lastName?.toLowerCase()}@vivd.ca`}
          isRequired
        />

        <InputNumber label="Rate" name="contractor_rate.rate" isRequired />
        <InputNumber label="Markup" name="markup" isRequired />
        <InputTextArea label="GPT Persona" name="gpt_persona" />
        <InputCalendar label="Start Date" name="start_date" isRequired showIcon />
        <InputCalendar label="End Date" name="end_date" showIcon />
        <UploadFileInput label="Contract" name="contract_id" isRequired />

        <FormFooterButtons hideCancel onSubmit={onSubmit} />
      </HookForm>
    </>
  );

  async function onSubmit(data) {
    return new Promise(async resolve => {
      try {
        if (isEditing) {
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
          detail: `Contractor ${isEditing ? 'updated' : 'created'}!`,
          life: 3000
        });

        router.push('/contractors');
      } catch {
        // Show error toast
        toast?.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${isEditing ? 'update' : 'create'} contractor!`,
          life: 3000
        });
      }

      resolve(true);
    });
  }
}
