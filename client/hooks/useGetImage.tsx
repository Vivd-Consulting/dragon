import useSWR from 'swr';

import { useAuth } from 'hooks/useAuth';

export default function useGetImage(s3Key) {
  const { token } = useAuth();

  const fetcher = url =>
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => URL.createObjectURL(blob));

  const { data } = useSWR(`${process.env.NEXT_PUBLIC_API_HOST}/storage/file/${s3Key}`, fetcher);

  return data;
}
