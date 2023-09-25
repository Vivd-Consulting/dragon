import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';

import { Toast } from 'primereact/toast';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

import { Form, FormFooterButtons } from 'components/Form';

import { useContractors } from 'hooks/useContractors';
import { useClientsQuery } from 'hooks/useClientsQuery';
import { useAuth } from 'hooks/useAuth';

import { getNextWeek } from 'utils';

import projectTimesQuery from './queries/projectTimes.gql';

// TODO: Add invoice Type
interface InvoiceFormPageProps {
  initialData?: any;
  isInitialDataLoading?: boolean;
}

export default function InvoiceForm({ initialData, isInitialDataLoading }: InvoiceFormPageProps) {
  const [expandedRows, setExpandedRows] = useState([]);
  const { dragonUser } = useAuth();
  const [clients, isClientsLoading] = useClientsQuery();
  const [contractors] = useContractors();

  const { data: projectTimesData, loading: isProjectTimesLoading } = useQuery(projectTimesQuery);

  // const [createClient] = useMutation(createClientMutation, {
  //   refetchQueries: ['accountRequests']
  // });

  // const [updateClient] = useMutation(updateClientMutation, {
  //   refetchQueries: ['accountRequests', 'client']
  // });

  const [loading, setLoading] = useState(false);
  const toast = useRef<any>(null);
  const router = useRouter();

  if (isInitialDataLoading || isClientsLoading || isProjectTimesLoading) {
    return null;
  }

  const nextWeek = getNextWeek();

  const defaultValues = initialData
    ? initialData.client[0]
    : {
        name: '',
        client_id: '',
        contractor_id: '',
        due_date: nextWeek
      };

  const headerTemplate = data => {
    return <span className="vertical-align-middle ml-2 font-bold line-height-3">{data.name}</span>;
  };

  const projectTimesRowExpansionTemplate = data => {
    return (
      <div className="p-3">
        <h5>Project Times for {data.name}</h5>
        <DataTable value={data.project_times}>
          <Column
            field="start_time"
            header="Start Time"
            body={rowData => <span>{rowData.start_time}</span>}
            sortable
          />
          <Column
            field="end_time"
            header="End Time"
            body={rowData => <span>{rowData.end_time}</span>}
            sortable
          />
        </DataTable>
      </div>
    );
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
            <InputDropdown
              placeholder="Select client"
              label="Contractor"
              name="contractor_id"
              optionLabel="name"
              optionValue="id"
              options={contractors}
              isRequired
            />

            <DataTable
              value={projectTimesData.project}
              expandedRows={expandedRows}
              // @ts-ignore
              onRowToggle={e => setExpandedRows(e.data)}
              rowExpansionTemplate={projectTimesRowExpansionTemplate}
              dataKey="id"
              tableStyle={{ minWidth: '60rem' }}
            >
              <Column expander style={{ width: '5rem' }} />
              <Column field="name" header="Project Name" sortable />
              {/* Add more columns as needed */}
            </DataTable>

            <InputText label="Name" name="name" isRequired autoFocus />
            <InputCalendar label="Due Date" name="due_date" isRequired showIcon />

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
        // await updateClient({
        //   variables: {
        //     ...data,
        //     userId: dragonUser?.id
        //   }
        // });
      } else {
        // await createClient({
        //   variables: {
        //     ...data,
        //     userId: dragonUser?.id
        //   }
        // });
      }

      // Show success toast
      toast?.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Account Request Submitted!',
        life: 3000
      });

      router.push('/clients');
    } catch {
      setLoading(false);

      // Show error toast
      toast?.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to submit Account Request',
        life: 3000
      });
    }

    setLoading(false);
  }
}
