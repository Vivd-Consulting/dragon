import { UseFormReturn } from 'react-hook-form';
import { InputTextarea as PrimeInputTextarea } from 'primereact/inputtextarea';
import cx from 'clsx';

import { FormField } from 'components/Form';

import styles from './styles.module.sass';

type InputTextAreaProps = {
  label?: string;
  name?: string;
  isRequired?: boolean;
  autoFocus?: boolean;
  fullWidth?: boolean;
  halfWidth?: boolean;
  tutorial?: boolean;
  tutorialKey?: string;
  size?: 'xl' | 'lg' | 'md' | 'sm';
  [key: string]: any;
};

export function InputTextArea({
  label,
  name,
  isRequired,
  formHook,
  tutorial,
  tutorialKey,
  fullWidth,
  size = 'md',
  ...props
}: InputTextAreaProps) {
  const {
    control,
    formState: { errors }
  } = formHook;

  const sizeStyle = {
    xl: styles.inputTextAreaXLarge,
    lg: styles.inputTextAreaLarge,
    md: styles.inputTextArea,
    sm: styles.inputTextAreaSmall
  }[size];

  return (
    <FormField
      label={label}
      name={name}
      isRequired={isRequired}
      control={control}
      errors={errors}
      fullWidth={fullWidth}
      tutorial={tutorial}
      tutorialKey={tutorialKey}
    >
      {(field, fieldState) => (
        <PrimeInputTextarea
          id={field.name}
          {...field}
          className={cx(sizeStyle, { 'p-invalid': fieldState.error })}
          {...props}
        />
      )}
    </FormField>
  );
}
