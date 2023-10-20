import { useRef } from 'react';
import { useMutation } from '@apollo/client';

import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';

import { FormFooterButtons, Form, InputTextArea } from 'components/Form';

import updateTimerDecriptionMutation from './queries/updateTimerDescription.gql';

export default function TaskDescriptionModal({ timerId, resetTimerId }) {
  const [updateTimerDescription] = useMutation(updateTimerDecriptionMutation, {
    refetchQueries: ['timers']
  });

  const toast = useRef<any>(null);

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast} />

      <Dialog
        header="Add new time"
        visible={!!timerId}
        style={{ width: '70vw' }}
        onHide={resetTimerId}
      >
        <Form onSubmit={onSubmit} data-cy="time-description-form">
          <InputTextArea label="Description" name="description" />

          <FormFooterButtons onSubmit={onSubmit} />
        </Form>
      </Dialog>
    </div>
  );

  async function onSubmit(data) {
    if (!data.description) {
      return resetTimerId();
    }

    return new Promise(async resolve => {
      try {
        await updateTimerDescription({
          variables: {
            description: data.description,
            timerId
          }
        });

        toast?.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Description is added!',
          life: 3000
        });
      } catch {
        // Show error toast
        toast?.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add description',
          life: 3000
        });
      } finally {
        resetTimerId();
        resolve(true);
      }
    });
  }
}
