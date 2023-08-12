import { useState } from 'react';
import { useDebounce } from 'ahooks';

export default function useDebounceState(
  initialValue?: string,
  { wait = 250 } = {}
): [string | undefined, (value?: string) => void, string | undefined] {
  const [value, setValue] = useState(initialValue);
  const debounceValue = useDebounce(value, { wait });

  return [value, setValue, debounceValue];
}
