import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';

import { Toast } from 'primereact/toast';

import { Form, FormFooterButtons } from 'components/Form';

import createTaskMutation from './queries/createTask.gql';
import updateTaskMutation from './queries/updateTask.gql';

export default function TaskForm({ initialData, isInitialDataLoading }) {
  const [createTask] = useMutation(createTaskMutation, {
    refetchQueries: ['tasks']
  });

  const [updateTask] = useMutation(updateTaskMutation, {
    refetchQueries: ['tasks', 'task']
  });

  const [loading, setLoading] = useState(false);
  const toast = useRef<any>(null);
  const router = useRouter();

  if (isInitialDataLoading) {
    return null;
  }

  const defaultValues = initialData
    ? initialData.task[0]
    : {
        name: ''
        // ...
      };

  return (
    <>
      <Toast ref={toast} />

      <Form defaultValues={defaultValues} onSubmit={onSubmit} resetOnSubmit data-cy="request-form">
        {({ InputText }) => (
          <>
            <InputText label="Name" name="name" isRequired autoFocus />

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
            ...data
            // ...
          }
        });
      } else {
        await createTask({
          variables: {
            ...data
            // ...
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
