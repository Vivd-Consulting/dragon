import useSWR from 'swr';

export default function usePlaidLinkToken(accessToken = null, oldBankToken = null) {
  const fetcher = url =>
    fetch(url).then(res => res.json());

  const url = oldBankToken
    ? `/api/plaid/updateLinkToken?accessToken=${oldBankToken}`
    : '/api/plaid/createLinkToken';

  const { data, isLoading } = useSWR(url, fetcher);

  return [data?.link_token, isLoading];
}
