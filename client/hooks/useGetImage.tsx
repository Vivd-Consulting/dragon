import useSWR from 'swr';

export default function useGetImage(s3Key) {
  const fetcher = url =>
    fetch(url)
      .then(res => res.blob())
      .then(blob => URL.createObjectURL(blob));

  const { data } = useSWR(`${process.env.NEXT_PUBLIC_API_HOST}/storage/file/${s3Key}`, fetcher);

  return data;
}
