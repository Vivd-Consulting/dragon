import _ from 'lodash';
import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';

import { Toast } from 'primereact/toast';

import { Form, FormFooterButtons } from 'components/Form';

import { useClientsQuery } from 'hooks/useClientsQuery';
import { useAuth } from 'hooks/useAuth';

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

export default function InvoiceForm({ initialData, isInitialDataLoading }: InvoiceFormPageProps) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const { dragonUser } = useAuth();
  const [clients, isClientsLoading] = useClientsQuery();

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
    ? initialData.invoice[0]
    : {
        name: '',
        client_id: '',
        contractor_id: '',
        due_date: nextWeek
      };

  return (
    <>
      <Toast ref={toast} />

      <Form defaultValues={defaultValues} onSubmit={onSubmit} resetOnSubmit data-cy="request-form">
        {({ InputText, InputCalendar, InputDropdown }) => (
          <>
            <InputDropdown
              placeholder="Select client"
              label="Client"
              name="client_id"
              optionLabel="name"
              optionValue="id"
              options={clients}
              isRequired
            />

            <InputCalendar label="Due Date" name="due_date" isRequired showIcon />
            <ProjectTimersTable />

            <InvoiceItemTable items={items} onAddItems={setItems} />

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
        await updateInvoice({
          variables: {
            ...data
          }
        });
      } else {
        // first create invoice
        const newInvoice = await createInvoice({
          variables: {
            ...data
          }
        });

        const invoiceId = _.get(newInvoice, 'data.insert_invoice_one.id');

        // await updateProjectTimes({
        //   variables: {}
        // });

        for (const item of items) {
          await createInvoiceItem({
            variables: {
              //@ts-ignore
              ...item,
              invoiceId
            }
          });
        }
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
