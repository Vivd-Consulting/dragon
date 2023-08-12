import { useRouter } from 'next/router';

interface useLocationSearchParams {
  key: string;
  initialValue?: any;
}

export default function useLocationSearch({ key, initialValue }: useLocationSearchParams) {
  const router = useRouter();

  const queryString = router.query;
  const keyValue = queryString?.[key] || initialValue;

  return [keyValue, push];

  function push(value: any) {
    return router.push({ query: { ...router.query, [key]: value } });
  }
}

export function useSearch() {
  return useLocationSearch({ key: 'search', initialValue: '' });
}
