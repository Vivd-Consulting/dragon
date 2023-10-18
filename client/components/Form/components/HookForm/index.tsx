import { useForm, UseFormReturn } from 'react-hook-form';
import React, { useMemo, useCallback } from 'react';
import cx from 'clsx';

import { Row, Column, GroupProps } from 'components/Group';

type HookFormProps = {
  formHook: UseFormReturn;
  onSubmit?: (data: any) => void;
  resetOnSubmit?: boolean;
  className?: string | null;
  children: any; // TODO: React.ReactNode;
  'data-cy'?: string | null;
};

export function HookForm({
  formHook,
  onSubmit,
  resetOnSubmit,
  className,
  children,
  'data-cy': dataCy
}: HookFormProps) {
  const { handleSubmit, formState, reset } = formHook;

  // Inject the formHook into any child components, and recursively pass it down to their children
  const childrenWithProps = useMemo(
    () =>
      React.Children.map(children, child =>
        React.cloneElement(child, {
          formHook,
          // disabled should use the existing child prop value if it exists, otherwise default to formState.isSubmitting
          disabled: child.props.disabled ?? formState.isSubmitting
        })
      ),
    [children, formHook, formState]
  );

  const klass = cx('p-fluid', className);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _onSubmitCb = useCallback(_onSubmit, []);

  return onSubmit ? (
    <form onSubmit={handleSubmit(_onSubmitCb)} className={klass} data-cy={dataCy}>
      {childrenWithProps}
    </form>
  ) : (
    <form className={klass} data-cy={dataCy}>
      {childrenWithProps}
    </form>
  );

  function _onSubmit(data) {
    if (resetOnSubmit) {
      reset();
    }

    return onSubmit?.(data);
  }
}

type HookGroupProps = {
  children: any; // TODO: React.ReactNode;
} & GroupProps;

export function HookRow({ formHook, children, ...props }: HookGroupProps) {
  const { formState } = formHook;

  return (
    <Row {...props}>
      {React.Children.map(children, child =>
        React.cloneElement(child, {
          formHook,
          disabled: child.props.disabled ?? formState.isSubmitting
        })
      )}
    </Row>
  );
}

export function HookColumn({ formHook, children, ...props }: HookGroupProps) {
  const { formState } = formHook;

  return (
    <Column {...props}>
      {React.Children.map(children, child =>
        React.cloneElement(child, {
          formHook,
          disabled: child.props.disabled ?? formState.isSubmitting
        })
      )}
    </Column>
  );
}

type FormProps = {
  defaultValues?: any;
  onSubmit?: (data: any) => void;
  resetOnSubmit?: boolean;
  className?: string | null;
  children: any; // TODO: React.ReactNode;
  'data-cy'?: string | null;
};

export function Form({
  defaultValues,
  onSubmit,
  resetOnSubmit,
  className,
  children,
  'data-cy': dataCy
}: FormProps) {
  const formHook = useForm({ defaultValues });

  return (
    <HookForm
      formHook={formHook}
      onSubmit={onSubmit}
      resetOnSubmit={resetOnSubmit}
      className={className}
      data-cy={dataCy}
    >
      {children}
    </HookForm>
  );
}
