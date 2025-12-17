import React, { useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from 'primereact/button';

import usePlaidLinkToken from 'hooks/usePlaidLinkToken';

export function PlaidLink({ onSuccess, onFail }) {
  const [plaidLinkToken, loading] = usePlaidLinkToken();

  if (loading) {
    return <Button type="button" icon="pi pi-spin pi-spinner" label="Link Account" disabled />;
  }

  return (
    <PlaidLinkButton
      plaidLinkToken={plaidLinkToken}
      onSuccessCallback={onSuccess}
      onFailCallback={onFail}
    />
  );
}

function PlaidLinkButton({ plaidLinkToken, onSuccessCallback, onFailCallback }) {
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: plaidLinkToken,
    onSuccess: publicToken => onSuccess(publicToken),
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
      onFailCallback();
      return;
    }

    const data = await response.json();

    onSuccessCallback(data);
  }
}

export function UpdatePlaidLink({ oldToken, onSuccess, onFail }) {
  const [plaidLinkToken, loading] = usePlaidLinkToken(null, oldToken);

  if (loading) {
    return <Button type="button" icon="pi pi-spin pi-spinner" label="Update Account" disabled />;
  }

  return (
    <UpdatePlaidLinkButton
      plaidLinkToken={plaidLinkToken}
      oldToken={oldToken}
      onSuccessCallback={onSuccess}
      onFailCallback={onFail}
    />
  );
}

function UpdatePlaidLinkButton({
  plaidLinkToken,
  oldToken,
  onSuccessCallback,
  onFailCallback
}) {
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: plaidLinkToken,
    onSuccess: response => onSuccess(response, oldToken),
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
      icon="pi pi-refresh"
      label="Update Account"
      disabled={!ready}
    />
  );

  async function onSuccess(newToken: string, oldToken: string) {
    const response = await fetch('/api/plaid/updateLinkTokenSuccess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newToken, oldToken })
    });

    if (!response.ok) {
      onFailCallback();
      return;
    }

    const data = await response.json();

    onSuccessCallback(data);
  }
}
