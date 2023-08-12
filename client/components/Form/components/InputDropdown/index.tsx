import { Dropdown } from 'primereact/dropdown';
import { Control, FieldErrors } from 'react-hook-form';
import cx from 'clsx';

import { FormField } from 'components/Form';

type Option = {
  label: string;
  value: string;
};

export type InputDropdownProps = {
  label: string;
  name: string;
  isRequired?: boolean;
  options: Option[];
  onChange?: (e: any) => void;
  fullWidth?: boolean;
  className?: string;
  tutorial?: string | (() => void);
  [key: string]: any;
};

export type InputDropdownControlProps = InputDropdownProps & {
  controlProps: { errors: FieldErrors; control: Control };
};

export function InputDropdown({
  label,
  name,
  isRequired,
  options,
  controlProps,
  onChange,
  fullWidth,
  className,
  tutorial,
  ...props
}: InputDropdownControlProps) {
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
      className={className}
    >
      {(field, fieldState) => (
        <Dropdown
          id={field.name}
          value={field.value}
          onChange={e => {
            onChange && onChange(e);
            return field.onChange(e);
          }}
          options={options}
          className={cx({ 'p-invalid': fieldState.error })}
          placeholder="None"
          {...props}
        />
      )}
    </FormField>
  );
}
