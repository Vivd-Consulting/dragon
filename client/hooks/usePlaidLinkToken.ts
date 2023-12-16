import useSWR from 'swr';

export default function usePlaidLinkToken(accessToken, oldBankToken = null) {
  const fetcher = url =>
    fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(res => res.json());

  const url = oldBankToken
    ? `/api/plaid/updateLinkToken?accessToken=${oldBankToken}`
    : '/api/plaid/createLinkToken';

  const { data, isLoading } = useSWR(url, fetcher);

  return [data?.link_token, isLoading];
}
