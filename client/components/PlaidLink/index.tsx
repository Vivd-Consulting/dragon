import React, { useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from 'primereact/button';

import { useAuth } from 'hooks/useAuth';
import usePlaidLinkToken from 'hooks/usePlaidLinkToken';

export default function PlaidLink({ onSuccess, onFail }) {
  const { token: authToken } = useAuth();
  const [plaidLinkToken, loading] = usePlaidLinkToken(authToken);

  if (loading) {
    return <Button type="button" icon="pi pi-spin pi-spinner" label="Link Account" disabled />;
  }

  return (
    <PlaidLinkButton
      plaidLinkToken={plaidLinkToken}
      authToken={authToken}
      onSuccessCallback={onSuccess}
      onFailCallback={onFail}
    />
  );
}

function PlaidLinkButton({ plaidLinkToken, authToken, onSuccessCallback, onFailCallback }) {
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: plaidLinkToken,
    onSuccess: publicToken => onSuccess(publicToken, authToken),
    onEvent: eventName => {
      if (eventName === 'HANDOFF') {
        isOauth = true;
      }
    }
  };

  let isOauth = false;

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (isOauth && ready) {
      open();
    }
  }, [ready, open, isOauth]);

  return (
    <Button
      type="button"
      onClick={() => open()}
      icon="pi pi-plus"
      label="Link Account"
      disabled={!ready}
    />
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
      onFailCallback();
      return;
    }

    const data = await response.json();

    onSuccessCallback(data);
  }
}
