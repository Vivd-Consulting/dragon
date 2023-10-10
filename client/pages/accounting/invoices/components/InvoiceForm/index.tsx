import _ from 'lodash';
import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';

import { Toast } from 'primereact/toast';

import { Form, FormFooterButtons, InputCalendar, InputDropdown } from 'components/Form';

import { useClientsQuery } from 'hooks/useClientsQuery';
import { useContractorInvoices, useCurrentContractor } from 'hooks/useContractors';

import { getNextWeek } from 'utils';

import InvoiceItemTable from './components/InvoiceItemTable';
import ProjectTimersTable from './components/ProjectTimersTable';

import createInvoiceMutation from './queries/createInvoice.gql';
import createInvoiceItemMutation from './queries/createInvoiceItem.gql';
import updateInvoiceMutation from './queries/updateInvoice.gql';
import updateProjectTimesMutation from './queries/updateProjectTimes.gql';

// TODO: Add invoice Type
interface InvoiceFormPageProps {
  initialData?: any;
  isInitialDataLoading?: boolean;
}

interface IItem {
  description: string;
  tax: number;
  price: number;
  currency: string;
}

export default function InvoiceForm({ initialData, isInitialDataLoading }: InvoiceFormPageProps) {
  const isEditing = !!initialData;

  const [items, setItems] = useState<IItem[]>(initialData.invoice_items || []);
  const [projectTimeIds, setProjectTimeIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(initialData?.client_id);

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

  const [createInvoice] = useMutation(createInvoiceMutation, {
    refetchQueries: ['invoices']
  });

  const [createInvoiceItem] = useMutation(createInvoiceItemMutation, {
    refetchQueries: ['invoices']
  });

  const [updateProjectTimes] = useMutation(updateProjectTimesMutation, {
    refetchQueries: ['invoices']
  });

  const [updateInvoice] = useMutation(updateInvoiceMutation, {
    refetchQueries: ['invoices', 'invoice']
  });

  const toast = useRef<any>(null);
  const router = useRouter();

  if (isInitialDataLoading || isClientsLoading) {
    return null;
  }

  const nextWeek = getNextWeek();

  const defaultValues = initialData
    ? initialData
    : {
        due_date: nextWeek
      };

  return (
    <>
      <Toast ref={toast} />

      <Form defaultValues={defaultValues} onSubmit={onSubmit} resetOnSubmit data-cy="invoice-form">
        <InputDropdown
          placeholder="Select client"
          label="Client"
          name="client_id"
          optionLabel="name"
          optionValue="id"
          onChange={e => setSelectedClient(e.value)}
          options={allowedClientsForInvoice}
          isRequired
          disabled={initialData}
        />

        <InputCalendar label="Due Date" name="due_date" isRequired showIcon />
        <ProjectTimersTable
          selectedClient={selectedClient}
          invoiceId={initialData?.id}
          onSelectProjectTimeIds={setProjectTimeIds}
        />

        <InvoiceItemTable items={items} onAddItems={setItems} />

        <FormFooterButtons hideCancel loading={loading} onSubmit={onSubmit} />
      </Form>
    </>
  );

  async function onSubmit(data) {
    setLoading(true);

    try {
      if (initialData) {
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

        const itemsWithInvoiceId = items.map(item => ({
          ...item,
          key: undefined,
          invoice_id: invoiceId
        }));

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
      setLoading(false);

      // Show error toast
      toast?.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create invoice.',
        life: 3000
      });
    }

    setLoading(false);
  }
}
