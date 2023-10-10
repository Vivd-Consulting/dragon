import { InputNumber as PrimeInputNumber } from 'primereact/inputnumber';
import cx from 'clsx';

import { FormField } from 'components/Form';

type InputNumberProps = {
  label: string;
  name: string;
  isRequired?: boolean;
  isDecimal?: boolean;
  formHook?: any;
  fullWidth?: boolean;
  tutorial?: string | (() => void);
  [key: string]: any;
};

export function InputNumber({
  label,
  name,
  isRequired,
  formHook,
  isDecimal,
  fullWidth,
  tutorial,
  ...props
}: InputNumberProps) {
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
      {(field, fieldState) => (
        <PrimeInputNumber
          id={field.name}
          {...field}
          minFractionDigits={isDecimal ? 1 : field.minFractionDigits}
          mode={isDecimal ? 'decimal' : field.mode}
          className={cx({ 'p-invalid': fieldState.error })}
          onChange={({ value }) => field.onChange(value)}
          {...props}
        />
      )}
    </FormField>
  );
}
