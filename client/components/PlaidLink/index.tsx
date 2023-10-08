import React, { useCallback, useEffect } from 'react';
import { v4 } from 'uuid';
import { usePlaidLink } from 'react-plaid-link';
import Button from 'plaid-threads/Button';

import { useAuth } from 'hooks/useAuth';

// const config: Parameters<typeof usePlaidLink>[0] = {
//   token: v4()!,
//   onSuccess: () => {}
// };

export default function PlaidLink() {
  const { plaidLinkToken } = useAuth();

  const config: Parameters<typeof usePlaidLink>[0] = {
    token: plaidLinkToken,
    onSuccess
  };

  console.log(plaidLinkToken);
  // Generate a random token
  // const linkToken = v4();

  // const onSuccess = useCallback(
  //   async (public_token: string) => {
  //     // If the access_token is needed, send public_token to server
  //     const response = await fetch('/api/exchangePlaidToken', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({ public_token })
  //     });

  //     if (!response.ok) {
  //       // Handle the error
  //       // {
  //       //   itemId: `no item_id retrieved`,
  //       //   accessToken: `no access_token retrieved`,
  //       //   isItemAccess: false,
  //       // }
  //       return;
  //     }

  //     const data = await response.json();

  //     // {
  //     //   itemId: data.item_id,
  //     //   accessToken: data.access_token,
  //     //   isItemAccess: true
  //     // }
  //     onSuccessCallback(data);
  //   },
  //   [onSuccessCallback]
  // );

  let isOauth = false;
  // const config: Parameters<typeof usePlaidLink>[0] = {
  //   token: linkToken!,
  //   onSuccess: () => {}
  // };

  // if (window.location.href.includes('?oauth_state_id=')) {
  //   // TODO: figure out how to delete this ts-ignore
  //   // @ts-ignore
  //   config.receivedRedirectUri = window.location.href;
  //   isOauth = true;
  // }

  const { open, ready } = usePlaidLink(config);

  console.log({
    config,
    ready
  });

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
}

async function onSuccess(public_token: string) {
  // If the access_token is needed, send public_token to server
  const response = await fetch('/api/plaid/exchangeToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
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

PlaidLink.displayName = 'Link';
