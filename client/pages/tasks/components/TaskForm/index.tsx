import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';

import { Toast } from 'primereact/toast';

import {
  Form,
  FormFooterButtons,
  InputText,
  InputDropdown,
  InputTextArea,
  InputCalendar
} from 'components/Form';

import { useAuth } from 'hooks/useAuth';
import { useTaskPriorities } from 'hooks/useTaskPriorities';

import { TASK_STATUS } from 'consts';

import projectsQuery from '../queries/projects.gql';

import createTaskMutation from './queries/createTask.gql';
import updateTaskMutation from './queries/updateTask.gql';

interface TaskFormPageProps {
  defaultValues?: any;
}

export default function TaskForm({ defaultValues }: TaskFormPageProps) {
  const isEditing = !!defaultValues;
  const [selectedProject, setSelectedProject] = useState(null);

  const { dragonUser } = useAuth();
  const TASK_PRIORITY = useTaskPriorities(selectedProject ?? defaultValues?.project_id);

  const { data: projectsData } = useQuery(projectsQuery, {
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

  const toast = useRef<any>(null);
  const router = useRouter();

  return (
    <>
      <Toast ref={toast} />

      <Form defaultValues={defaultValues} onSubmit={onSubmit} data-cy="task-form">
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

        <InputDropdown
          placeholder="Status"
          label="Status"
          name="status"
          options={TASK_STATUS}
          isRequired
        />

        <InputTextArea label="Description" name="description" />

        <InputCalendar label="Due Date" name="due_date" showIcon />

        <FormFooterButtons hideCancel onSubmit={onSubmit} />
      </Form>
    </>
  );

  async function onSubmit(data) {
    return new Promise(async resolve => {
      try {
        if (isEditing) {
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
          detail: `Task ${isEditing ? 'Updated' : 'Created'}!`,
          life: 3000
        });

        router.push('/tasks');
      } catch {
        // Show error toast
        toast?.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${isEditing ? 'update' : 'create'} task!`,
          life: 3000
        });
      }

      resolve(true);
    });
  }
}
