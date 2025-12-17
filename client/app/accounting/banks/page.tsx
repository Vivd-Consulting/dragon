'use client';

import { useState } from 'react';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

import { Row, Column } from '@/components/Group';
import { PlaidLink } from '@/components/PlaidLink';

import BankList from './components/BankList';
import { getBanks } from '@/app/actions/banks';

export default function Banks() {
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
        <BankList />
      </Card>
    </Column>
  );

  function onSuccessLink() {
    // Refetch will be handled by BankList component
  }

  function onFailLink() {
    // Handle failure
  }

  async function testAccountFetching() {
    setTestButtonDisabled(true);

    try {
      const response = await fetch('/api/plaid/testAccounts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error({ testAccountFetching: data });
        return;
      }

      console.log({ testAccountFetching: data });
    } catch (error) {
      console.error(error);
    } finally {
      setTestButtonDisabled(false);
    }
  }
}
