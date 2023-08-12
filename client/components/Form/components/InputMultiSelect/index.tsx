import { MultiSelect as PrimeMultiSelect } from 'primereact/multiselect';
import { Control, FieldErrors } from 'react-hook-form';
import cx from 'clsx';

import { FormField } from 'components/Form';

type Option = {
  label: string;
  value: string;
};

type InputMultiSelectProps = {
  label: string;
  name: string;
  options: Option[];
  controlProps: { errors: FieldErrors; control: Control };
  isRequired?: boolean;
  fullWidth?: boolean;
  tutorial?: string | (() => void);
  onChange?: (e: any) => void;
  [key: string]: any;
};

export function InputMultiSelect({
  label,
  name,
  options,
  controlProps,
  isRequired,
  fullWidth,
  tutorial,
  onChange,
  ...props
}: InputMultiSelectProps) {
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
          <PrimeMultiSelect
            id={field.name}
            {...field}
            className={cx({ 'p-invalid': fieldState.error })}
            options={options}
            display="chip"
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
