import { InputSwitch as PrimeInputSwitch } from 'primereact/inputswitch';
import { Control, FieldErrors } from 'react-hook-form';
import cx from 'clsx';

import { FormField } from 'components/Form';

import styles from './styles.module.sass';

type InputSwitchProps = {
  label?: string;
  labelAlign?: 'x' | 'y';
  name: string;
  checked?: boolean;
  controlProps: { errors: FieldErrors; control: Control };
  fullWidth?: boolean;
  isRequired?: boolean;
  onChange?: (e: any) => void;
  tutorial?: string;
  className?: string;
  [key: string]: any;
};

export function InputSwitch({
  label,
  labelAlign,
  name,
  checked,
  controlProps,
  fullWidth,
  isRequired,
  onChange,
  tutorial,
  className,
  ...props
}: InputSwitchProps) {
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
        <PrimeInputSwitch
          id={field.name}
          {...field}
          className={cx(labelAlign === 'x' ? styles.inputSwitchY : styles.inputSwitch, {
            'p-invalid': fieldState.error
          })}
          checked={field.value}
          onChange={e => {
            onChange && onChange(e);
            return field.onChange(e);
          }}
          {...props}
        />
      )}
    </FormField>
  );
}
