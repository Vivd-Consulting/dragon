import { useRef } from 'react';
import { useUpdateEffect, useKeyPress } from 'ahooks';
import { InputText as PrimeInputText } from 'primereact/inputtext';

import useDebounceState from 'hooks/useDebounceState';

type InputTextDebouncedProps = {
  value?: string;
  onChange: (value: string | undefined) => void;
  icon?: string;
  [key: string]: any;
};
export function InputTextDebounced({
  value = '',
  onChange,
  icon,
  ...rest
}: InputTextDebouncedProps) {
  const [internalValue, setInternalValue, debouncedValue] = useDebounceState(value);

  const inputRef = useRef<HTMLInputElement>(null);

  useKeyPress(['meta.shift.f'], () => {
    setInternalValue('');
    inputRef.current?.focus();
  });

  useUpdateEffect(() => {
    onChange(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  // If the value changes outside of this component, update the internal value
  useUpdateEffect(() => {
    setInternalValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (icon) {
    return (
      <span className="p-input-icon-left">
        <i className={`pi ${icon}`} />

        <PrimeInputText value={internalValue} onChange={handleChange} ref={inputRef} {...rest} />
      </span>
    );
  }

  return <PrimeInputText value={internalValue} onChange={handleChange} ref={inputRef} {...rest} />;

  function handleChange(e) {
    setInternalValue(e.target.value);
  }
}
