import { Control, FieldErrors } from 'react-hook-form';
import { InputNumber as PrimeInputNumber } from 'primereact/inputnumber';
import cx from 'clsx';

import { FormField } from 'components/Form';

type InputNumberProps = {
  label: string;
  name: string;
  isRequired?: boolean;
  isDecimal?: boolean;
  controlProps: { errors: FieldErrors; control: Control };
  fullWidth?: boolean;
  tutorial?: string | (() => void);
  [key: string]: any;
};

export function InputNumber({
  label,
  name,
  isRequired,
  controlProps,
  isDecimal,
  fullWidth,
  tutorial,
  ...props
}: InputNumberProps) {
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
