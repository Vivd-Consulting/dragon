import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';

import { Toast } from 'primereact/toast';

import { Form, FormFooterButtons } from 'components/Form';
import { useAuth } from 'hooks/useAuth';

import projectsQuery from '../queries/projects.gql';
import contractorsQuery from '../queries/contractors.gql';

import createTaskMutation from './queries/createTask.gql';
import updateTaskMutation from './queries/updateTask.gql';

const PRIORITY = [
  { label: 'Low', value: '0' },
  { label: 'Medium', value: '1' },
  { label: 'High', value: '2' },
  { label: 'Urgent', value: '3' }
];

// TODO: Add Task Type
interface TaskFormPageProps {
  initialData?: any;
  isInitialDataLoading?: boolean;
}

export default function TaskForm({ initialData, isInitialDataLoading }: TaskFormPageProps) {
  const { dragonUser } = useAuth();
  const { data: projectsData, loading: isProjectLoading } = useQuery(projectsQuery, {
    fetchPolicy: 'no-cache',
    variables: {
      where: {
        archived_at: { _is_null: true }
      }
    }
  });

  const { data: contractorsData, loading: isContractorsLoading } = useQuery(contractorsQuery, {
    fetchPolicy: 'no-cache',
    variables: {
      where: {
        archived_at: { _is_null: true }
      }
    }
  });

  const [createTask] = useMutation(createTaskMutation, {
    refetchQueries: ['tasks']
  });

  const [updateTask] = useMutation(updateTaskMutation, {
    refetchQueries: ['tasks', 'task']
  });

  const [loading, setLoading] = useState(false);
  const toast = useRef<any>(null);
  const router = useRouter();

  if (isInitialDataLoading || isProjectLoading || isContractorsLoading) {
    return null;
  }

  const defaultValues = initialData
    ? initialData.task[0]
    : {
        title: '',
        project_id: undefined,
        asignee_id: undefined,
        description: '',
        priority: undefined,
        due_date: ''
        // ...
      };

  return (
    <>
      <Toast ref={toast} />

      <Form defaultValues={defaultValues} onSubmit={onSubmit} resetOnSubmit data-cy="request-form">
        {({ InputText, InputDropdown, InputTextArea, InputCalendar }) => (
          <>
            <InputText label="Title" name="title" isRequired autoFocus />
            <InputDropdown
              placeholder="Select project"
              label="Project"
              name="project_id"
              optionLabel="name"
              optionValue="id"
              options={projectsData?.project}
              isRequired
            />
            <InputDropdown
              placeholder="Select contractor"
              label="Contractor"
              name="asignee_id"
              optionLabel="name"
              optionValue="id"
              options={contractorsData?.contractor}
              isRequired
            />

            <InputDropdown
              placeholder="Priority"
              label="Priority"
              name="priority"
              options={PRIORITY}
              isRequired
            />
            <InputTextArea label="Description" name="description" />
            <InputCalendar label="Due Date" name="due_date" showIcon />

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
        await updateTask({
          variables: {
            ...data,
            userId: dragonUser?.id
          }
        });
      } else {
        await createTask({
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
        detail: 'Task Created!',
        life: 3000
      });

      router.push('/tasks');
    } catch {
      setLoading(false);

      // Show error toast
      toast?.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create task!',
        life: 3000
      });
    }

    setLoading(false);
  }
}
