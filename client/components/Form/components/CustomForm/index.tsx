import React from 'react';
import cx from 'clsx';
import { UseFormReturn } from 'react-hook-form';

import { ManagedFormInput } from 'components/Form';

type CustomFormProps = {
  formHook: UseFormReturn;
  onSubmit?: (data: any) => void;
  resetOnSubmit?: boolean;
  className?: string | null;
  'data-cy'?: string | null;
  children: (managedInputs: ReturnType<typeof ManagedFormInput>) => React.ReactNode;
};

export function CustomForm({
  formHook,
  onSubmit,
  resetOnSubmit,
  className = null,
  'data-cy': dataCy = null,
  children
}: CustomFormProps) {
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
