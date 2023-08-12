import React from 'react';
import { useForm } from 'react-hook-form';
import cx from 'clsx';

import { ManagedFormInput } from 'components/Form';

type FormProps = {
  defaultValues?: Record<string, any>;
  resetOnSubmit?: boolean;
  onSubmit?: (data: Record<string, any>) => void;
  className?: string;
  'data-cy'?: string;
  children: (managedInputs: ReturnType<typeof ManagedFormInput>) => React.ReactNode;
};

export function Form({
  defaultValues = {},
  onSubmit,
  resetOnSubmit,
  className,
  'data-cy': dataCy,
  children
}: FormProps) {
  const formHook = useForm({ defaultValues });
  const { handleSubmit, reset } = formHook;

  const managedInputs = ManagedFormInput({ formHook });
  const klass = cx('p-fluid', className);

  return onSubmit ? (
    <form onSubmit={handleSubmit(_onSubmit)} className={klass} data-cy={dataCy}>
      {children(managedInputs)}
    </form>
  ) : (
    <form className={klass} data-cy={dataCy}>
      {children(managedInputs)}
    </form>
  );

  function _onSubmit(data) {
    if (resetOnSubmit) {
      reset();
    }

    onSubmit?.(data);
  }
}
