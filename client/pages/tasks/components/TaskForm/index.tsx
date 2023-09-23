import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';

import { Toast } from 'primereact/toast';

import { Form, FormFooterButtons } from 'components/Form';
import { useAuth } from 'hooks/useAuth';
import { useTaskPriorities } from 'hooks/useTaskPriorities';

import projectsQuery from '../queries/projects.gql';

import createTaskMutation from './queries/createTask.gql';
import updateTaskMutation from './queries/updateTask.gql';

// TODO: Add Task Type
interface TaskFormPageProps {
  initialData?: any;
  isInitialDataLoading?: boolean;
}

export default function TaskForm({ initialData, isInitialDataLoading }: TaskFormPageProps) {
  const [selectedProject, setSelectedProject] = useState(null);

  const { dragonUser } = useAuth();
  const TASK_PRIORITY = useTaskPriorities(selectedProject ?? initialData?.project_id);

  const { data: projectsData, loading: isProjectLoading } = useQuery(projectsQuery, {
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
    refetchQueries: ['tasks', 'task_by_pk']
  });

  const [loading, setLoading] = useState(false);
  const toast = useRef<any>(null);
  const router = useRouter();

  if (isInitialDataLoading || isProjectLoading) {
    return null;
  }

  return (
    <>
      <Toast ref={toast} />

      <Form defaultValues={initialData} onSubmit={onSubmit} data-cy="request-form">
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
              onChange={e => setSelectedProject(e.target.value)}
              isRequired
            />

            <InputDropdown
              placeholder="Priority"
              label="Priority"
              name="priority"
              optionLabel="name"
              optionValue="id"
              options={TASK_PRIORITY}
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
