import { UseFormReturn } from 'react-hook-form';
import { Calendar } from 'primereact/calendar';
import cx from 'clsx';

import { FormField } from 'components/Form';

type InputCalendarProps = {
  label: string;
  name: string;
  fullWidth?: boolean;
  isRequired?: boolean;
  tutorial?: string | (() => void);
  onChange?: (e: any) => void;
  [key: string]: any;
};

export function InputCalendar({
  label,
  name,
  formHook,
  fullWidth,
  isRequired,
  tutorial,
  onChange,
  ...props
}: InputCalendarProps) {
  const {
    control,
    formState: { errors }
  } = formHook;

  return (
    <FormField
      label={label}
      name={name}
      isRequired={isRequired}
      control={control}
      errors={errors}
      fullWidth={fullWidth}
      tutorial={tutorial}
    >
      {(field, fieldState) => {
        const value = field.value
          ? typeof field.value === 'string'
            ? new Date(field.value)
            : field.value
          : null;

        return (
          <Calendar
            id={field.name}
            className={cx({ 'p-invalid': fieldState.error })}
            {...field}
            value={value}
            {...props}
            onChange={e => {
              onChange && onChange(e.value);
              return field.onChange(e);
            }}
          />
        );
      }}
    </FormField>
  );
}
