import _ from 'lodash';
import { useForm } from 'react-hook-form';
import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';

import { Toast } from 'primereact/toast';

import { HookForm, FormFooterButtons, InputCalendar, InputDropdown } from 'components/Form';

import { useClientsQuery } from 'hooks/useClientsQuery';
import { useContractorInvoices, useCurrentContractor } from 'hooks/useContractors';

import { getNextWeek } from 'utils';

import InvoiceItemTable from './components/InvoiceItemTable';
import ProjectTimersTable from './components/ProjectTimersTable';

import createInvoiceMutation from './queries/createInvoice.gql';
import createInvoiceItemMutation from './queries/createInvoiceItem.gql';
import updateInvoiceMutation from './queries/updateInvoice.gql';
import updateProjectTimesMutation from './queries/updateProjectTimes.gql';

interface InvoiceFormPageProps {
  defaultValues?: any;
}

interface IItem {
  description: string;
  tax: number;
  price: number;
  currency: string;
}

export default function InvoiceForm({ defaultValues }: InvoiceFormPageProps) {
  const isEditing = !!defaultValues;

  const _defaultValues = defaultValues
    ? defaultValues
    : {
        due_date: getNextWeek()
      };

  const formHook = useForm({ defaultValues: _defaultValues });

  const [projectTimeIds, setProjectTimeIds] = useState([]);
  const [selectedClient, setSelectedClient] = useState(defaultValues?.client_id);

  const [contractorId] = useCurrentContractor();

  const [clients, isClientsLoading] = useClientsQuery();
  const [invoices] = useContractorInvoices(contractorId);

  const allowedClientsForInvoice = isEditing
    ? clients
    : clients.filter(client => {
        return !invoices.some(
          invoice => client.id === invoice.client_id && invoice.submitted_at === null
        );
      });

  const [createInvoice] = useMutation(createInvoiceMutation);
  const [createInvoiceItem] = useMutation(createInvoiceItemMutation);
  const [updateProjectTimes] = useMutation(updateProjectTimesMutation);
  const [updateInvoice] = useMutation(updateInvoiceMutation);

  const toast = useRef<any>(null);
  const router = useRouter();

  if (isClientsLoading) {
    return null;
  }

  return (
    <>
      <Toast ref={toast} />

      <HookForm formHook={formHook} onSubmit={onSubmit} data-cy="invoice-form">
        <InputDropdown
          placeholder="Select client"
          label="Client"
          name="client_id"
          optionLabel="name"
          optionValue="id"
          onChange={e => setSelectedClient(e.value)}
          options={allowedClientsForInvoice}
          isRequired
          disabled={isEditing}
        />

        <InputCalendar label="Due Date" name="due_date" isRequired showIcon />
        <ProjectTimersTable
          selectedClient={selectedClient}
          invoiceId={defaultValues?.id}
          onSelectProjectTimeIds={setProjectTimeIds}
        />

        <InvoiceItemTable formHook={formHook} />

        <FormFooterButtons hideCancel onSubmit={onSubmit} />
      </HookForm>
    </>
  );

  async function onSubmit(data) {
    return new Promise(async resolve => {
      try {
        // console.log({
        //   data
        // })

        // return resolve(true);

        if (isEditing) {
          await updateInvoice({
            variables: {
              ...data
            }
          });
        } else {
          // first create invoice
          const newInvoice = await createInvoice({
            variables: {
              ...data,
              contractorId
            }
          });

          const invoiceId = _.get(newInvoice, 'data.insert_invoice_one.id') as number;

          await updateProjectTimes({
            variables: {
              invoiceId,
              projectTimeIds
            }
          });

          const itemsWithInvoiceId = data.invoice_items.map(
            ({ description, currency, tax, price }) => ({
              description,
              currency,
              tax,
              price,
              invoice_id: invoiceId
            })
          );

          await createInvoiceItem({
            variables: {
              objects: itemsWithInvoiceId
            }
          });
        }

        // Show success toast
        toast?.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Invoice is created.',
          life: 3000
        });

        router.push('/accounting/invoices');
      } catch {
        // Show error toast
        toast?.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create invoice.',
          life: 3000
        });
      }

      resolve(true);
    });
  }
}
