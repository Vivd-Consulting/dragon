import React, { useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import Button from 'plaid-threads/Button';

import { useAuth } from 'hooks/useAuth';

export default function PlaidLink() {
  const { plaidLinkToken, token: authToken } = useAuth();

  const config: Parameters<typeof usePlaidLink>[0] = {
    token: plaidLinkToken,
    onSuccess: publicToken => onSuccess(publicToken, authToken)
  };

  let isOauth = false;

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (isOauth && ready) {
      open();
    }
  }, [ready, open, isOauth]);

  return (
    <Button type="button" large onClick={() => open()} disabled={!ready}>
      Launch Link
    </Button>
  );

  async function onSuccess(public_token: string, authToken: string) {
    // If the access_token is needed, send public_token to server
    const response = await fetch('/api/plaid/exchangeToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ public_token })
    });

    if (!response.ok) {
      // Handle the error
      // {
      //   itemId: `no item_id retrieved`,
      //   accessToken: `no access_token retrieved`,
      //   isItemAccess: false,
      // }
      return;
    }

    const data = await response.json();

    // {
    //   itemId: data.item_id,
    //   accessToken: data.access_token,
    //   isItemAccess: true
    // }
    console.log(data);
  }
}

PlaidLink.displayName = 'Link';
