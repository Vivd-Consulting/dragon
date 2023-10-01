import { Card } from 'primereact/card';

import { Row, Column } from 'components/Group';

import { Role } from 'types/roles';

import TransactionList from './components/TransactionList';

export default function Contractors() {
  return (
    <Column gap="4" fullWidth>
      <Card
        header={
          <Row justify="between" align="center" mx={4} mt={4}>
            <h2 className="my-0">Transactions</h2>
          </Row>
        }
      >
        <TransactionList />
      </Card>
    </Column>
  );
}

Contractors.roles = [Role.Admin];
