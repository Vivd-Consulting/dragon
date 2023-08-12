import { UseFormReturn } from 'react-hook-form';

import { FormField } from 'components/Form';

type HiddenInputTextProps = {
  label: string;
  name: string;
  isRequired?: boolean;
  controlProps: UseFormReturn<{}, any>;
  fullWidth?: boolean;
  className?: string;
  tutorial?: string;
  [key: string]: any;
};

export function HiddenInputText({
  label,
  name,
  isRequired,
  controlProps,
  fullWidth,
  className,
  tutorial,
  ...props
}: HiddenInputTextProps) {
  const {
    control,
    formState: { errors }
  } = controlProps;

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
      {field => <input type="hidden" id={field.name} {...field} {...props} />}
    </FormField>
  );
}
