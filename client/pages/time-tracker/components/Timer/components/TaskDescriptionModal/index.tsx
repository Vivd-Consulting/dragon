import { useRef, useState } from 'react';
import { useMutation } from '@apollo/client';

import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';

import { FormFooterButtons, Form } from 'components/Form';

import updateTimerDecriptionMutation from './queries/updateTimerDescription.gql';

export default function TaskDescriptionModal({ timerId, visible, setVisible }) {
  const [loading, setLoading] = useState(false);

  const [updateTimerDescription] = useMutation(updateTimerDecriptionMutation, {
    refetchQueries: ['timers']
  });

  const toast = useRef<any>(null);

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast} />

      <Dialog
        header="Add new time"
        visible={visible}
        style={{ width: '70vw' }}
        onHide={() => setVisible(false)}
      >
        <Form onSubmit={onSubmit} data-cy="time-description-form">
          {({ InputTextArea }) => (
            <>
              <InputTextArea label="Description" name="description" />

              <FormFooterButtons loading={loading} onSubmit={onSubmit} />
            </>
          )}
        </Form>
      </Dialog>
    </div>
  );

  async function onSubmit(data) {
    if (!data?.description) {
      return setVisible(false);
    }

    setLoading(true);

    try {
      await updateTimerDescription({
        variables: {
          ...data,
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
      setLoading(false);
      // Show error toast
      toast?.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to add description',
        life: 3000
      });
    } finally {
      setVisible(false);
      setLoading(false);
    }
  }
}
