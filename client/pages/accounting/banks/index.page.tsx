import React, { useState } from 'react';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

import { Row, Column } from 'components/Group';
import { PlaidLink } from 'components/PlaidLink';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';

import BankList from './components/BankList';

import banksQuery from './queries/banks.gql';

export default function Banks() {
  const bankQuery = usePaginatedQuery(banksQuery, {
    fetchPolicy: 'no-cache'
  });
  const {
    query: { refetch }
  } = bankQuery;

  const [testButtonDisabled, setTestButtonDisabled] = useState(false);

  return (
    <Column gap="4" fullWidth>
      <Card
        header={
          <Row justify="between" align="center" mx={4} mt={4}>
            <h2 className="my-0">Imported Banks</h2>

            <Row>
              <Button
                onClick={testAccountFetching}
                label="Test Accounts"
                icon="pi pi-question-circle"
                severity="warning"
                loading={testButtonDisabled}
              />
              <PlaidLink onSuccess={onSuccessLink} onFail={onFailLink} />
            </Row>
          </Row>
        }
      >
        <BankList paginatedQuery={bankQuery} />
      </Card>
    </Column>
  );

  function onSuccessLink() {
    refetch();

    // toast.current.show({
    //   severity: 'success',
    //   summary: 'Success',
    //   detail: 'Bank is successfully linked!',
    //   life: 3000
    // });
  }

  function onFailLink() {
    // toast.current.show({
    //   severity: 'error',
    //   summary: 'Error',
    //   detail: 'Bank failed to link!',
    //   life: 3000
    // });
  }

  async function testAccountFetching() {
    setTestButtonDisabled(true);

    // If the access_token is needed, send public_token to server
    const response = await fetch('/api/plaid/testAccounts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error({
        testAccountFetching: data
      });
      return;
    }

    // eslint-disable-next-line no-console
    console.log({
      testAccountFetching: data
    });

    setTestButtonDisabled(false);
    refetch();
  }
}
