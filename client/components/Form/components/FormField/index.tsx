import cx from 'clsx';

import { Controller, FieldError, FieldErrors } from 'react-hook-form';

import { Row } from 'components/Group';
import TooltipIcon from 'components/Tooltip';

import styles from './styles.module.sass';

type FormFieldProps = {
  label: string | undefined;
  name?: string;
  isRequired?: boolean;
  control: any;
  pattern?: RegExp;
  validate?: (value: any) => boolean | string;
  errors?: FieldErrors<any> | undefined;
  fullWidth?: boolean;
  tutorial?: boolean | string | (() => void) | undefined;
  tutorialKey?: string;
  className?: string;
  children?: (field: any, fieldState: any) => JSX.Element;
};
export function FormField({
  label,
  name,
  isRequired = false,
  control,
  pattern,
  validate,
  errors,
  fullWidth,
  tutorial,
  tutorialKey,
  className,
  children
}: FormFieldProps) {
  const klass = cx('field', fullWidth && 'w-full', className);

  const accessors = name?.split('.');
  let error: FieldError | undefined = undefined;

  if (accessors) {
    for (const a of accessors) {
      if (!errors) {
        break;
      }

      error = errors[a] as FieldError;
    }
  }

  const tutorialIsFn = typeof tutorial === 'function';
  const _tutorialKey = tutorialKey || name?.replace(/\./g, '-');

  return (
    <div className={klass}>
      <Row className="mb-1">
        <label htmlFor={name} className={cx(styles.inputLabel, error && 'p-error')}>
          {isRequired && <span className="text-red-500">*</span>}
          {label}
        </label>
        {tutorial &&
          (tutorialIsFn ? (
            <TooltipIcon onClick={() => tutorial()} />
          ) : (
            <TooltipIcon tutorialKey={_tutorialKey}>{tutorial}</TooltipIcon>
          ))}
      </Row>
      <Controller
        name={name ?? ''}
        control={control}
        rules={{
          required: isRequired ? `${label} is required.` : false,
          pattern: pattern,
          validate: validate
        }}
        render={({ field, fieldState }) => (children ? children(field, fieldState) : <div></div>)}
      />
      {error && <small className="p-error">{error.message}</small>}
    </div>
  );
}
