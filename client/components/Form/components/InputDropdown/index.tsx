import { Dropdown } from 'primereact/dropdown';
import cx from 'clsx';

import { FormField } from 'components/Form';

export type InputDropdownProps = {
  label: string;
  name: string;
  isRequired?: boolean;
  options: any[];
  onChange?: (e: any) => void;
  fullWidth?: boolean;
  className?: string;
  tutorial?: string | (() => void);
  [key: string]: any;
};

export function InputDropdown({
  label,
  name,
  isRequired,
  options,
  formHook,
  onChange,
  fullWidth,
  className,
  tutorial,
  ...props
}: InputDropdownProps) {
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
