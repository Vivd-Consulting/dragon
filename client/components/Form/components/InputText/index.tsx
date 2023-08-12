import { Control, FieldErrors } from 'react-hook-form';
import { InputText as PrimeInputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import cx from 'clsx';

import { FormField } from 'components/Form';

import { checkLinkIsSafe } from 'utils';

type InputTextProps = {
  label?: string;
  name?: string;
  isRequired?: boolean;
  pattern?: RegExp;
  validate?: (value: any) => boolean | string;
  isPassword?: boolean;
  clearErrors?: (name: string) => void;
  autoFocus?: boolean;
  controlProps: { errors: FieldErrors; control: Control };
  fullWidth?: boolean;
  visible?: boolean;
  tutorial?: string | (() => void);
  onFailsValidation?: () => void;
  className?: string;
  [key: string]: any;
};

export function InputText({
  label,
  name,
  isRequired,
  pattern,
  validate,
  isPassword,
  clearErrors,
  autoFocus,
  controlProps,
  fullWidth,
  visible,
  tutorial,
  onFailsValidation,
  ...props
}: InputTextProps) {
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
      pattern={pattern}
      validate={validate}
    >
      {(field, fieldState) =>
        !isPassword ? (
          <PrimeInputText
            id={field.name}
            {...field}
            className={cx({ 'p-invalid': fieldState.error })}
            onChange={e => {
              if (clearErrors && fieldState.error) {
                clearErrors(name ?? '');
              }
              return field.onChange(e);
            }}
            {...props}
            onBlur={e => {
              if (onFailsValidation) {
                validateLink(e);
              }

              if (props.onBlur) {
                return props.onBlur(e);
              }
            }}
          />
        ) : (
          // eslint-disable-next-line react/jsx-no-undef
          <Password
            id={field.name}
            {...field}
            className={cx({ 'p-invalid': fieldState.error })}
            onChange={e => {
              if (clearErrors && fieldState.error) {
                clearErrors(name ?? '');
              }
              return field.onChange(e);
            }}
            {...props}
          />
        )
      }
    </FormField>
  );

  async function validateLink(event) {
    const link = event.target.value;
    const isSafe = await checkLinkIsSafe(link);

    if (!isSafe) {
      return onFailsValidation ? onFailsValidation() : null;
    }
  }
}
