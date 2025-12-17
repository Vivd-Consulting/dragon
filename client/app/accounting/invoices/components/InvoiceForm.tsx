'use client';

import { useForm } from 'react-hook-form';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Toast } from 'primereact/toast';

import { HookForm, FormFooterButtons, InputCalendar, InputDropdown } from '@/components/Form';
import { getClients } from '@/app/actions/clients';

import { getNextWeek, whatsChanged } from '@/utils';
import {
  createInvoice,
  updateInvoice,
  createInvoiceItems,
  deleteInvoiceItems,
  addProjectTimesToInvoice,
  removeProjectTimesFromInvoice,
} from '@/app/actions/invoices';

import InvoiceItemTable from './InvoiceItemTable';
import ProjectTimersTable from './ProjectTimersTable';

interface InvoiceFormProps {
  defaultValues?: any;
}

export default function InvoiceForm({ defaultValues }: InvoiceFormProps) {
  const isEditing = !!defaultValues;

  const _defaultValues = defaultValues
    ? defaultValues
    : {
        due_date: getNextWeek(),
      };

  const formHook = useForm({ defaultValues: _defaultValues });

  const [selectedClient, setSelectedClient] = useState(defaultValues?.client_id);
  const [clients, setClients] = useState<any[]>([]);
  const [isClientsLoading, setIsClientsLoading] = useState(true);

  const toast = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadClients() {
      try {
        const result = await getClients({
          archived_at: { _is_null: true },
        });

        if ('data' in result) {
          setClients(result.data || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsClientsLoading(false);
      }
    }

    loadClients();
  }, []);

  if (isClientsLoading) {
    return null;
  }

  async function onSubmit(data: any) {
    try {
      if (isEditing && defaultValues) {
        const [addedTimes, removedTimes] = whatsChanged(
          defaultValues.project_times || [],
          data.project_times || [],
          (d: any[]) => d.map((item: any) => item.id)
        );

        if (addedTimes.length > 0) {
          await addProjectTimesToInvoice(data.id, addedTimes as number[]);
        }

        if (removedTimes.length > 0) {
          await removeProjectTimesFromInvoice(removedTimes as number[]);
        }

        const [addedItems, removedItems] = whatsChanged(
          defaultValues.invoice_items || [],
          data.invoice_items || [],
          (d) => d.map((item: any) => item.key)
        );

        if (addedItems.length > 0) {
          const newItems = data.invoice_items.filter((item: any) => addedItems.includes(item.key));
          await createInvoiceItems(
            newItems.map(({ description, currency, tax, price }: any) => ({
              description,
              currency,
              tax,
              price,
              invoice_id: data.id,
            }))
          );
        }

        if (removedItems.length > 0) {
          const itemsToDelete = defaultValues.invoice_items
            .filter((item: any) => removedItems.includes(item.key))
            .map((item: any) => item.id)
            .filter((id: any) => id);
          if (itemsToDelete.length > 0) {
            await deleteInvoiceItems(itemsToDelete);
          }
        }

        await updateInvoice(data.id, {
          due_date: data.due_date,
        });
      } else {
        const newInvoice = await createInvoice({
          client_id: data.client_id,
          contractor_id: data.contractor_id,
          due_date: data.due_date,
        });

        if ('error' in newInvoice) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: newInvoice.error,
            life: 3000,
          });
          return;
        }

        const invoiceId = newInvoice.data?.id;

        if (invoiceId && data.project_times) {
          const projectTimeIds = data.project_times.map(({ id }: any) => id);
          await addProjectTimesToInvoice(invoiceId, projectTimeIds);
        }

        if (invoiceId && data.invoice_items) {
          await createInvoiceItems(
            data.invoice_items.map(({ description, currency, tax, price }: any) => ({
              description,
              currency,
              tax,
              price,
              invoice_id: invoiceId,
            }))
          );
        }
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Invoice is created.',
        life: 3000,
      });

      router.push('/accounting/invoices');
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create invoice.',
        life: 3000,
      });
    }
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
          onChange={(e) => setSelectedClient(e.value)}
          options={clients}
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
}

