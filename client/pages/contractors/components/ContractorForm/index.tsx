import _ from 'lodash';
import { useRef } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import countryList from 'country-list';

import { Toast } from 'primereact/toast';

import {
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

import { PAYMENT_METHODS } from 'consts';

import createContractorMutation from './queries/createContractor.gql';
import updateContractorMutation from './queries/updateContractor.gql';
import createPaymentInfoMutation from './queries/createPaymentInfo.gql';

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

  const [createPaymentInfo] = useMutation(createPaymentInfoMutation, {
    refetchQueries: ['contractors', 'projects']
  });

  const [updateContractor] = useMutation(updateContractorMutation, {
    refetchQueries: ['contractors', 'contractor', 'projects']
  });

  const toast = useRef<any>(null);
  const router = useRouter();

  return (
    <>
      <Toast ref={toast} />

      <HookForm formHook={formHook} onSubmit={onSubmit} data-cy="contractor-form">
        <InputText label="First Name" name="first_name" onBlur={onNameBlur} isRequired autoFocus />
        <InputText label="Last Name" name="last_name" onBlur={onNameBlur} isRequired />

        <InputDropdown
          filter
          placeholder="Country"
          label="Country"
          name="country"
          options={countries}
          isRequired
        />

        <InputText label="City" name="city" isRequired />
        <InputText label="Address" name="address" isRequired />
        <InputText label="Post Code" name="post_code" isRequired />
        <InputText label="Personal Email" name="personal_email" isRequired />
        <InputText label="Work Email" name="work_email" isRequired />

        <InputNumber label="Rate" name="contractor_rate.rate" isRequired />
        <InputNumber label="Markup" name="markup" isRequired />

        <PaymentTemplate formHook={formHook} />

        <InputTextArea label="GPT Persona" name="gpt_persona" />
        <InputCalendar label="Start Date" name="start_date" isRequired showIcon />
        <InputCalendar label="End Date" name="end_date" showIcon />
        <UploadFileInput label="Contract" name="contract_id" />

        <FormFooterButtons hideCancel onSubmit={onSubmit} />
      </HookForm>
    </>
  );

  function PaymentTemplate({ formHook }) {
    const selectedPayment = formHook.watch('method');

    return (
      <>
        <InputDropdown
          formHook={formHook}
          filter
          placeholder="Payment method"
          label="Payment Method"
          name="method"
          options={PAYMENT_METHODS}
          isRequired
        />
        <PaymentInfoTemplate formHook={formHook} selectedPayment={selectedPayment} />
      </>
    );
  }

  function PaymentInfoTemplate({ selectedPayment, formHook }) {
    switch (selectedPayment) {
      case 'swift':
        return (
          <>
            <InputText formHook={formHook} label="SWIFT / BIC" name="swift" isRequired />
            <InputText formHook={formHook} label="IBAN / Account Number" name="swift_iban" />
          </>
        );

      case 'ach':
        return (
          <>
            <InputText
              formHook={formHook}
              label="ACH Routing Number"
              name="ach_routing"
              isRequired
            />
            <InputText formHook={formHook} label="Account Number" name="ach_account" />
          </>
        );

      case 'usdt':
        return <InputText formHook={formHook} label="Wallet Address" name="usdt_wallet" />;

      default:
        return null;
    }
  }

  function onNameBlur() {
    const firstName = formHook.getValues('first_name');
    const lastName = formHook.getValues('last_name');

    if (formHook.getValues('work_email') || !firstName || !lastName) {
      return;
    }

    formHook.setValue(
      'work_email',
      `${firstName[0].toLowerCase()}${lastName.toLowerCase()}@vivd.ca`
    );
  }

  async function onSubmit(data) {
    const { method, swift, swift_iban, ach_routing, ach_account, usdt_wallet } = data;

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
          const newContractor = await createContractor({
            variables: {
              ...data,
              rate: data.contractor_rate.rate,
              userId: dragonUser?.id
            }
          });

          const contractorId = _.get(newContractor, 'data.insert_contractor_one.id');

          await createPaymentInfo({
            variables: {
              contractorId,
              method,
              swift,
              swift_iban,
              ach_routing,
              ach_account,
              usdt_wallet
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
