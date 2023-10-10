import _ from 'lodash';
import { useForm } from 'react-hook-form';
import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';

import { Toast } from 'primereact/toast';

import { HookForm, FormFooterButtons, InputCalendar, InputDropdown } from 'components/Form';

import { useClientsQuery } from 'hooks/useClientsQuery';
import { useContractorInvoices, useCurrentContractor } from 'hooks/useContractors';

import { getNextWeek, whatsChanged } from 'utils';

import InvoiceItemTable from './components/InvoiceItemTable';
import ProjectTimersTable from './components/ProjectTimersTable';

import createInvoiceMutation from './queries/createInvoice.gql';
import createInvoiceItemsMutation from './queries/createInvoiceItems.gql';
import deleteInvoiceItemsMutation from './queries/deleteInvoiceItems.gql';
import updateInvoiceMutation from './queries/updateInvoice.gql';
import addProjectTimesMutation from './queries/addProjectTimes.gql';
import removeProjectTimesMutation from './queries/removeProjectTimes.gql';

interface InvoiceFormPageProps {
  defaultValues?: any;
}

export default function InvoiceForm({ defaultValues }: InvoiceFormPageProps) {
  const isEditing = !!defaultValues;

  const _defaultValues = defaultValues
    ? defaultValues
    : {
        due_date: getNextWeek()
      };

  const formHook = useForm({ defaultValues: _defaultValues });

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
  const [createInvoiceItems] = useMutation(createInvoiceItemsMutation);
  const [deleteInvoiceItems] = useMutation(deleteInvoiceItemsMutation);
  const [addProjectTimes] = useMutation(addProjectTimesMutation);
  const [removeProjectTimes] = useMutation(removeProjectTimesMutation);
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
        <ProjectTimersTable formHook={formHook} selectedClient={selectedClient} />

        <InvoiceItemTable formHook={formHook} />

        <FormFooterButtons hideCancel onSubmit={onSubmit} />
      </HookForm>
    </>
  );

  async function onSubmit(data) {
    return new Promise(async resolve => {
      try {
        if (isEditing) {
          const [addedTimes, removedTimes] = whatsChanged(
            defaultValues.project_times,
            data.project_times,
            d => d.map(d => d.id)
          );

          if (addedTimes.length > 0) {
            // Update the added times
            await addProjectTimes({
              variables: {
                invoiceId: data.id,
                projectTimeIds: addedTimes
              }
            });
          }

          if (removedTimes.length > 0) {
            // Update the removed times
            await removeProjectTimes({
              variables: {
                projectTimeIds: removedTimes
              }
            });
          }

          // Update the invoice items
          const [addedItems, removedItems] = whatsChanged(
            defaultValues.invoice_items,
            data.invoice_items,
            d => d.map(d => d.key)
          );

          if (addedItems.length > 0) {
            const newItems = data.invoice_items.filter(item => addedItems.includes(item.key));

            await createInvoiceItems({
              variables: {
                objects: newItems.map(({ description, currency, tax, price }) => ({
                  description,
                  currency,
                  tax,
                  price,
                  invoice_id: data.id
                }))
              }
            });
          }

          if (removedItems.length > 0) {
            await deleteInvoiceItems({
              variables: {
                items: removedItems,
                deletedAt: new Date()
              }
            });
          }

          await updateInvoice({
            variables: {
              id: data.id,
              due_date: data.due_date
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

          await addProjectTimes({
            variables: {
              invoiceId,
              projectTimeIds: data.project_time_ids
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

          await createInvoiceItems({
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
