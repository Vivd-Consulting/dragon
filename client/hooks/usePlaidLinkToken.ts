import useSWR from 'swr';

export default function usePlaidLinkToken(accessToken) {
  const fetcher = url =>
    fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(res => res.json());

  const { data } = useSWR('/api/plaid/createLinkToken', fetcher);

  return data?.link_token;
}
