import { useUpdateEffect } from 'ahooks';
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

  useUpdateEffect(() => {
    onChange(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  if (icon) {
    return (
      <span className="p-input-icon-left">
        <i className={`pi ${icon}`} />

        <PrimeInputText value={internalValue} onChange={handleChange} {...rest} />
      </span>
    );
  }

  return <PrimeInputText value={internalValue} onChange={handleChange} {...rest} />;

  function handleChange(e) {
    setInternalValue(e.target.value);
  }
}
