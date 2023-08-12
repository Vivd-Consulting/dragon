import { useState, useEffect } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';

interface Result<T> {
  data: T | null;
}

// TODO: Phase out usage of this hook
export function useQueryOnce<T, R>(query, options = {}) {
  const [result, setResult] = useState<Result<any>>({ data: null });

  const [callback] = useLazyQuery(query, options);

  useEffect(() => {
    // @ts-ignore
    if (!result.data && !options?.skip) {
      callback(options).then(_result => {
        // @ts-ignore
        setResult(_result);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return result;
}

export function _useQueryOnce<T, R>(query, options) {
  const [skip, setSkip] = useState(false);

  const result = useQuery(query, {
    skip: skip,
    ...options
  });

  const { loading, data } = result;

  useEffect(() => {
    if (!loading && !!data) {
      setSkip(true);
    }
  }, [data, loading]);

  return result;
}
