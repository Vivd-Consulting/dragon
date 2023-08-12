import { Calendar } from 'primereact/calendar';
import { Control, FieldErrors } from 'react-hook-form';
import cx from 'clsx';

import { FormField } from 'components/Form';

type InputCalendarProps = {
  label: string;
  name: string;
  controlProps: { errors: FieldErrors; control: Control };
  fullWidth?: boolean;
  isRequired?: boolean;
  tutorial?: string | (() => void);
  onChange?: (e: any) => void;
  [key: string]: any;
};

export function InputCalendar({
  label,
  name,
  controlProps,
  fullWidth,
  isRequired,
  tutorial,
  onChange,
  ...props
}: InputCalendarProps) {
  const { control, errors } = controlProps;

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
        return (
          <Calendar
            id={field.name}
            {...field}
            className={cx({ 'p-invalid': fieldState.error })}
            onChange={e => {
              onChange && onChange(e.value);
              return field.onChange(e);
            }}
            {...props}
          />
        );
      }}
    </FormField>
  );
}
