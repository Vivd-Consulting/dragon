import { useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';

import { useAuth } from 'hooks/useAuth';

import { FormFooterButtons, CustomForm } from 'components/Form';
import { useProjectsQuery } from 'hooks/useProjectsQuery';

import addNewtimeMutation from './queries/addNewTime.gql';

interface ManualTimeModalPageProps {
  initialData?: any;
}

dayjs.extend(duration);

export default function ManualTimeModal({ initialData }: ManualTimeModalPageProps) {
  const { dragonUser } = useAuth();

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [projects] = useProjectsQuery();

  const [createNewTime] = useMutation(addNewtimeMutation, {
    refetchQueries: ['timers']
  });

  const toast = useRef<any>(null);

  const defaultValues = {
    project_id: undefined,
    start_time: '',
    end_time: '',
    description: ''
  };

  const formHook = useForm({ defaultValues });
  const { watch } = formHook;

  const startTime = watch('start_time');
  const endTime = watch('end_time');

  const newEntryDuration = calculateFormattedTimeDifference(startTime, endTime);

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast} />

      <Button label="Add time" icon="pi pi-plus" onClick={() => setVisible(true)} />

      <Dialog
        header="Add new time"
        visible={visible}
        style={{ width: '70vw' }}
        onHide={() => setVisible(false)}
      >
        {/* @ts-ignore */}
        <CustomForm formHook={formHook} onSubmit={onSubmit} resetOnSubmit data-cy="secret-key-form">
          {({ InputText, InputTextArea, InputCalendar, InputDropdown }) => (
            <>
              <InputDropdown
                placeholder="Select project"
                label="Projects"
                name="project_id"
                optionLabel="name"
                optionValue="id"
                options={projects}
                isRequired
              />

              <InputCalendar
                label="Start time"
                name="start_time"
                isRequired
                showIcon
                showTime
                hourFormat="12"
              />

              <InputCalendar
                label="End time"
                name="end_time"
                isRequired
                showIcon
                showTime
                hourFormat="12"
              />

              <InputTextArea label="Description" name="description" />
              <InputText label="Total time" value={newEntryDuration} disabled />

              <FormFooterButtons hideCancel loading={loading} onSubmit={onSubmit} />
            </>
          )}
        </CustomForm>
      </Dialog>
    </div>
  );

  async function onSubmit(data) {
    setLoading(true);

    try {
      if (initialData) {
        // Handle editing
        toast?.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'New time is updated!',
          life: 3000
        });
      } else {
        await createNewTime({
          variables: {
            ...data,
            userId: dragonUser?.id
          }
        });
        toast?.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'New time is created!',
          life: 3000
        });
      }
    } catch {
      setLoading(false);
      // Show error toast
      toast?.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: `Failed to ${initialData ? 'update' : 'create'} new time`,
        life: 3000
      });
    } finally {
      setVisible(false);
      setLoading(false);
    }
  }

  function calculateFormattedTimeDifference(startTime, endTime) {
    if (!endTime || !startTime) {
      return '0h 0m 0s';
    }

    const startDateTime = dayjs(startTime);
    const endDateTime = dayjs(endTime);

    const timeDifferenceInMilliseconds = endDateTime.diff(startDateTime);

    const duration = dayjs.duration(timeDifferenceInMilliseconds);

    const formattedDuration = duration.format('H[h] m[m] s[s]');

    return formattedDuration;
  }
}
