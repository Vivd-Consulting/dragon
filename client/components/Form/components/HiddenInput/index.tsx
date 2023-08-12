import { useEffect } from 'react';
import { UseFormRegister } from 'react-hook-form/dist/types/form';

type HiddenInputProps = {
  name: string;
  value: string;
  register: UseFormRegister<any>;
  setValue: any;
};

export function HiddenInput({ name, value, register, setValue }: HiddenInputProps) {
  useEffect(() => {
    setValue(name, value);
  }, [setValue, name, value]);

  return <input type="hidden" {...register(name)} />;
}
